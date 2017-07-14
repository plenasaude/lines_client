const os = require('os')
const path = require('path')
const fs = require('fs')
const Promise = require('bluebird')
const axios = require('axios')

const settings = require('../settings')

const readFile = Promise.promisify(fs.readFile)

const configFile = 'edoc_config.json'
const configPath = path.join(os.homedir(), configFile)

let authConfig = null

function safeParse(jsonString) {
  try {
    return Promise.resolve(JSON.parse(jsonString))
  } catch (e) {
    return Promise.reject('Could not parse JSON')
  }
}

module.exports = () => {
  if (authConfig) return Promise.resolve(authConfig)

  return readFile(configPath, 'utf8')
    .then(safeParse)
    .then(config => authConfig = {
      axios: axios.create({
        baseURL: settings.apiUrl,
        headers: {'Authorization': config.authorization}
      }),
      user: config.user,
    })
    .return(authConfig)
    .catch(error => Promise.reject({ configPath, error }))
}

