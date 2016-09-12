const fs = require("fs");

module.exports =  class GetProperty {
	constructor(process_name, paths, index, options) {
       this.property = [];

      	 if (index == 0){
            let contents      = fs.readFileSync(paths + "/config/config.json", 'utf8');
            this.options      = JSON.parse(contents);
            let tmp_proglength = this.check_value(this.options)
            if (tmp_proglength > this.num_prog) {
            	console.log("Json contain New prog.")
            	new Process(this.options[process_name], array[array.length]);
            }
    	} else
            this.options = options
        this.startretries = this.options[process_name].startretries;
        return this.options[process_name];
	 }
}