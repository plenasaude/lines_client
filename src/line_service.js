const configuration = require('./configuration')
const bluebird = require('bluebird')
const R = require('ramda')

function http(fn) {
  return bluebird.resolve(
    configuration.get()
      .then(fn)
      .then(R.prop('data'))
  )
}

exports.getScreenConfig = function getScreenConfig() {
  const url = user => `/screen/${user}/config`
  return http(({ user, axios }) => axios.get(url(user)))
}

exports.createTicket = function createTicket(preferred) {
  const url = user => `/screen/${user}`
  return http(({ user, axios }) => axios.post(url(user), { preferred }))
}

exports.listTickets = function listTickets({ limit }) {
  const url = user => `/screen/${user}?limit=${limit}`
  return http(({ user, axios }) => axios.get(url(user)))
}
