const mongoose = require('mongoose')

const organizationModel = new mongoose.Schema({
  name: { type: String },
  friendly_name: { type: String }
})

module.exports = mongoose.model('Organization', organizationModel)
