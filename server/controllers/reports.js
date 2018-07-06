const router = require('express').Router()

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const ObjectId = require('mongodb').ObjectId;

const moment = require('moment');

const host = '172.16.11.128';
const url = `mongodb://${host}:27017`;
const dbName = 'eve2';

moment().locale('es_sv')

router.post('/avg_msg_tickets', (req, res) => { //Promedio de mensajes por tickets por interfaz
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
                    
                    console.log('\n');
                    console.log(JSON.stringify(data, null, 4));
                    console.log('\n');
                    console.log(data);
                    console.log('\n');

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

router.post('/tickets_interface', (req, res) => { //Cantidad de tickets por interfaz
    MongoClient.connect(url, { useNewUrlParser: true }, async function(err, app) {
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
        
        app.close(); //Cerrar conexión
        res.send({
            account: account.name,
            interfaces: $interfaces.map(x => ({name: x.service, picture: x.picture})),
            data
        });
    });
})

router.post('/tickets_client', (req, res) => {//Número de tickets por cliente
    MongoClient.connect(url, { useNewUrlParser: true }, async function(err, app){
        try {
            assert.equal(null, err);
            let frmData = {
                initDate: moment(`${req.body.intervalData.init.date} ${req.body.intervalData.init.time}`, 'YYYY-MM-DD H:mm'),
                endDate: moment(`${req.body.intervalData.end.date} ${req.body.intervalData.end.time}`, 'YYYY-MM-DD H:mm'),
                interval: {
                    type: req.body.interval.split(':')[0].toLowerCase(),
                    cant: parseInt(req.body.interval.split(':')[1])
                }
            }, 
            data = {}, $flag = true, auxDate = [], msgData = [];

            const account = await app.db(dbName).collection("accounts").findOne({"_id": ObjectId(req.body.account_id)}); //Guardamos Información de la cuenta
            const organization = await app.db(dbName).collection("organizations").findOne({"_id": ObjectId(req.body.organization_id)}); //Guardamos información de orgnización

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
                msgData[dateKey] = {};

                if((auxDate[1].format('H:mm:s') <= frmData.endDate.format('H:mm:s'))
                    && (auxDate[1].format('H:mm:s') >= frmData.initDate.format('H:mm:s'))
                    && (auxDate[0].format('H:mm:s') <= frmData.endDate.format('H:mm:s'))
                    && (auxDate[0].format('H:mm:s') >= frmData.initDate.format('H:mm:s'))){
                    const $tickets = await app.db(dbName).collection("tickets").aggregate([ //Obtenemos los tickets por cuenta iterada 
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

                    for(let $t in $tickets){ //Recorremos los tickets para obtener la info de los clientes
                        console.log("______________________________________________");
                        const client = `${$tickets[$t].name_client[0][0].name}[${$tickets[$t].name_client[0][0].service}]`;
                        // const index_id = msgData[dateKey].findIndex(x => x.id === $tickets[$t]._id );

                        console.log(msgData[dateKey]);
                        console.log('\n');
                        // if(index_id === -1){
                        //     msgData[dateKey].push({
                        //         id: $tickets[$t]._id,
                        //         name: client,
                        //         cant_tickets: $tickets[$t].count
                        //     });
                        // }else{
                        //     msgData[dateKey][index_id].cant_tickets += $tickets[$t].count;
                        // }
                    }

                    // console.log(msgData);
                    // console.log(JSON.stringify(msgData, null, 4));
                }
            }

            res.send({
                data: 1
            });
        } catch (error) {
            res.send({
                msg: "Elol"
            })
        }
        app.close(); //Cerrar conexión
    });
})

router.post('/avg_time_ticket_interface', (req, res)=>{ //Promedio de duracion de ticket por interfaz
    MongoClient.connect(url, { useNewUrlParser: true }, async function(err, app) {
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
        
        app.close(); //Cerrar conexión
        res.send({
            account: account.name,
            organization: organization.friendly_name,
            interfaces: $interfaces.map(x => ({name: x.service, picture: x.picture})),
            data
        });
    });//Fin de MongoClient()
})//fin de router()

module.exports = router;