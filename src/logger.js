const fs = require('fs');
const winston  = require('winston');
require('winston-loggly');

module.exports = class Logger {
  constructor(taskmaster) {
    let file_config = {
        flags: 'a'
    }
    winston.remove(winston.transports.Console);
    winston.add(winston.transports.Loggly, {
      token: 'd3dbd4de-3e6d-41d5-9dd9-07d04b9bb614',
      subdomain: 'edouard ebersoldt',
      tags: ['taskmaster'],
      json:true
    });
    fs.appendFileSync(`${__dirname}/../logs/taskmaster.logs`, '', file_config);
    this.stream = fs.createWriteStream(`${__dirname}/../logs/taskmaster.logs`, file_config);
  }

  error(str) {
    this.generic('ERROR', str);
  }

  warn(str) {
    this.generic('WARN', str);
  }

  info(str) {
    this.generic('INFO', str);
  }

  generic(type, str) {
    let ts = this.__get_timestamp();
    if (this.stream)
      this.stream.write(`[${ts}] [${type}] ${str}\n`);
    winston.log('info',`[${ts}] [${type}] ${str}`);
  }

  __get_timestamp() {
    return parseInt(Date.now() / 1000);
  }

}