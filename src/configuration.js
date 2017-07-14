const os = require('os')
const path = require('path')
const fs = require('fs')
const Promise = require('bluebird')
const axios = require('axios')

const settings = require('../settings')

const readFile = Promise.promisify(fs.readFile)
const writeFile = Promise.promisify(fs.writeFile)

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

function safeStringfy(configInput) {
  try {
    return Promise.resolve(JSON.stringify(configInput))
  } catch (e) {
    return Promise.reject('Could not stringify JSON')
  }
}

exports.set = configInput => {
  return safeStringfy(configInput)
    .tap(str => writeFile(configPath, str, 'utf8'))
    .then(() => authConfig = {
      axios: axios.create({
        baseURL: settings.apiUrl,
        headers: {'Authorization': configInput.authorization}
      }),
      user: configInput.user,
    })
    .return(configInput)
    .catch(error => Promise.reject({ configPath, error }))
}

exports.get = () => {
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

