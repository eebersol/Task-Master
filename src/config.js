const fs = require('fs');

module.exports = class Config {
  constructor() {
    this.options = {};

    this.load_config();
  }

  load_config() {
    try {
      let contents = fs.readFileSync("./config/config.json", 'utf8');
      this.options = JSON.parse(contents);
    }
    catch(e) {
      console.error("Config file not found");
      process.exit(0);
    }
  }
};
