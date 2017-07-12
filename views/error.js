const electron = require('electron')

document.addEventListener('DOMContentLoaded', function() {
  electron.ipcRenderer.on('data', (event, data) => {
    document.getElementById('errorMessage').innerHTML = data.message
  })
})
