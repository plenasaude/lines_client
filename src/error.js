const electron = require('electron')

electron.ipcRenderer.on('data', (event, data) => {
  document.getElementById('errorMessage').innerHTML = data.message
})
