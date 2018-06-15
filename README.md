# mongooseeder
mongodb seeder

# Usage

```javascript
let uri = ''

let data = [{
  name: 'Author',
  model: path.join(__dirname, './models/Author.js'),
  migration: path.join(__dirname, './migrations/authors.json'),
  drop: true
}]

let seeder = new MongooSeeder(uri, data)
seeder.seed()

```

## Options
| Option  | Description |
| ------------- | ------------- |
| name  | Model name. Must be same as the registered shema on mongoose.  |
| model  | Path to mongoose model file.  |
| migration  | Path to seeder input data.  |
| drop  | ```true:false``` Whether to drop the collection before importing or not.  |

## Model schema
```javascript
const mongoose = require('mongoose')
let Schema = mongoose.Schema

let AuthorSchema = new Schema({
  first_name: {type: String, required: true, max: 100},
  family_name: {type: String, required: true, max: 100}
})

module.exports = mongoose.model('Author', AuthorSchema)
```

## Migration file
```json
{
  "model": "Author",
  "documents": [
    {
      "first_name": "John",
      "family_name": "Doe"
    },
    {
      "first_name": "Jane",
      "family_name": "Smith"
    },
    {
      "first_name": "Edgar",
      "family_name": "Poe"
    }
  ]
}
```
