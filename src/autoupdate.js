exports.run = function run(autoUpdater, win, log) {
  function sendStatusToWindow(text) {
    log.info(text)
    win.webContents.send('message', text)
  }

  autoUpdater.logger = log
  autoUpdater.logger.transports.file.level = 'info'

  autoUpdater.on('checking-for-update', () => {
    sendStatusToWindow('Checking for update...')
  })

  autoUpdater.on('update-available', (info) => {
    sendStatusToWindow('Update available.')
  })

  autoUpdater.on('update-not-available', (info) => {
    sendStatusToWindow('Update not available.')
  })

  autoUpdater.on('error', (err) => {
    sendStatusToWindow('Error in auto-updater.')
  })

  autoUpdater.on('download-progress', (progressObj) => {
    let log_message = "Download speed: " + progressObj.bytesPerSecond
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%'
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')'
    sendStatusToWindow(log_message)
  })

  autoUpdater.on('update-downloaded', (info) => {
    sendStatusToWindow('Update downloaded will install in 5 seconds')
  })

  autoUpdater.on('update-downloaded', (info) => {
    setTimeout(function() {
      autoUpdater.quitAndInstall()  
    }, 5000)
  })

  autoUpdater.checkForUpdates()
}
