const isDev = require('./src/is_dev')

module.exports = {
  apiUrl: isDev ? 'http://localhost:3006' : 'http://lines.edocsaude.com',
}
