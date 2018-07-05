const mongoose = require('mongoose')

const accountSchema = new mongoose.Schema({
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  agents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Agent' }],
  name: String,
  interfaces: [
    {
      service: String,
      sid: String,
      name: String,
      picture: String,
      credentials: { type: mongoose.Schema.Types.Mixed }
    }
  ],
  watson: { assistant: { wsid: String, username: String, password: String } }
})

module.exports = mongoose.model('Account', accountSchema)
