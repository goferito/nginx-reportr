
var nginxReporter = require('../app/parser')

var fs = require('fs')

var LOG_FILE = __dirname + '/fixtures/nginx.log';

describe('Nginx Reporter', function(){

  var reports = [
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
    },
  ];

  it('reports all expected reports', function(done){

    var expectedReports = 10
      , reportsCount = 0;
    
    nginxReporter.startReporting(LOG_FILE, reports, function(report){
      reportsCount++;

      //console.log('Reporting:', reportsCount, report);
      
      //TODO checks over the reports
      
      if(reportsCount >= expectedReports) done();
    });

  });


  it('tails the log file and keeps reporting', function(done){
    this.timeout(1000 * 60);

    // Start the reporter with an empty log file, and add a line on an
    // interval from the fixtures log
    var logfile = __dirname + '/../tmpNginxLog.log';

    //Remove the file if exists
    if(fs.existsSync(logfile)){
      console.log('Removing tmp log file..');
      fs.unlinkSync(logfile);
    }
    
    var addedLine = 0;

    fs.readFile(LOG_FILE, 'utf-8', function(err, file){
      var lines = file.split('\n')

      // Add the firs line to make sure the log exists
      fs.appendFileSync(logfile, lines[addedLine++] + '\n');

      nginxReporter.startReporting(logfile, reports, function(report){
        //TODO 
        // Check if the values for the report are correct
      });

      setInterval(function(){
        fs.appendFileSync(logfile, lines[addedLine++] + '\n');
        if(addedLine >= lines.length){

          //TODO check all the reports have been done

          // Cleaning
          fs.unlinkSync(logfile);
          
          return done();
        }
      }, 1);

    });
  });

});

