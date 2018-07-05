const mongoose = require('mongoose')

const agentSchema = new mongoose.Schema({
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  name: String,
  picture: String,
  token_key: String,
  auth: {
    username: String,
    password: String
  }
})

module.exports = mongoose.model('Agent', agentSchema)
