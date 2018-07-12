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
                    const $tickets = await db.collection('tickets').find({
                        agent: ObjectId(agent._id)
                    }).toArray();
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
        
                        for(let $i in $tickets){
                            const msgs = await db.collection('messages').find({
                                ticket: ObjectId($tickets[$i]._id), 
                                date: {
                                    $gte: new Date(auxDate[0]), 
                                    $lte: new Date(auxDate[1])
                                }
                            }).toArray();
                                
                            const cant = msgs.length;

                            if(cant) {
                                const msgInterface = msgs[0].interface;

                                if (!msgData[dateKey].hasOwnProperty(msgInterface)) { msgData[dateKey][msgInterface] = []; }
                                if ($interfaces.indexOf(msgInterface) === -1) { $interfaces.push(msgInterface) }
                                
                                msgData[dateKey][msgInterface].push(cant);
                            }
                        }
        
                        
                        for(let $i in $interfaces){
                            if(!data.hasOwnProperty(dateKey)){ data[dateKey] = {}; }
                            
                            if(!data[dateKey].hasOwnProperty($interfaces[$i])){ data[dateKey][$interfaces[$i]] = {}; }
                            
                            if(msgData[dateKey].hasOwnProperty($interfaces[$i])){
                                const avg = msgData[dateKey][$interfaces[$i]].reduce((sum, n) => sum + n, 0) / msgData[dateKey][$interfaces[$i]].length;
                                
                                data[dateKey][$interfaces[$i]] = (avg);
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
