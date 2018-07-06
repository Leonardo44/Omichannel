const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const ObjectId = require('mongodb').ObjectId;

const url = 'mongodb://172.16.11.128:27017', dbName = 'eve2';

// Use connect method to connect to the server
// MongoClient.connect(url, { useNewUrlParser: true }, async function (err, client) {
//     try {
//         assert.equal(null, err);
    
//         const db = client.db(dbName);
        
//         const ticket = await db.getCollection("messages").aggregate([
//             {
//                 $lookup: {
//                     from: 'tickets',
//                     localField: 'ticket',
//                     foreignField: '_id',
//                     as: 'ticket_data'
//                 }
//             },
//             {
//                 $match: {
//                     "ticket": ObjectId("5b3127fe68478f160f381b77"),
//                     "ticket_data.last_msg_date": { //Fecha
//                         $gte: ISODate("2018-06-25T12:00:00"),
//                         $lt: ISODate("2018-06-25T18:00:00")
//                     }
//                 }
//             },
            
//             {
//                 $sort: {
//                   "ticket_data.last_msg_date": -1
//                 }
//             },
//             {
//                 $group: {
//                     _id: "$interface",
//                     cant_messages: { $sum: 1 },
//                     time_first: { $first: "$date"}, //Fecha menor
//                     time_last: { $last: "$date"}, //Fecha mayor
//                     times: {$push: "$date"},
//                 }
//             },
//             {
//                 $addFields: {
//                     rest_dates: {$subtract: [{$second: "$time_last"}, {$second: "$time_first"}]}
//                 }
//             }
//         ]).toArray();
//         console.log(JSON.stringify(ticket));
        
//         client.close();
//     } catch (error) {
//         console.error(error);
//     }
// });

// MongoClient.connect(url, { useNewUrlParser: true }, async function (err, client) {
//     try {
//         assert.equal(null, err);
    
//         const db = client.db(dbName);
        
//         const ticket = await db.collection("messages").aggregate([
//             {
//                 $lookup: {
//                     from: 'tickets',
//                     localField: 'ticket',
//                     foreignField: '_id',
//                     as: 'ticket_data'
//                 }
//             },
//             {
//                 $match: {
//                     "organization" : ObjectId("5b14c1b52f9f9b586ae56e12"), 
//                     "account" : ObjectId("5b18a2cf71fb1863693ab7ed"), 
//                     // "ticket_data.last_msg_date": { //Fecha
//                     //     $gte: moment("2018-06-25T12:00:00").format(),
//                     //     $lt: moment("2018-06-25T18:00:00").format()
//                     // }
//                 }
//             },
            
//             {
//                 $sort: {
//                   "ticket_data.last_msg_date": -1
//                 }
//             },
//             {
//                 $group: {
//                     _id: "$interface",
//                     cant_messages: { $sum: 1 },
//                     time_first: { $first: "$date"},
//                     time_last: { $last: "$date"},
//                     times: {$push: "$date"},
//                 }
//             },
//             {
//                 $addFields: {
//                     rest_milliseconds: { $subtract: [ "$time_last", "$time_first"] }
//                 }
//             }
//         ]).toArray();

//         client.close();
//     } catch (error) {
//         console.error(error);
//     }
// });