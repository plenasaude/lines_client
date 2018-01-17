const electron = require('electron')
const log = require('electron-log')
const { autoUpdater } = require('electron-updater')
const path = require('path')
const url = require('url')
const R = require('ramda')
const Promise = require('bluebird')

const isDev = require('./src/is_dev')
const autoupdate = require('./src/autoupdate')
const configuration = require('./src/configuration')
const screens = require('./src/screens')

log.info('App starting...')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function getConfigInfoErrors(configInfo) {
  if (!configInfo || R.isEmpty(configInfo)) {
    return Promise.reject({
      message: 'Erro ao fazer login: tela não encontrada',
      payload: { showLogin: true, error: 'empty configInfo' }
    })
  } else if (!configInfo.queues) {
    return Promise.reject({
      message: 'Erro ao fazer login: tela não contem nenhuma fila',
      payload: { showLogin: true, error: 'no queues' }
    })
  } else if (!configInfo.type) {
    return Promise.reject({
      message: 'Erro ao fazer login: tipo da tela não encontrado',
      payload: { showLogin: true, error: 'no screen type' }
    })
  }
  return configInfo
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

function loadApplication() {
  return screens.start()
    .then(getConfigInfoErrors)
    .then(configInfo => {
      win.queues = configInfo.queues
      win.loadURL(url.format({
        pathname: path.join(__dirname, 'views', configInfo.type + '.html'),
        protocol: 'file',
        slashes: true,
      }))
    })
    .catch(loadErrorView)
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

electron.ipcMain.on('get-queues-info', event => {
  event.sender.send('queues-info', win.queues)
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
