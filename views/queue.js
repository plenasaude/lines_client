const electron = require('electron')
const main = electron.remote.require('./main')

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('normal_queue')
    .addEventListener('click', () => {
      main.nextNormalQueue()
    })

  document.getElementById('preferencial_queue')
    .addEventListener('click', () => {
      main.nextPreferencialQueue()
    })

  electron.ipcRenderer.on('data', (event, data) => {
    console.log(data.num)
    document.getElementById('queue_number').innerHTML = data.num
  })
});
