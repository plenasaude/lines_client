const electron = require('electron')
const totem = electron.remote.require('./src/totem')

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('normal_queue')
    .addEventListener('click', () => {
      totem.nextNormalQueue()
    })

  document.getElementById('preferencial_queue')
    .addEventListener('click', () => {
      totem.nextPreferencialQueue()
    })

  electron.ipcRenderer.on('data', (event, data) => {
    console.log(data.num)
    document.getElementById('queue_number').innerHTML = data.num
  })
});
