const isDev = require('./src/is_dev')

module.exports = {
  apiUrl: isDev ? 'http://localhost:3006' : 'http://75f96ad5.ngrok.io',
}
