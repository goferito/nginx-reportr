const fs = require('fs')
const DataStore = require('nedb')

const config = require('../config')
const parser = require('./parser')
const client = require('./influxdb')

const db = {}
const me = module.exports = {};
const nginxReports = config.nginxReports;
const nginxAvgValues = {};

/**
 * Starts the nginx reporter with the environment config, or ovewriting it
 * with the passed argument options.
 *
 * @param {Object} options - {
 *                             logfile: 'path to nginx log file',
 *                             localdb: 'path to local db'
 *                             reportrHost: 'reportr server host'
 *                             reportrAuth: '(optional) basic server auth'
 *                           }
 */
me.startNginxReporter = function(options){
  options = options || {};

  // Give preference to the options in the arguments
  const nginxLogFile = options.logfile || config.nginxLogFile
  const localdb = options.localdb || config.nginxLocalDB

  //Check that nginx log file really exists
  if(!fs.existsSync(nginxLogFile)){
    throw new Error('Nginx log file not found: ' + nginxLogFile);
  }

  // Init local data store
  db.reports = new DataStore({
    filename: localdb,
    autoload: true
  });

  // Start nginx reporter
  parser.startReporting(nginxLogFile, nginxReports, function(report) {

    // On every report, store it in the local db, then try to send it
    // to the server. When a OK response is got, delete it from the local db.
    // This avoids data loss in case of connectivity problems.

    console.log('Reporting:');
    console.log(report);

    db.reports.insert(report, function(err) {
      if(err) console.error(err);

      // client.getDatabaseNames()
      // .then(names => {
      //   console.log(names)
      // })
      // { name: '5xx.total', count: 1, time: 2015-06-25T04:49:00.000Z }
      client.writePoints([{
        measurement: report.name,
        fields: {
          count: report.count,
          serverTime: new Date(report.time).getTime()
        },
      }])
        .then(res => {
          console.log('report saved')
        })
        .catch(console.error)

    });

  });
    
};
