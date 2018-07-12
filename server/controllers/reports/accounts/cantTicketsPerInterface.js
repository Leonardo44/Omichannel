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
            }
            
            let data = {}, $flag = true, auxDate = [frmData.init.moment, null], msgData = [];
    
            const account = await db.collection("accounts").findOne({"_id": ObjectId(req.body.account_id)}); //Guardamos Información de la cuenta
            const $interfaces = account.interfaces;
            
            while($flag){    
                auxDate = utils.getInterval(auxDate, frmData.init, frmData.end, frmData.interval)
                $flag = (auxDate[1].format('YYY-MM-DD HH:mm') !== frmData.end.moment.format('YYY-MM-DD HH:mm'))
    
                const dateKey = `${moment(auxDate[0]).format('YYYY-MM-DD_HH:mm')}_-_${moment(auxDate[1]).format('YYYY-MM-DD_HH:mm')}`;
                msgData[dateKey] = [];

                const $tickets = await db.collection("tickets").aggregate([ //Obtenemos los tickets por cuenta iterada 
                    {
                        $lookup: {
                            from: 'messages',
                            localField: 'last_msg',
                            foreignField: '_id',
                            as: 'last_message'
                        }
                    },
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
                    if(!msgData[dateKey].hasOwnProperty($tickets[$t].last_message[0].interface)){ msgData[dateKey][$tickets[$t].last_message[0].interface] = 0; }
                    msgData[dateKey][$tickets[$t].last_message[0].interface] += 1;
                }

                for(var $i in $interfaces){
                    if(!data.hasOwnProperty(dateKey)){ data[dateKey] = {}; }
                    if(!data[dateKey].hasOwnProperty($interfaces[$i].service)){ data[dateKey][$interfaces[$i].service] = {} }

                    if(msgData[dateKey].hasOwnProperty($interfaces[$i].service)){
                        data[dateKey][$interfaces[$i].service] = msgData[dateKey][$interfaces[$i].service];
                    }else{
                        data[dateKey][$interfaces[$i].service] = 0;
                    }
                }
            }
            
            res.send({
                account: account.name,
                interfaces: $interfaces.map(x => ({name: x.service, picture: x.picture})),
                data
            });
            client.close(); //Cerrar conexión
        })
    } catch (error) {
        console.log(error);
        res.send({
            msg: 'Error'
        })
    }
}