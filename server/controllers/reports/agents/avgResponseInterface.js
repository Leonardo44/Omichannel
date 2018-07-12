const ObjectId = require('mongodb').ObjectId;
const dbContext = require('../../../src/connection');

const moment = require('moment');

moment().locale('es_sv')

module.exports = (req, res) => {

    try {
        dbContext(async (db, client) => {
    
            let frmData = {
                initDate: moment(`${req.body.intervalData.init.date} ${req.body.intervalData.init.time}`, 'YYYY-MM-DD H:mm'),
                endDate: moment(`${req.body.intervalData.end.date} ${req.body.intervalData.end.time}`, 'YYYY-MM-DD H:mm'),
                interval: {
                    type: req.body.interval.split(':')[0].toLowerCase(),
                    cant: parseInt(req.body.interval.split(':')[1])
                }
            }
            
            let data = {}, $flag = true, auxDate = [], msgData = [];
        
            if(ObjectId.isValid(req.body.agent_id)){
                const agent = await db.collection("agents").findOne({_id: ObjectId(req.body.agent_id)});
                
                if(agent !== null){
                    let $interfaces = [];
                    while($flag){
                        
                        if(auxDate.length === 0){
                            let auxLimit = frmData.initDate.clone();
                            auxLimit.add(frmData.interval.cant, frmData.interval.type)
                            
                            auxDate = [frmData.initDate.clone(), auxLimit.clone()];
                        }else{
                            let _aux = auxDate[1].clone();
                            
                            auxDate[0] = auxDate[1].clone();
                            auxDate[0].add(1, 'm');
                            // auxDate[0].add(1, frmData.interval.type);
                            // _aux = auxDate[0].clone();
                            
                            _aux.add(frmData.interval.cant, frmData.interval.type);
                            
                            if(_aux >= frmData.endDate){
                                auxDate[1] = frmData.endDate.clone();
                                $flag = false;
                            }else{
                                // auxDate[0].add(1, frmData.interval.type);
                                auxDate[1] = _aux.clone();
                            }
                        }

                        const $tickets = await db.collection("tickets").aggregate([ // Obtenemos los tickets
                            { 
                                $match: {
                                    "agent": ObjectId(agent._id),
                                    "last_msg_date": { //Fecha
                                        $gte: new Date(auxDate[0]),
                                        $lt: new Date(auxDate[1])
                                    }
                                }
                            }
                        ]).toArray();

                        const dateKey = `${moment(auxDate[0]).format('YYYY-MM-DD_HH:mm')}_-_${moment(auxDate[1]).format('YYYY-MM-DD_HH:mm')}`;
                        msgData[dateKey] = [];
        
                        for(let $t in $tickets){
                            const $messages = await db.collection("messages").aggregate([ { $match: { "ticket": ObjectId($tickets[$t]._id) } } ]).toArray();
                            
                            $messages.sort(function(a, b){
                                if( moment(a.date)  <  moment(b.date) ) { return -1; }
                                if( moment(a.date)  >  moment(b.date) ) { return 1; }
                                return 0;
                            });
                            let index_client = -1;

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

                                    if ($interfaces.indexOf(msgInterface) === -1) { $interfaces.push(msgInterface) }
                                    if(!msgData[dateKey].hasOwnProperty(msgInterface)){ msgData[dateKey][msgInterface] = []; }
                                    msgData[dateKey][msgInterface].push(rest_millisecind);
                                    index_client = -1;
                                }
                            }//for (let $d in $data_ticket[0].ticket_data.times)
                        }

                        for(let $i in $interfaces){
                            if(!data.hasOwnProperty(dateKey)){ data[dateKey] = {}; }
                            if(!data[dateKey].hasOwnProperty($interfaces[$i])){ data[dateKey][$interfaces[$i]] = {}; }

                            if(msgData[dateKey].hasOwnProperty($interfaces[$i])){
                                const avg = msgData[dateKey][$interfaces[$i]].reduce((sum, n) => sum + n, 0) / msgData[dateKey][$interfaces[$i]].length;
                                const duration_format = moment().month(0).date(1).hours(0).minutes(0).seconds(0).milliseconds(avg);
                                
                                data[dateKey][$interfaces[$i]] = (duration_format.format('H:mm:s'));
                            }else{
                                data[dateKey][$interfaces[$i]] = (0);
                            }
                        }//fin for(let $i in $interface)
                    }

                    res.send({
                        agent: agent.name,
                        interfaces: $interfaces,
                        data
                    });
                }else{
                    res.send({
                        msg: 'La cuenta a la que deseas acceder no existe!'
                    })
                }
            }else{
                res.send({
                    msg: "El ID posee un formato erróneo..."
                })
            }

            client.close();
        });
    } catch (error) {
        console.log(error);
        res.send({
            msg: 'Error'
        })
    }
}
