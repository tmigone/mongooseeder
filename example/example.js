const MongooSeeder = require('../index.js')
const path = require('path')

let uri = ''

let data = [{
  name: 'Author',
  model: path.join(__dirname, './models/Author.js'),
  migration: path.join(__dirname, './migrations/authors.json'),
  drop: true
}]

let seeder = new MongooSeeder(uri, data)
seeder.seed()
