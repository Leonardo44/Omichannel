require('dotenv').config()
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const host = process.env.DB_MONGOCLIENT_HOST || 'localhost'
const port = process.env.DB_MONGOCLIENT_PORT || '27017'
const dbName = process.env.DB_NAME || 'eve'

const url = `mongodb://${host}:${port}`;

module.exports = (callback) => {
    MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
        try {
            if (err) throw err;

            assert.equal(null, err);
            const db = client.db(dbName);
            
            if(typeof callback === 'function'){
                callback(db, client);
            }else{
                client.close();
            }
        } catch (error) {
            throw new error;
        }
    });
}

module.exports.test = () => {
    MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
        try {
            if (err) throw err;
            assert.equal(null, err);
            const db = client.db(dbName);

            console.log(`> MongoClient: \t- Conectado éxitosamente! -\n`);
            client.close();
        } catch (error) {
            console.log(error);
            console.log('----------------------------------------------');
            console.log('>MongoClient: \t- Ha ocurrido un error al intentar conectar a la base - \n');
        }
    });
}