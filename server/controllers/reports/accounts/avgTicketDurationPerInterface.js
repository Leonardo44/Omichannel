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
            }, data = {}, $flag = true, auxDate = [], msgData = [];
    
            const account = await app.db(dbName).collection("accounts").findOne({"_id": ObjectId(req.body.account_id)}); //Guardamos Información de la cuenta
            const organization = await app.db(dbName).collection("organizations").findOne({"_id": ObjectId(req.body.organization_id)}); //Guardamos información de orgnización
            const $interfaces = account.interfaces;
    
            while($flag){    
    
                if(frmData.interval.type === 'd'){ //Día
                    if(auxDate.length === 0){
                        let auxLimit = frmData.initDate.clone();
    
                        auxLimit.set({
                            'hour': frmData.endDate.format('H'),
                            'minute': frmData.endDate.format('mm'),
                            'second': frmData.endDate.format('s')
                        });
                        
                        auxDate = [frmData.initDate.clone(), auxLimit.clone()];
                    }else{
                        let auxLimit = auxDate[0].clone();
                        auxLimit.add(frmData.interval.cant, frmData.interval.type);
                        auxDate = [auxLimit.clone(), auxDate[1]];
    
                        let _aux = auxDate[1].clone();
                        _aux.add(frmData.interval.cant, frmData.interval.type);
    
                        if(_aux >= frmData.endDate){
                            auxDate[1] = frmData.endDate.clone();
                            $flag = false;
                        }else{
                            auxDate[1] = _aux.clone();
                        }
                    }
                }else{
                    if(auxDate.length === 0){
                        let auxLimit = frmData.initDate.clone();
                        auxLimit.add(frmData.interval.cant, frmData.interval.type)
                        
                        auxDate = [frmData.initDate.clone(), auxLimit.clone()];
                    }else{
                        let _aux = auxDate[1].clone();
    
                        auxDate[0] = auxDate[1].clone();
    
                        if(!(auxDate[0].format('H:mm:s') === frmData.initDate.format('H:mm:s'))){ auxDate[0].add(1, 'm'); }
    
                        _aux.add(frmData.interval.cant, frmData.interval.type);
                        
                        if(_aux >= frmData.endDate){
                            auxDate[1] = frmData.endDate.clone();
                            $flag = false;
                        }else{
                            auxDate[1] = _aux.clone();
                        }
                    }
                }
    
                const dateKey = `${moment(auxDate[0]).format('YYYY-MM-DD_HH:mm')}_-_${moment(auxDate[1]).format('YYYY-MM-DD_HH:mm')}`;
                msgData[dateKey] = [];
    
                if((auxDate[1].format('H:mm:s') <= frmData.endDate.format('H:mm:s'))
                    && (auxDate[1].format('H:mm:s') >= frmData.initDate.format('H:mm:s'))
                    && (auxDate[0].format('H:mm:s') <= frmData.endDate.format('H:mm:s'))
                    && (auxDate[0].format('H:mm:s') >= frmData.initDate.format('H:mm:s'))){
    
                    const $tickets = await app.db(dbName).collection("tickets").aggregate([
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
                        const $data_ticket_messages = await app.db(dbName).collection("messages").aggregate([
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