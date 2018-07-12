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
                iauxDate = utils.getInterval(auxDate, frmData.init, frmData.end, frmData.interval)
                $flag = (auxDate[1].format('YYY-MM-DD HH:mm') !== frmData.end.moment.format('YYY-MM-DD HH:mm'))

                const dateKey = `${moment(auxDate[0]).format('YYYY-MM-DD_HH:mm')}_-_${moment(auxDate[1]).format('YYYY-MM-DD_HH:mm')}`;
                data[dateKey] = [];

                    
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
					{ $sort: { count: -1 } }
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

            			let index_user = data[dateKey].findIndex(x => x.id === $tickets[$t].username_agent[0]);
            			if(index_user === -1){
            				data[dateKey].push({
	                			id: $tickets[$t].username_agent[0],
	                			cant_tickets: $tickets[$t].cant_tickets,
	                			duration: $data_ticket[0].rest_milliseconds
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

                data[dateKey].forEach(function(value, index, array){ //Cambiamos el formato a la duración de todos los tickets
                    let duration_format = moment().month(0).date(1).hours(0).minutes(0).seconds(0).milliseconds(array[index].duration);
                    array[index].duration = duration_format.format('H:mm:ss'); 
                });
                data[dateKey].slice(9); //Top 10
            }//fin while($flag)
            res.send({ 
                account: account.name,
                data: data 
            });
            client.close();
        });
    } catch (error) {
        console.log(error);
        res.send({ msg: 'Error' })
    }
}