const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const host = '127.0.0.1';
const url = `mongodb://${host}:27017`;
const dbName = 'eve2';

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
            console.log('\n - Conectado éxitosamente! - \n');
            client.close();
        } catch (error) {
            console.log(error);
            console.log('----------------------------------------------');
            console.log('\n - Ha ocurrido un error al intentar conectar a la base - \n');
        }
    });
}