const fs = require("fs");

module.exports =  class GetProperty {
	constructor(process_name, paths, index, options) {

        if (index == 0){
            let contents      = fs.readFileSync(paths + "/config/config.json", 'utf8');
            this.options      = JSON.parse(contents);
    	} else
            this.options = options
        this.startretries = this.options[process_name].startretries;
        return this.options[process_name];
	 }
}