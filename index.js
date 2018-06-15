const path = require('path')
const Promise = require('bluebird')
const mongoose = require('mongoose')

class MongooSeeder {
  constructor (_dbUri, _seeds) {
    this.db = {
      uri: _dbUri,
      connected: false
    }

    this.seeds = _seeds
    this.migrations = []
  }

  async seed () {
    await this.connect()

    if (this.db.connected) {
      this.loadModels()
      this.readMigrationFiles()
      await this.dropCollections()
      await this.populateModels()
      this.disconnect()
    }
  }

  async connect () {
    return new Promise((resolve, reject) => {
      console.log('--- Connecting to db ---')
      console.log('URI: %s', this.db.uri)
      mongoose.connect(this.db.uri)
      mongoose.connection.on('connected', () => {
        console.log('Connection successful!')
        this.db.connected = true
        resolve(this.connected)
      })
      mongoose.connection.on('error', () => {
        console.error.bind(console, 'MongoDB connection error:')
        this.db.connected = false
        resolve(this.connected)
      })
    })
  }

  disconnect () {
    mongoose.connection.close()
  }

  // Load models
  loadModels () {
    console.log('--- Loading models ---')
    this.seeds.forEach(s => {
      this.loadModelFromSeed(s)
    })

    console.log('Available models: %s', mongoose.modelNames())
  }

  loadModelFromSeed (_seed) {
    let model = require(path.resolve(_seed.model))
    console.log('Loaded model: %s', _seed.name)
  }

  // Read data
  readMigrationFiles () {
    console.log('--- Loading migrations ---')
    this.seeds.forEach(s => {
      this.readMigrationFile(s)
    })
  }
  readMigrationFile (_seed) {
    let fileData = require(_seed.migration)
    if (mongoose.modelNames().includes(fileData.model)) {
      this.migrations.push(fileData)
      console.log('Loaded migration for %s with %s documents', fileData.model, fileData.documents.length)
    } else {
      console.log('Migration not loaded, no model found for %s', fileData.model)
    }
  }

  // Drop collections
  async dropCollections () {
    return new Promise(async (resolve, reject) => {
      console.log('--- Dropping collections ---')

      let cols = await this.listCollections()
      console.log('Existing collections: %s', JSON.stringify(cols))

      this.seeds.forEach(async s => {
        if (s.drop) {
          let collectionName = mongoose.model(s.name).collection.name
          if (cols.includes(collectionName)) {
            console.log('Droping collection %s', collectionName)
            try {
              await mongoose.connection.dropCollection(collectionName)
              console.log('Droped collection %s', collectionName)
            } catch (e) {
              console.log(e)
            }
          } else {
            console.log('Collection %s was not dropped, it does not exist', collectionName)
          }
        } else {
          console.log('Collection for model: %s was not dropped, drop flag set to false', s.name)
        }
        resolve()
      })
    })
  }
  async listCollections () {
    return new Promise((resolve, reject) => {
      mongoose.connection.db.listCollections().toArray(function(err, names) {
        if (err) {
          console.log(err)
          resolve([])
        }
        else {
          let collections = []
          names.forEach(n => {
            if (n.name !== 'system.indexes') {
              collections.push(n.name)
            }
          })
          resolve(collections)
        }
      })
    })
  }

  // Populate models
  async populateModels () {
    return new Promise ((resolve, reject) => {
      this.migrations.forEach(migration => {
        console.log('--- Migration on model: %s ---', migration.model)
        migration.documents.forEach(async d => {
          if(mongoose.modelNames().includes(migration.model)) {
            let Model = mongoose.model(migration.model)
            await new Promise ((res, rej) => {
              Model.create(d, () => {
                res()
              })
            })
            console.log('Created document: %s', JSON.stringify(d))
          } else {
            console.log('Could not find model %s registered', migration.model)
          }
        })
      })
      resolve()
    })
  }
}

module.exports = MongooSeeder
