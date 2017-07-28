const isDev = require('./src/is_dev')

module.exports = {
  apiUrl: isDev ? 'http://localhost:3006' : 'https://lines.edocsaude.com',
}
