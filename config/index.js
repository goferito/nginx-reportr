const defaults = {
  // Path to the nginx log
  nginxLogFile: __dirname + '/../test/fixtures/nginx.log',
  // nginxLogFile: '/var/lib/docker/containers/ff8386beb8828a67f1b44457fab1dc46811fb239ee5e624aa28179ce7abf5e2e/ff8386beb8828a67f1b44457fab1dc46811fb239ee5e624aa28179ce7abf5e2e-json.log',
  // Path to the nginx reports local db
  nginxLocalDB: process.cwd() + '/nginx.data.db',
  // List of desired reports
  nginxReports: [
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
  ],
  influxHost: 'localhost',
  influxPort: 8086,
  influxDb: 'nginxreporter'
};

// Extend default config with environment dependent config
if (process.env.NODE_ENV === 'production') {
  Object.assign(defaults, require('./production'));
}

module.exports = defaults;
