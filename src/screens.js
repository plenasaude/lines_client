const R = require('ramda')

const lineService = require('./line_service')

let screenConfig = {}

function populateScreen() {
  return lineService.getScreenConfig()
    .then(newScreen => { screenConfig = newScreen })
    .return(screenConfig)
}

module.exports = {
  start() { return populateScreen() },
  organization() { return R.path(['payload', 'organization'], screenConfig) },
  logo() { return R.path(['payload', 'logo'], screenConfig) },
}
