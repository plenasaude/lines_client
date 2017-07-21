const R = require('ramda')

const lineService = require('./line_service')

let screenConfig = {}

function formatLogo() {
  if (!screenConfig.logo) return screenConfig

  const imgBase64 = R.test(/^data:image\/png;base64,/, screenConfig.logo) ?
    screenConfig.logo : `data:image/png;base64, ${screenConfig.logo}`

  screenConfig.logo = imgBase64
}

function populateScreen() {
  return lineService.getScreenConfig()
    .then(newScreen => { screenConfig = newScreen })
    .then(formatLogo)
    .return(screenConfig)
}

module.exports = {
  start() { return populateScreen() },
  text() { return screenConfig.text },
  logo() { return screenConfig.logo },
}
