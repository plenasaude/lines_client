const { app, BrowserWindow } = require('electron')
const path = require('path')
const url = require('url')
const axios = require('axios')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow() {
  // create the browser window
  win = new BrowserWindow({ width: 800, height: 800 })

  // and load the index.html of the app
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'views', 'totem.html'),
    protocol: 'file',
    slashes: true,
  }))

  // Open the DevTools
  win.webContents.openDevTools()

  // Emitted when the window is closed
  win.on('close', () => { win = null })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar to stay active
  // until the user quits explicitly with cmd + q
  //if (process.platform !== 'darwin') app.quit()
  app.quit()
})

//app.on('activate', () => {
   ////On macOS it's common to re-create a windown in the app when the dock icon
   ////is clicked and there are no other windows open.
  //if (win === null) createWindow()
//})

const api = 'http://localhost:3001'

exports.nextNormalQueue = function nextNormalQueue() {
  console.log('nextNormalQueue')
  //let popup = new BrowserWindow({ width: 200, height: 200 })
  //popup.loadURL(url.format({
    //pathname: path.join(__dirname, 'next_number.html'),
    //protocol: 'file',
    //slashes: true,
  //}))

  //axios.get(`${api}/normal`)
    //.then(res => {
      //console.log(res.data)
      //win.webContents.send('data', { num: `normarl: ${res.data}` })
      //win.webContents.print({ silent: true });
      //popup.webContents.send('data', { num: res.data })
      //setTimeout(() => { popup.close() }, 3000)
    //})
    //.catch(e => console.log(e))
}


exports.nextPreferencialQueue = function nextPreferencialQueue() {
  console.log('next preferencial number')

  //axios.get(`${api}/preferencial`)
    //.then(res => {
      //console.log(res.data)
      //win.webContents.send('data', { num: `pref: ${res.data}` })
      //win.webContents.print({ silent: true });
    //})
    //.catch(e => console.log(e))

  //let popup = new BrowserWindow({ width: 200, height: 200 })
  //popup.loadURL(url.format({
    //pathname: path.join(__dirname, 'next_number.html'),
    //protocol: 'file',
    //slashes: true,
  //}))

  //setTimeout(() => { popup.close() }, 3000)
}

