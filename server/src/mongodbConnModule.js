const mongoose = require('mongoose')

const host = process.env.DB_MONGOOSE_HOST || 'localhost'
const port = process.env.DB_MONGOOSE_PORT || '27017'
const database = process.env.DB_NAME || 'eve2'

module.exports.connect = function() {
  mongoose.connect(`mongodb://${host}:${port}/${database}`)
  const db = mongoose.connection
  db.on('error', console.error.bind(console, 'connection error'))
  db.once('open', function(callback) {
    console.log(`\n> Mongoose: \t- Conectado éxitosamente! - \n`);
  })
  return db
}
