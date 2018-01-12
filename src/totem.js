const electron = require('electron')
const swal = require('sweetalert2')
const R = require('ramda')

const lineService = electron.remote.require('./src/line_service')

function getTicket(preferred, queueId) {

  const t = { teste: 'teste' }
  swal({
    title: 'Imprimindo senha',
    text: 'Aguarda alguns instantes',
  })
  swal.showLoading()

  return lineService.createTicket(preferred, queueId)
    .then(ticket => {
      return electron
      .ipcRenderer
      .sendSync('print-ticket', ticket)
    })
    .then(() => swal({
      title: 'Sua senha foi impressa',
      type: 'success',
      timer: 1500,
      showConfirmButton: false,
    }).catch(swal.noop))
    .catch(() => swal({
      title: 'Erro ao imprimir senha',
      type: 'error',
      timer: 1500,
      showConfirmButton: false,
    }).catch(swal.noop))
    .then(() => {
      electron.ipcRenderer.send('get-queues-info')
    })
}

function renderQueueOption(queues) {
  const mainWrapper = document.getElementById('mainWrapper')

  mainWrapper.innerHTML = ''
  
  const header = document.createElement('header')
  header.className = 'header'
  header.innerHTML = 'TOQUE NA OPÇÃO'

  mainWrapper.appendChild(header)

  queues.forEach(queue => {
    const button = document.createElement('button')
    button.className = 'totem-btn btn-dark'
    button.innerHTML = queue.placeholderName
    button.addEventListener('click', () => {
      renderQueueTypeOption(queue._id)
    })
    mainWrapper.appendChild(button)
  })
}

function renderQueueTypeOption(queueId) {
  const mainWrapper = document.getElementById('mainWrapper')

  mainWrapper.innerHTML = ''

  const header = document.createElement('header')
  header.className = 'header'
  header.innerHTML = 'TOQUE NA OPÇÃO'

  const button1 = document.createElement('button')
  button1.className = 'totem-btn btn-dark'
  button1.innerHTML = 'Normal'
  button1.addEventListener('click', () => {
    getTicket(false, queueId)
  })

  const button2 = document.createElement('button')
  button2.className = 'totem-btn btn-light'
  button2.innerHTML = 'Preferencial'
  button2.addEventListener('click', () => {
    getTicket(true, queueId)
  })
  
  mainWrapper.appendChild(header)
  mainWrapper.appendChild(button1)
  mainWrapper.appendChild(button2)
}

electron.ipcRenderer.on('logo', (event, logo) => {
  if (logo) {
    document.getElementById('logo-header').src = logo
  } else {
    document.getElementById('logo-header').style.display = 'none'
  }
})

electron.ipcRenderer.on('queues-info', (event, queuesInfo) => {
  console.log(queuesInfo)

  if(queuesInfo.length === 1) return renderQueueTypeOption(queuesInfo[0]._id)

  renderQueueOption(queuesInfo)
    
})

document.addEventListener('DOMContentLoaded', function() {
  electron.ipcRenderer.send('get-logo')
  electron.ipcRenderer.send('get-queues-info')
})

