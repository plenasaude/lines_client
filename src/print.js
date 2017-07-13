const electron = require('electron')
const moment = require('moment')

electron.ipcRenderer.on('ticket', (e, ticket) => {
  document.getElementById('ticket-number').innerHTML = ticket.ticket
  document.getElementById('ticket-queue').innerHTML = ticket.queue
  document.getElementById('ticket-preferred').innerHTML =
    ticket.preferred ? 'Preferencial' : 'normal'

  // TODO: get from ticket
  document.getElementById('ticket-organization').innerHTML = 
    'Previna taipas'

  // TODO: get createdTime from ticket
  document.getElementById('ticket-date-time').innerHTML =
    moment().format('DD/MM/YYYY - HH:mm')
})
