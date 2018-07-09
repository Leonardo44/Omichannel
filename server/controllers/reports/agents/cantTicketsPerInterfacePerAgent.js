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
                            
                            _aux.add(frmData.interval.cant, frmData.interval.type);
                            
                            if(_aux >= frmData.endDate){
                                auxDate[1] = frmData.endDate.clone();
                                $flag = false;
                            }else{
                                auxDate[1] = _aux.clone();
                            }
                        }

                        const $tickets = await db.collection('tickets').find({
                            agent: ObjectId(agent._id),
                            last_msg_date: {
                                $gte: new Date(auxDate[0]),
                                $lte: new Date(auxDate[1])
                            }
                        }) .toArray();
                        
                        const dateKey = `${moment(auxDate[0]).format('YYYY-MM-DD_HH:mm')}_-_${moment(auxDate[1]).format('YYYY-MM-DD_HH:mm')}`;
                        msgData[dateKey] = [];
        
                        const cant = $tickets.length;

                        for($t in $tickets){
                            // if(cant) {
                                const $messages = await db.collection('messages').find({
                                    ticket: ObjectId($tickets[$t]._id)
                                }).toArray();
    
                                const msgInterface = $messages[0].interface;
        
                                if (!msgData[dateKey].hasOwnProperty(msgInterface)) { msgData[dateKey][msgInterface] = 0; }
                                if ($interfaces.indexOf(msgInterface) === -1) { $interfaces.push(msgInterface) }
                                msgData[dateKey][msgInterface]++;
                            // }
                        }

                        for(let $i in $interfaces){
                            if(!data.hasOwnProperty(dateKey)){
                                data[dateKey] = {};
                            }
                            
                            if(!data[dateKey].hasOwnProperty($interfaces[$i])){
                                data[dateKey][$interfaces[$i]] = {}
                            }
                            
                            if(msgData[dateKey].hasOwnProperty($interfaces[$i])){
                                let cant = msgData[dateKey][$interfaces[$i]];
                                
                                data[dateKey][$interfaces[$i]] = (cant);
                            }else{
                                data[dateKey][$interfaces[$i]] = (0);
                            }
                        }
                    }
                    
                    res.send({
                        agent: agent.name,
                        interfaces: $interfaces,
                        data
                    });
                }else{
                    res.send({
                        msg: 'El agente al que deseas acceder no existe!'
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
