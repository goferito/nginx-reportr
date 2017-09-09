
var secrets = require('../secrets')
  , _ = require('underscore');


var defaults = {

  // Path to the nginx log
  nginxLogFile: __dirname + '/../test/fixtures/nginx.log' 

  // Path to the nginx reports local db
, nginxLocalDB: __dirname + 'nginx.data.db'

  // Reportr backend host
, reportrHost: 'http://localhost:5000'

  // Reportr credentials
, reportrAuth: {
    username: secrets.reportr.username,
    password: secrets.reportr.password
}

  // List of desired reports
, nginxReports: [
    {
      name: '404.total',
      conditions: {
        status: '404'
      }
    },
    {
      name: '5xx.total',
      conditions: {
        status: /5[0-9]{2}/
      }
    }
  ]
};


// Extend default config with environment dependent config
if (process.env.NODE_ENV === 'production') {
  _.extend(defaults, require('./production'));
}


module.exports = defaults;
