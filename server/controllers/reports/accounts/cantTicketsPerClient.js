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
            data = {}, $flag = true, auxDate = [frmData.init.moment, null], msgData = {};

            const account = await db.collection("accounts").findOne({"_id": ObjectId(req.body.account_id)}); //Guardamos Información de la cuenta
            const organization = await db.collection("organizations").findOne({"_id": ObjectId(req.body.organization_id)}); //Guardamos información de orgnización

            while($flag){
                auxDate = utils.getInterval(auxDate, frmData.init, frmData.end, frmData.interval)
                $flag = (auxDate[1].format('YYY-MM-DD HH:mm') !== frmData.end.moment.format('YYY-MM-DD HH:mm'))
                
                const dateKey = `${moment(auxDate[0]).format('YYYY-MM-DD_HH:mm')}_-_${moment(auxDate[1]).format('YYYY-MM-DD_HH:mm')}`;
                msgData[dateKey] = [];

                const $tickets = await db.collection("tickets").aggregate([ //Obtenemos los tickets por cuenta iterada 
                    {
                        $lookup: {
                            from: 'clients',
                            localField: 'client',
                            foreignField: '_id',
                            as: 'client_data'
                        }
                    },
                    {
                        $match: {
                            "account": ObjectId(account._id),
                            "organization": ObjectId(organization._id),
                            "last_msg_date": { //Fecha
                                $gte: new Date(auxDate[0]),
                                $lt: new Date(auxDate[1])
                            }
                        }
                    },
                    {
                        $group: {
                            _id: "$client",
                            count: { $sum: 1 },
                            name_client: { $first: "$client_data.interfaces" } //PODEMOS DEJAR ESTO SOLO EN INTERFAZ [$first]
                        }
                    },
                    {
                        $sort: {
                            count: -1
                        }
                    }
                ]).toArray();
                console.log($tickets);
                for(let $t in $tickets){ //Recorremos los tickets para obtener la info de los clientes
                    const client = `${$tickets[$t].name_client[0][0].name}[${$tickets[$t].name_client[0][0].service}]`;
                    //const index_id = msgData[dateKey].findIndex(x => x.id === $tickets[$t]._id );

                    //if(index_id === -1){
                        msgData[dateKey].push({
                            id: $tickets[$t]._id,
                            name: client,
                            cant: $tickets[$t].count
                        });
                    //}else{
                      //  msgData[dateKey][index_id].cant_tickets += $tickets[$t].count;
                    //}
                }
            }//fin while($flag)

            res.send({
                account: account.name,
                data: msgData
            });
            
            client.close();
        });
    } catch (error) {
        console.log(error);
        res.send({
            msg: 'Error'
        })
    }
}