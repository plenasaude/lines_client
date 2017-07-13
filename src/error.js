const electron = require('electron')

electron.ipcRenderer.on('data', (event, data) => {
  console.log(data.payload)
  document.getElementById('errorMessage').innerHTML = data.message
})
