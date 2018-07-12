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
            
                        const dateKey = `${moment(auxDate[0]).format('YYYY-MM-DD_HH:mm')}_-_${moment(auxDate[1]).format('YYYY-MM-DD_HH:mm')}`;
                        msgData[dateKey] = [];
                        
                        const $tickets = await db.collection("tickets").aggregate([
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
                                const msgInterface = $data_ticket_messages[$d]._id;
                                if ($interfaces.indexOf(msgInterface) === -1) { $interfaces.push(msgInterface) }
                                if(!msgData[dateKey].hasOwnProperty(msgInterface)){
                                    msgData[dateKey][$data_ticket_messages[$d]._id] = {
                                        milliseconds: 0,
                                        cant_ticket: 0
                                    };
                                }
                                msgData[dateKey][msgInterface].milliseconds += $data_ticket_messages[$d].rest_milliseconds;
                                msgData[dateKey][msgInterface].cant_ticket += $data_ticket_messages.length; 
                            }
                        }// fin for(let $t in $tickets)

                        for(let $i in $interfaces){
                            if(!data.hasOwnProperty(dateKey)){ data[dateKey] = {}; }
                            if(!data[dateKey].hasOwnProperty($interfaces[$i])){ data[dateKey][$interfaces[$i]] = {} }

                            if(msgData[dateKey].hasOwnProperty($interfaces[$i])){
                                let avg = msgData[dateKey][$interfaces[$i]].milliseconds / msgData[dateKey][$interfaces[$i]].cant_ticket;
                                let avg_format = prueba = moment().month(0).date(1).hours(0).minutes(0).seconds(0).milliseconds(avg);
                                data[dateKey][$interfaces[$i]] = (avg_format.format('H:mm:ss'));
                            }else{
                                data[dateKey][$interfaces[$i]] = 0;
                            }
                        }//fin for(let $i in $interfaces)
                    }//fin while($flag)

                    res.send({
                        agent: agent.name,
                        interfaces: $interfaces,
                        data
                    });
                }else{
                    res.send({ msg: 'El agente al que deseas acceder no existe!' })
                }
            }else{
                res.send({ msg: "El ID posee un formato erróneo..." })
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