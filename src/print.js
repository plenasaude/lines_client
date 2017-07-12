const electron = require('electron')

electron.ipcRenderer.on('ticket', (e, ticket) => {
  document.getElementById('ticket-number').innerHTML = ticket.ticket
  document.getElementById('ticket-queue').innerHTML = ticket.queue
  document.getElementById('ticket-preferred').innerHTML =
    ticket.preferred ? 'Preferencial' : 'normal'
})
