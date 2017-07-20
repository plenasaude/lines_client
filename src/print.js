const electron = require('electron')
const moment = require('moment')
const R = require('ramda')

electron.ipcRenderer.on('ticket', (e, ticket) => {
  document.getElementById('ticket-number').innerHTML = ticket.ticket
  document.getElementById('ticket-queue').innerHTML = R.path(['queue', 'name'], ticket)
  document.getElementById('ticket-preferred').innerHTML =
    ticket.preferred ? 'Preferencial' : 'Normal'

  const date = ticket.createdAt || moment().valueOf()
  document.getElementById('ticket-date-time').innerHTML =
    moment(date).format('DD/MM/YYYY - HH:mm')

  if (ticket.text) {
    document.getElementById('ticket-organization').innerHTML = ticket.text
  } else {
    document.getElementById('ticket-organization').style.display = 'none'
  }

  if (ticket.logo) {
    document.getElementById('ticket-logo').src = ticket.logo
  } else {
    document.getElementById('ticket-logo').style.display = 'none'
  }
})
