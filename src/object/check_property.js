const fs = require("fs");


module.exports =  class CheckProperty {
	constructor(old_json, taskmaster, process_name, path) {
		this.taskmaster 	= taskmaster;
       	this.property 		= [];
       	this.array			= [];
       	this.old_config 	= old_json;
      	let contents = fs.readFileSync(path +"/config/config.json", 'utf8');
      	let options = JSON.parse(contents);
      	this.new_config = options;
       	let new_prog = this.check_value(this.old_config, this.new_config)
		let nb_prog  = this.array.length;	
		this.list_keys();
		this.check_diff(process_name);
		this.apply_diff(process_name);
	 }

	 check_value (old_contents, new_contents) {
	 	let old_size  = 0;
	 	let	old_array = [];
	 	let new_size  = 0;
	 	let	new_array = [];

	 	Object.keys(old_contents).forEach(processes_name => { 
	 		old_array.push(processes_name);
	 		old_size++;
	 	});
	 	old_size++;

	 	Object.keys(new_contents).forEach(processes_name => {
	 		new_array.push(processes_name);
	 		new_size++;
	 	});
	 	new_size++;	 	

	 	this.array = new_array;

	 	if (new_size > old_size) {
	 		new_size = new_size - old_size;
	 		console.log(` ${new_size} new program in config.json`);
	 		return new_size;
	 	} else if (new_size < old_size) {
	 		new_size = new_size - old_size;
	 		console.log(` ${new_size} left program in config.json`);
	 		return new_size;
	 	} else
	 		return 0;
	 }

	 list_keys() {
	 	let tmp_property = Object.keys(this.new_config[this.array[0]]);
	 	tmp_property = tmp_property.toString();
	 	this.property = tmp_property.split(",");
	 }

	 check_diff(process_name) {
	 	this.property_modified = [];
	 	this.property.forEach(_property => {
	 		if (this.new_config[process_name][_property] !=
	 			 this.old_config[process_name][_property]) {
	 			this.new_config[process_name][_property]
	 			this.property_modified.push(_property);
	 		}
	 	});
	}

	apply_diff(process_name) {
		let index = 0;
		console.log(process_name);
		while (index < this.property_modified.length) {
			if (this.property_modified[index] == "cmd") {
				console.log(`Cmd modified Taskmaster need to restart prog to refresh cmd.`)
			//	this.taskmaster.process_manager.stop_one(process_name);
			} if (this.property_modified[index] == "numprocs") {
				let numprocs = this.old_config[process_name][this.property_modified[index]] 
								- this.new_config[process_name][this.property_modified[index]];
				if (numprocs > 0) {
					console.log(`Program : ${process_name} have ${numprocs} more process`)
					// Lauch x procs more
				}
				else {
					numprocs = numprocs.substring(1, numprocs.length);
					console.log(`Program : ${process_name} have ${numprocs} left process`)
					// kill x numprocs 
				}
			}
			index++

		}

	}


// utiliser la nouvelle config.json pour le reste
}