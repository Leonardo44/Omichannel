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
            }, 
            data = {}, $flag = true, auxDate = [], msgData = {};

            const account = await db.collection("accounts").findOne({"_id": ObjectId(req.body.account_id)}); //Guardamos Información de la cuenta
            const organization = await db.collection("organizations").findOne({"_id": ObjectId(req.body.organization_id)}); //Guardamos información de orgnización

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
                data[dateKey] = [];

                if((auxDate[1].format('H:mm:s') <= frmData.endDate.format('H:mm:s'))
                    && (auxDate[1].format('H:mm:s') >= frmData.initDate.format('H:mm:s'))
                    && (auxDate[0].format('H:mm:s') <= frmData.endDate.format('H:mm:s'))
                    && (auxDate[0].format('H:mm:s') >= frmData.initDate.format('H:mm:s'))){
                    
                    const $tickets = await  db.collection("tickets").aggregate([ //Obtenemos los agentes con sus tickets
						{
							$lookup: {
								from: 'agents',
								localField: 'agent',
								foreignField: '_id',
								as: 'agent_data'
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
								_id: "$agent",
								cant_tickets: { $sum: 1 },
								name_agent: { $first: "$agent_data.name" },
								token_key: { $first: "$agent_data.token_key" },
								username_agent: { $first: "$agent_data.auth.username"},
								tickets: {$push: "$_id"}
							}
						},
						{
							$sort: {
								count: -1
							}
						}
					]).toArray();
                	
                	for(let $t in $tickets){
                		for(let $_t in $tickets[$t].tickets){
                			const $data_ticket = await db.collection("messages").aggregate([ //Aquí lo que nos importa es el tiempo del ticket
	                			{
	                                $lookup: {
	                                    from: 'tickets',
	                                    localField: 'ticket',
	                                    foreignField: '_id',
	                                    as: 'ticket_data'
	                                }
	                            },
	                            { $match: { "ticket": ObjectId($tickets[$t].tickets[$_t]) } }, //Where's
	                            {
	                                $group: { //Group By()
	                                    _id: "$ticket",
	                                    cant_messages: { $sum: 1 },
	                                    time_first: { $first: "$date"},
	                                    time_last: { $last: "$date"},
	                                    times: {$push: "$date"},
	                                }
	                            },
	                            { $addFields: { rest_milliseconds: { $subtract: [ "$time_last", "$time_first"] } } }//Más data
	                		]).toArray();

                			let index_user = data[dateKey].findIndex(x => x.id === $tickets[$t].name_agent[0]);
                			if(index_user === -1){
                				data[dateKey].push({
		                			id: $tickets[$t].name_agent[0],
		                			cant_tickets: $tickets[$t].cant_tickets,
		                			duration: $data_ticket[0].rest_milliseconds;
	                			});
                			}else{
                				data[dateKey][index_user].duration += $data_ticket[0].rest_milliseconds;
                			}
                		}//fin for(let $_t in  $tickets[$t].tickets)	
                	}//fin for(let $t in $tickets)

                	data[dateKey].sort(function(a, b){//Ordenar según cantidad de ticket
                		if(a.cant_tickets < b.cant_tickets) { return -1; }
                		if(a.duration > b.cant_tickets) { return 1; }
                		return 0;
					}).sort(function(a, b){//Ordenar según duración de tickets por milisegundos
						if(a.duration < b.duration){ return -1; }
						if(a.duration > b.duration){ return 1; }
						return 0;
					});
                }//fin if
            }//fin while($flag)
            console.log(data);
            res.send({
                data: data
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