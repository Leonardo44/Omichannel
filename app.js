const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const ObjectId = require('mongodb').ObjectId;

const url = 'mongodb://172.16.11.128:27017', dbName = 'eve2';

// Use connect method to connect to the server
MongoClient.connect(url, { useNewUrlParser: true }, async function (err, client) {
    try {
        assert.equal(null, err);
    
        const db = client.db(dbName);
        
        const auxData = {}, data = [],
            account = await db.collection("accounts").findOne({_id: ObjectId("5b18a2cf71fb1863693ab7ed")}),
            tickets = await db.collection("tickets").find({ account: account._id }).toArray(),
            interfaces = account.interfaces;

        for (let ticket of tickets) {
            const messages = await db.collection('messages').find({ ticket: ticket._id }).toArray(),
                cantidad = messages.length

            if (!cantidad) { return }

            const interface = messages[0].interface;

            if (!auxData.hasOwnProperty(interface)) { auxData[interface] = []; }
            auxData[interface].push(cantidad);
        }

        for (let interface in auxData) {
            const avg = auxData[interface].reduce((sum, n) => sum + n, 0) / auxData[interface].length;
            auxData[interface] = [];

            interfaces.forEach( _i => {
                if(_i.service === interface){
                    data.push({
                        name: _i.name,
                        picture: _i.picture,
                        avg
                    })

                    return;
                }
            });
        }

        console.log(JSON.stringify({
            account: account.name, 
            data
        }));
        
        client.close();
    } catch (error) {
        console.error(error);
    }
});