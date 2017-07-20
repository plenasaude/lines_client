const electron = require('electron')

electron.ipcRenderer.on('logo', (event, logo) => {
  if (logo) {
    document.getElementById('logo-header').src = logo
  } else {
    document.getElementById('logo-header').style.display = 'none'
  }
})

document.addEventListener('DOMContentLoaded', function() {
  electron.ipcRenderer.send('get-logo')
})
