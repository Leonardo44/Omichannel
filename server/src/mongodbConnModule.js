const mongoose = require('mongoose')
const host = '172.16.11.128'
const port = '27017'
const database = 'eve2'

module.exports.connect = function() {
  mongoose.connect(`mongodb://${host}:${port}/${database}`)
  const db = mongoose.connection
  db.on('error', console.error.bind(console, 'connection error'))
  db.once('open', function(callback) {
    console.log('Connection Succeeded')
  })
  return db
}
