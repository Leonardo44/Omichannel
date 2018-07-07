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
    
            const account = await db.collection("accounts").findOne({"_id": ObjectId(req.body.account_id)}); //Guardamos Información de la cuenta
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