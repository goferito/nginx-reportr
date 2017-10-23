const Influx = require('influx')

const { username, password } = require('../secrets').influxdb
const { influxHost, influxPort, influxDb } = require('../config')

const influx = new Influx.InfluxDB({
  host: influxHost,
  database: influxDb,
  port: influxPort,
  username,
  password,
  schema: [
   {
     measurement: Influx.STRING,
     fields: {
       count: Influx.FieldType.INTEGER,
       serverTime: Influx.FieldType.STRING
     },
     tags: ['name']
   }
 ]
})

module.exports = influx
