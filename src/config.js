const fs = require('fs');

module.exports = class Config {
  constructor() {
    this.options = {};

    this.load_config();
  }

  load_config(path) {
    if (path == null)
      path = process.cwd();
    try {
      let contents = fs.readFileSync(path + "/config/config.json", 'utf8');
      this.options = JSON.parse(contents);
    }
    catch(e) {
      console.error("Config file not found");
      process.exit(0);
    }
  }
};
