const router = require('express').Router()

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const ObjectId = require('mongodb').ObjectId;

const moment = require('moment');

const host = true ? 'localhost' : '172.16.11.172';
const url = `mongodb://${host}:27017`;
const dbName = 'eve2';

moment().locale('es_sv')

router.post('/avg_msg_tickets', (req, res) => {

    // Use connect method to connect to the server
    MongoClient.connect(url, { useNewUrlParser: true }, async function (err, client) {
        try {
            assert.equal(null, err);
        
			const db = client.db(dbName);
			
			let frmData = {
				initDate: moment(`${req.body.intervalData.init.date} ${req.body.intervalData.init.time}`, 'YYYY-MM-DD H:mm'),
				endDate: moment(`${req.body.intervalData.end.date} ${req.body.intervalData.end.time}`, 'YYYY-MM-DD H:mm'),
				interval: {
					type: req.body.interval.split(':')[0].toLowerCase(),
					cant: parseInt(req.body.interval.split(':')[1])
				}
            }
            
            let data = {}, $flag = true, auxDate = [], msgData = [];

            if(ObjectId.isValid(req.body.account_id)){
				const account = await db.collection("accounts").findOne({_id: ObjectId(req.body.account_id)});

                if(account !== null){
                    const $interfaces = account.interfaces;
					const $tickets = await db.collection("tickets").find({ account: ObjectId(account._id) }).toArray();
                    
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
                                msgData[dateKey][msgInterface].push(cant);
                            }
                        }

                        for(let $i in $interfaces){
                            if(!data.hasOwnProperty(dateKey)){
                                data[dateKey] = {};
                            }
                            
                            if(!data[dateKey].hasOwnProperty($interfaces[$i].service)){
                                data[dateKey][$interfaces[$i].service] = {}
                            }

                            if(msgData[dateKey].hasOwnProperty($interfaces[$i].service)){
                                const avg = msgData[dateKey][$interfaces[$i].service].reduce((sum, n) => sum + n, 0) / msgData[dateKey][$interfaces[$i].service].length;
        
                                data[dateKey][$interfaces[$i].service] = (avg);
                            }else{
                                data[dateKey][$interfaces[$i].service] = (0);
                            }
                        }
                    }

                    res.send({
                        account: account.name,
                        interfaces: $interfaces.map(x => ({name: x.service, picture: x.picture})),
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
        } catch (error) {
            res.send({
                msg: "Elol"
            })
        }
    });
})

router.post('/tickets_interface', (req, res) => {
    MongoClient.connect(url, async function(err, app) {
        if (err) throw err; //Error

        let frmData = {
            initDate: moment(`${req.body.intervalData.init.date} ${req.body.intervalData.init.time}`, 'YYYY-MM-DD H:mm'),
            endDate: moment(`${req.body.intervalData.end.date} ${req.body.intervalData.end.time}`, 'YYYY-MM-DD H:mm'),
            interval: {
                type: req.body.interval.split(':')[0].toLowerCase(),
                cant: parseInt(req.body.interval.split(':')[1])
            }
        }, data = {}, $flag = true, auxDate = [], msgData = [];

        const account = await app.db(dbName).collection("accounts").findOne({"_id": ObjectId(req.body.account_id)}); //Guardamos Información de la cuenta
        const $interfaces = account.interfaces;

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

            const dateKey = `${moment(auxDate[0]).format('YYYY-MM-DD_HH:mm')}_-_${moment(auxDate[1]).format('YYYY-MM-DD_HH:mm')}`;
            msgData[dateKey] = [];

            const $tickets = await app.db(dbName).collection("tickets").aggregate([ //Obtenemos los tickets por cuenta iterada 
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

            //if($tickets.length){
                for(let $t in $tickets){
                    //if($tickets[$t].last_message.length){
                        if(!msgData[dateKey].hasOwnProperty($tickets[$t].last_message[0].interface)){
                            msgData[dateKey][$tickets[$t].last_message[0].interface] = 0;
                        }
                        msgData[dateKey][$tickets[$t].last_message[0].interface] += 1;
                   // }
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
            //}
        }
        
        app.close(); //Cerrar conexión
        res.send({
            account: account.name,
            interfaces: $interfaces.map(x => ({name: x.service, picture: x.picture})),
            data
        });
    });
})

module.exports = router;