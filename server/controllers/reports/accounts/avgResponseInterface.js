const ObjectId = require('mongodb').ObjectId;
const dbContext = require('../../../src/connection');

const moment = require('moment');
const utils = require('../utils');

moment().locale('es_sv')

module.exports = (req, res) => {
    try {
        dbContext(async (db, client) => {
            
            let frmData = {
                init: {
                    date: req.body.intervalData.init.date,
                    time: req.body.intervalData.init.time,
                    moment: moment(`${req.body.intervalData.init.date} ${req.body.intervalData.init.time}`, 'YYYY-MM-DD HH:mm')
                },
                end: {
                    date: req.body.intervalData.end.date,
                    time: req.body.intervalData.end.time,
                    moment: moment(`${req.body.intervalData.end.date} ${req.body.intervalData.end.time}`, 'YYYY-MM-DD HH:mm')
                },
                interval: {
                    type: req.body.interval.split(':')[0].toLowerCase(),
                    cant: parseInt(req.body.interval.split(':')[1])
                }
            },

            data = {}, $flag = true, auxDate = [frmData.init.moment, null], msgData = [];

            const account = await db.collection("accounts").findOne({"_id": ObjectId(req.body.account_id)}); //Guardamos Información de la cuenta
            const $interfaces = account.interfaces;

            while($flag){
                auxDate = utils.getInterval(auxDate, frmData.init, frmData.end, frmData.interval)
                $flag = (auxDate[1].format('YYY-MM-DD HH:mm') !== frmData.end.moment.format('YYY-MM-DD HH:mm'))
                        
                const dateKey = `${moment(auxDate[0]).format('YYYY-MM-DD_HH:mm')}_-_${moment(auxDate[1]).format('YYYY-MM-DD_HH:mm')}`;
                msgData[dateKey] = [];
                console.log(18 >= 6);
                console.log("_____________________________________________________________________________________________");
                console.log(`Fecha Final: ${auxDate[1].format('H:mm:s')}. Fecha Final: ${frmData.endDate.format('H:mm:s')}.`);
                console.log( auxDate[1].format('H:mm:s') <= frmData.endDate.format('H:mm:s') );
                console.log(`Fecha Final: ${auxDate[1].format('H:mm:s')}. Fecha Final: ${frmData.initDate.format('H:mm:s')}.`);
                console.log( auxDate[1].format('H:mm:s') >= frmData.initDate.format('H:mm:s') );
                console.log(`Fecha Inicial: ${auxDate[0].format('H:mm:s')}. Fecha Final: ${frmData.endDate.format('H:mm:s')}.`);
                console.log( auxDate[0].format('H:mm:s') <= frmData.endDate.format('H:mm:s') );
                console.log(`Fecha Inicial: ${auxDate[0].format('H:mm:s')}. Fecha Final: ${frmData.initDate.format('H:mm:s')}.`);
                console.log( auxDate[0].format('H:mm:s') >= frmData.initDate.format('H:mm:s') );

                if((auxDate[1].format('H:mm:s') <= frmData.endDate.format('H:mm:s'))
                    && (auxDate[1].format('H:mm:s') >= frmData.initDate.format('H:mm:s'))
                    && (auxDate[0].format('H:mm:s') <= frmData.endDate.format('H:mm:s'))
                    && (auxDate[0].format('H:mm:s') >= frmData.initDate.format('H:mm:s'))){
                    const $tickets = await db.collection("tickets").aggregate([ // Obtenemos los tickets
                        { 
                            $match: {
                                "account": ObjectId(account._id),
                                "last_msg_date": { //Fecha
                                    $gte: new Date(auxDate[0]),
                                    $lt: new Date(auxDate[1])
                                }
                            }
                        }
                    ]).toArray();

                	for(let $t in $tickets){
                        const $messages = await db.collection("messages").aggregate([ { $match: { "ticket": ObjectId($tickets[$t]._id) } } ]).toArray();

                        $messages.sort(function(a, b){
                            if( moment(a.date)  <  moment(b.date) ) { return -1; }
                            if( moment(a.date)  >  moment(b.date) ) { return 1; }
                            return 0;
                        });
                        let index_client = -1;
                        console.log($tickets[$t]._id);
                        for(let $m in $messages){
                            /** 
                                "origin": "external" - Producido por cliente,
                                "origin": "boot" - Producido por boot, dah!,
                                "origin": "internal" - Producido por agente
                            */

                            if($messages[$m].origin === 'external'){ index_client = $m; } //Cliente 

                            if(($messages[$m].origin === 'internal') && (index_client != -1)){ //Agente
                                const msgInterface = $messages[$m].interface, 
                                    msg_client = moment($messages[index_client].date), 
                                    msg_agent = moment($messages[$m].date),
                                    rest_millisecind = msg_agent - msg_client
                                ;
                                if(!msgData[dateKey].hasOwnProperty(msgInterface)){ msgData[dateKey][msgInterface] = []; }
                                msgData[dateKey][msgInterface].push(rest_millisecind);
                                index_client = -1;
                            }
                        }//for (let $d in $data_ticket[0].ticket_data.times)
                    }//for (let $t in $tickets)

                    for(let $i in $interfaces){
                        if(!data.hasOwnProperty(dateKey)){ data[dateKey] = {}; }
                        if(!data[dateKey].hasOwnProperty($interfaces[$i].service)){ data[dateKey][$interfaces[$i].service] = {} }
                        
                        if(msgData[dateKey].hasOwnProperty($interfaces[$i].service)){
                            const avg = msgData[dateKey][$interfaces[$i].service].reduce((sum, n) => sum + n, 0) / msgData[dateKey][$interfaces[$i].service].length;
                            const duration_format = moment().month(0).date(1).hours(0).minutes(0).seconds(0).milliseconds(avg);
                            data[dateKey][$interfaces[$i].service] = (duration_format.format('H:mm:s'));
                        }else{
                            data[dateKey][$interfaces[$i].service] = (0);
                        }
                    }//fin for(let $i in $interface)
                }//fin if
            }//fin while($flag)
            res.send({ 
                account: account.name,
                interfaces: $interfaces.map(x => ({name: x.service, picture: x.picture})),
                data 
            });
            client.close();
        });
    } catch (error) {
        console.log(error);
        res.send({ msg: 'Error' })
    }
}