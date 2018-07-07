const mongoose = require('mongoose')
const host = 'localhost'
const port = '27017'
const database = 'eve'

module.exports.connect = function() {
  mongoose.connect(`mongodb://${host}:${port}/${database}`)
  const db = mongoose.connection
  db.on('error', console.error.bind(console, 'connection error'))
  db.once('open', function(callback) {
    console.log('Connection Succeeded')
  })
  return db
}
