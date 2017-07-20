const electron = require('electron')
const R = require('ramda')

electron.ipcRenderer.on('data', (event, data) => {
  document.getElementById('errorMessage').innerHTML = data.message
  const showLogin = R.path(['payload', 'showLogin'], data)
  if (showLogin) document.getElementById('error-login-form').style.display = 'block'
  else document.getElementById('error-login-form').style.display = 'none'
})

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('save-configuration-btn')
    .addEventListener('click', event => {
      event.preventDefault()
      const user =
        (document.getElementById('user-input').value || '').trim()
      const authorization =
        (document.getElementById('authkey-input').value || '').trim()

      if (!user) {
        document.getElementById('user-input-container').classList.add('has-error')
        document.getElementById('user-help').classList.remove('hide')
      } else {
        document.getElementById('user-input-container').classList.remove('has-error')
        document.getElementById('user-input-container').classList.add('has-success')
        document.getElementById('user-help').classList.add('hide')
      }

      if (!authorization) {
        document.getElementById('authkey-input-container').classList.add('has-error')
        document.getElementById('authkey-help').classList.remove('hide')
      } else {
        document.getElementById('authkey-input-container').classList.remove('has-error')
        document.getElementById('authkey-input-container').classList.add('has-success')
        document.getElementById('authkey-help').classList.add('hide')
      }

      if (authorization && user) {
        electron.ipcRenderer.send('save-config', { user, authorization })
      }
    })
})
