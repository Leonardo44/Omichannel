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
            }, data = {}, $flag = true, auxDate = [frmData.init.moment, null], msgData = [];
    
            const account = await db.collection("accounts").findOne({"_id": ObjectId(req.body.account_id)}); //Guardamos Información de la cuenta
            const organization = await db.collection("organizations").findOne({"_id": ObjectId(req.body.organization_id)}); //Guardamos información de orgnización
            const $interfaces = account.interfaces;
    
            while($flag){    
                auxDate = utils.getInterval(auxDate, frmData.init, frmData.end, frmData.interval)
                $flag = (auxDate[1].format('YYY-MM-DD HH:mm') !== frmData.end.moment.format('YYY-MM-DD HH:mm'))
    
                const dateKey = `${moment(auxDate[0]).format('YYYY-MM-DD_HH:mm')}_-_${moment(auxDate[1]).format('YYYY-MM-DD_HH:mm')}`;
                msgData[dateKey] = [];
    
                if((auxDate[1].format('H:mm:s') <= frmData.endDate.format('H:mm:s'))
                    && (auxDate[1].format('H:mm:s') >= frmData.initDate.format('H:mm:s'))
                    && (auxDate[0].format('H:mm:s') <= frmData.endDate.format('H:mm:s'))
                    && (auxDate[0].format('H:mm:s') >= frmData.initDate.format('H:mm:s'))){
    
                    const $tickets = await db.collection("tickets").aggregate([
                        { 
                            $match: {
                                "account": ObjectId(account._id),
                                "organization": ObjectId(organization._id),
                                "last_msg_date": { //Fecha
                                    $gte: new Date(auxDate[0]),
                                    $lt: new Date(auxDate[1])
                                }
                            }
                        }
                    ]).toArray();
    
                    for(let $t in $tickets){ //Recorremos los tickets para sacar la información necesaria
                        const $data_ticket_messages = await db.collection("messages").aggregate([
                            {
                                $lookup: {
                                    from: 'tickets',
                                    localField: 'ticket',
                                    foreignField: '_id',
                                    as: 'ticket_data'
                                }
                            },
                            { $match: { "ticket": ObjectId($tickets[$t]._id) } }, //Where's
                            {
                                $group: { //Group By()
                                    _id: "$interface",
                                    cant_messages: { $sum: 1 },
                                    time_first: { $first: "$date"},
                                    time_last: { $last: "$date"},
                                    times: {$push: "$date"},
                                }
                            },
                            { $addFields: { rest_milliseconds: { $subtract: [ "$time_last", "$time_first"] } } }//Más data
                        ]).toArray();
    
                        for(let $d in $data_ticket_messages){
                            if(!msgData[dateKey].hasOwnProperty($data_ticket_messages[$d]._id)){
                                msgData[dateKey][$data_ticket_messages[$d]._id] = {
                                    milliseconds: 0,
                                    cant_ticket: 0
                                };
                            }
                            msgData[dateKey][$data_ticket_messages[$d]._id].milliseconds += $data_ticket_messages[$d].rest_milliseconds;
                            msgData[dateKey][$data_ticket_messages[$d]._id].cant_ticket += $data_ticket_messages.length; 
                        }
                    }// fin for(let $t in $tickets)
    
                    for(let $i in $interfaces){
                        if(!data.hasOwnProperty(dateKey)){ data[dateKey] = {}; }
                        if(!data[dateKey].hasOwnProperty($interfaces[$i].service)){ data[dateKey][$interfaces[$i].service] = {} }
    
                        if(msgData[dateKey].hasOwnProperty($interfaces[$i].service)){
                            let avg = msgData[dateKey][$interfaces[$i].service].milliseconds / msgData[dateKey][$interfaces[$i].service].cant_ticket;
                            let avg_format = prueba = moment().month(0).date(1).hours(0).minutes(0).seconds(0).milliseconds(avg);
                            data[dateKey][$interfaces[$i].service] = (avg_format.format('H:mm:ss'));
                        }else{
                            data[dateKey][$interfaces[$i].service] = 0;
                        }
                    }//fin for(let $i in $interfaces)
                }
            }//fin while($flag)
            
            res.send({
                account: account.name,
                organization: organization.friendly_name,
                interfaces: $interfaces.map(x => ({name: x.service, picture: x.picture})),
                data
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