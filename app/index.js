
var config = require('../config')
  , parser = require('./parser')
  , DataStore = require('nedb')
  , fs = require('fs')
  , Reportr = require('reportr-api')
  , db = {}

var me = module.exports = {};


var nginxReports = config.nginxReports;
var nginxAvgValues = {};



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
  var nginxLogFile = options.logfile || config.nginxLogFile
    , localdb = options.localdb || config.nginxLocalDB
    , reportrHost = options.reportrHost || config.reportrHost
    , reportrAuth = options.reportrAuth || config.reportrAuth

  //Check that nginx log file really exists
  if(!fs.existsSync(nginxLogFile)){
    throw new Error('Nginx log file not found: ' + nginxLogFile);
  }

  // Init local data store
  db.reports = new DataStore({
    filename: localdb,
    autoload: true
  });

  // Create the reportr client
  var reportr = new Reportr({
    host: reportrHost,
    //auth: reportrAuth
  });

  // TODO create a status db to store the time of the last report
  // so if the service restarts, it doesnt report everything again

  // Start nginx reporter
  parser.startReporting(nginxLogFile, nginxReports, function(report){

    // On every report, store it in the local db, then try to send it
    // to the server. When a OK response is got, delete it from the local db.
    // This avoids data loss in case of connectivity problems.

    console.log('Reporting:');
    console.log(report);

    db.reports.insert(report, function(err){
      if(err) console.error(err);
      console.log(' - report saved');

      // Send a report to the Reportr backend
      reportr.postEvent(report.name, {
        count: report.count,
        time: report.time
      })
      .then(function(res){
        console.log('this is res:', res);
      })
      .fail(function(err){
        console.error('the problem is', err);
      });
      //TODO if the promise is fulfiled, delete the report from the localdb
    });

  });
    
};

