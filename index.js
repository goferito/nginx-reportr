 

var app = require('./app')

//Start nginx reporter with the default configuration (./config)
app.startNginxReporter();

// TODO create an interval that looks for not sent reports due to
// connection problems with the server
