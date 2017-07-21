const electron = require('electron')
const log = require('electron-log')
const { autoUpdater } = require('electron-updater')
const path = require('path')
const url = require('url')
const R = require('ramda')

const isDev = require('./src/is_dev')
const autoupdate = require('./src/autoupdate')
const configuration = require('./src/configuration')
const screens = require('./src/screens')

log.info('App starting...')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function loadApplication() {
  return screens.start()
    .then(() => {
      win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file',
        slashes: true,
      }))
    })
}

function loadErrorView({ message, payload }) {
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'views', 'error.html'),
    protocol: 'file',
    slashes: true,
  }))

  win.webContents.on('did-finish-load', () => {
    win.webContents.send('data', { message, payload })
  })
}

function createWindow() {
  // create the browser window
  win = new electron.BrowserWindow({ width: 800, height: 800 })

  // TODO: if config not found open a window to enter user, password and store
  // it in the root directory
  // and load the index.html of the app
  configuration.get()
    .then(loadApplication)
    .catch(errorPayload => loadErrorView({
      message: 'Configurações não encontradas',
      payload: R.merge(errorPayload, { showLogin: true }),
    }))

  if (!isDev) win.setKiosk(true)

  // Emitted when the window is closed
  win.on('close', () => { win = null })
}

electron.app.on('ready', createWindow)

electron.app.on('window-all-closed', () => electron.app.quit())

electron.app.on('ready', function () {
  if (!isDev) autoupdate.run(autoUpdater, win, log)
})

electron.ipcMain.on('get-logo', event => {
  event.sender.send('logo', screens.logo())
})

electron.ipcMain.on('print-ticket', (event, ticket) => {
  const passwordWindow = new electron.BrowserWindow({
    show: false,
    width: 380,
    height: 370,
  })

  passwordWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'views', 'print.html'),
    protocol: 'file',
    slashes: true,
  }))

  passwordWindow.webContents.on('did-finish-load', () => {
    passwordWindow.webContents.send('ticket', R.merge(ticket, {
      text: screens.text(),
      logo: screens.logo(),
    }))
  })

  passwordWindow.once('ready-to-show', () => {
    if (isDev) {
      passwordWindow.show()
    } else {
      passwordWindow.webContents.print({ silent: true })
    }
  })

  event.returnValue = true
})

electron.ipcMain.on('save-config', (event, config) => configuration.set(config)
    .then(loadApplication))

electron.ipcMain.on('application-error', (event, error) => {
  loadErrorView(error)
})
