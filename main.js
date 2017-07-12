const { app, BrowserWindow } = require('electron')
const log = require('electron-log')
const { autoUpdater } = require("electron-updater")

const path = require('path')
const url = require('url')

const isDev = require('./src/is_dev')
const autoupdate = require('./src/autoupdate')

const getConfig = require('./src/get_configuration')

log.info('App starting...')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function loadApplication() {
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file',
    slashes: true,
  }))
}

function loadErrorView(errorMessage) {
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'views', 'error.html'),
    protocol: 'file',
    slashes: true,
  }))

  setTimeout(() => {
    console.log(errorMessage)
    win.webContents.send('data', { message: errorMessage })
  }, 1000)
}

function createWindow() {
  // create the browser window
  win = new BrowserWindow({ width: 800, height: 800 })

  // and load the index.html of the app
  getConfig()
    .then(loadApplication)
    .catch(() => loadErrorView('Configurações da tela não encontradas'))

  //win.setKiosk(true)

  // Open the DevTools
  win.webContents.openDevTools()

  // Emitted when the window is closed
  win.on('close', () => { win = null })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => app.quit())

app.on('ready', function()  {
  if (!isDev) autoupdate.run(autoUpdater, win, log)
})
