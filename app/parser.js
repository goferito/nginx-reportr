var NP = require('nginxparser')

var me = module.exports = {};


var parser = new NP('$remote_addr - $remote_user [$time_local] '
                    + '"$request" $status $body_bytes_sent "'
                    + '$http_referer" "$http_user_agent"');


/**
 * Reads the logfile, creates reports every minute based on
 * the report rules passed by, and calls the report callback
 * every time it considers a reports is finished.
 * @param {string} filepath - Absolute path to the nginx log file
 * @param {array} reports - List of report conditions for preparing
 *                          the reports
 * @param {function} report - Callback function to call everytime
 *                          a report is ready
 */
me.startReporting = function(filepath, reports, report){
  
  var lastTime = 0;
  var counters = reports.reduce(function(c,r) {
    //Create a counter per report and initialize it to zero
    c[r.name] = 0;
    return c;
  }, {});

  parser.read(filepath, { tail: true },
    function(row) {

      // Format the row time (25/Jun/2015:12:48:50 from log is not parsable)
      // excluding second, to have minute aggregation
      var day = row.time_local.substr(0,2)
        , month = row.time_local.substr(3,3)
        , year = row.time_local.substr(7,4)
        , time = row.time_local.substr(12,5)
        , rowTime = new Date(month + ' ' + day + ', ' + year + ' ' + time)

      // If the row time is bigger, send all the reports, and set the
      // counters to zero
      if (rowTime > lastTime) {
        if (lastTime) {
          for(var reportName in counters) {
            //Report the count
            report({
              name: reportName,
              count: counters[reportName],
              time: lastTime
            });

            counters[reportName] = 0;
          }
        }

        lastTime = rowTime;
      }

      // Check if the row matches the conditions of any report
      reports.forEach(function(r) {
        var satifiesConditions = Object.keys(r.conditions).every(function(c){
          
          //Conditions may be strings or regular expressions
          //(typeof regular expression == object)
          if (typeof r.conditions[c] === 'object') {
            return row[c].match(r.conditions[c]);
          } else if(typeof r.conditions[c] === 'string') {
            return row[c] === r.conditions[c];
          } else {
            throw new Error('Unacceptable contidition')
          }
          
        });

        if (satifiesConditions) {
          // Increment the counter for the current report
          counters[r.name] = (counters[r.name] || 0) + 1;
        }

      });
      
    }
  , function(err){
      console.err(err);
    });
};
