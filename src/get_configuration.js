const os = require('os')
const path = require('path')
const fs = require('fs')
const Promise = require('bluebird')

const readFile = Promise.promisify(fs.readFile)

const configFile = 'edoc_config.json'
const configPath = path.join(os.homedir(), configFile)

function safeParse(jsonString) {
  try {
    return Promise.resolve(JSON.parse(jsonString))
  } catch (e) {
    return Promise.reject('Could not parse JSON')
  }
}

module.exports = () => readFile(configPath, 'utf8')
  .then(safeParse)
  .catch(error => Promise.reject({ configPath, error }))

