const axios = require('axios')
const electron = require('electron')
const swal = require('sweetalert2')

function getTicket(preferencial) {
  const t = { teste: 'teste' }
  swal({
    title: 'Imprimindo senha',
    text: 'Aguarda alguns instantes',
  })
  swal.showLoading()
  return axios.get('http://google.com')
    .then(ticket => electron
      .ipcRenderer
      .sendSync('print-ticket', ticket)
    )
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
    }))
}

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('normal_queue')
    .addEventListener('click', () => {
      getTicket(false)
    })

  document.getElementById('preferencial_queue')
    .addEventListener('click', () => {
      getTicket(true)
    })
})
