

var fs = require('fs')
  , rewire = require('rewire')
  , http = require('http')
  , express = require('express')
  
  
//var wiredApp = rewire('../app')
var app = require('../app')

//Note: Access private functions with wiredApp.__get__('funcName')

var LOG_FILE = __dirname + '/fixtures/nginx.log';

var callOnEndLog = [];

// Start the reporter with an empty log file, and add a line on an
// interval from the fixtures log
var logfile = __dirname + '/../tmpNginxLog.log'
  , localdb = __dirname + '/../testingNginx.db'

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


describe.only('App Integration', function(){

  this.timeout(1000 * 60 * 1.5);

var addedLine = 0
  , port = 54321
  , lines
  , server
  , expressApp


  // Create an empty log file, and append to it from the fixtures log,
  // to test tailing
  // Create a fake server to make sure it makes the calls
  before(function(done){

    //Remove the file if exists
    if(fs.existsSync(logfile)){
      console.log('Removing tmp log file...');
      fs.unlinkSync(logfile);
    }

    //Remove testing db if exists
    if(fs.existsSync(localdb)){
      console.log('Removing testing db...');
      fs.unlinkSync(localdb);
    }

    fs.readFile(LOG_FILE, 'utf-8', function(err, file){
      lines = file.split('\n')

      // Add the firs line to make sure the log exists
      fs.appendFileSync(logfile, lines[addedLine++] + '\n');

      var interval = setInterval(function(){
        fs.appendFileSync(logfile, lines[addedLine++] + '\n');
        if(addedLine >= lines.length){
          clearInterval(interval);
          callOnEndLog.forEach(function(cb){
            cb();
          });
          
        }
      }, 5);

      // Create a fake server to make sure it makes the calls
      expressApp = express();
      server = http.createServer(expressApp);
      server.listen.apply(server, [port, function(err, res){
        if(err) done(err);
        else done();
      }]);
    });

  });


  after(function(done){

    console.log('Cleaning...');

    // Cleaning
    fs.unlinkSync(logfile);
    fs.unlinkSync(localdb);

    server.close();
    expressApp = null;
    server = null;

    done();
  });


  it('reports properly', function(done){
    //FIXME no se como hacer para comprobar que el reporter esta haciendo algo
    app.startNginxReporter({
      logfile: logfile,
      localdb: localdb
    });

    callOnEndLog.push(done);
    //setTimeout(done, 50000)
  });


  //TODO el xpressApp puede mirar que la peticion tiene el formato adecuado, 
  //y responder en consecuencia, incluso no constestar a alguna para comprobar
  //que el reporte queda en la DB
  it('posts the reports to the server', function(done){
    expressApp.post('*', function(req, res){
      console.log(req);
    });
    done();
  });


  it('not confirmed reports stay in the localdb', function(done){
    done(new Error('Not checked'));
  });

  
});

