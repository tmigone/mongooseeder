const mongoose = require('mongoose')
let Schema = mongoose.Schema

let AuthorSchema = new Schema({
  first_name: {type: String, required: true, max: 100},
  family_name: {type: String, required: true, max: 100}
})

module.exports = mongoose.model('Author', AuthorSchema)
