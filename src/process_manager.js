console.log("test : " +exit_code.indexOf(code))
const child_process = require("child_process");


module.exports = class ProcessManager {
	constructor(taskmaster) {

		this.processes 	= {};
		this.taskmaster = taskmaster;
		this.name_array = [];
		this.paths 		= process.cwd();
		let index_array = 0;

		for (let process_name in taskmaster.config.options) {
			this.name_array[index_array] = process_name;
			this.start_one(process_name, index_array, this.paths);
			index_array++;
		}

	}

	start_one(cmd, index_array, paths) {

		this.processes[cmd] = [];
		let index = 0;

		if (this.check_name(cmd) === true) {
			while (index < this.taskmaster.config.options[cmd].numprocs) {
				if (this.taskmaster.config.options[cmd].autostart == true) { // permet de check si autostart
					let _process = new Process(this.taskmaster.config.options[cmd], this.name_array[index_array], this.paths); 
					this.processes[cmd].push(_process);
				}
				index++;
			}
		}
	}

	stop_one(cmd) {
	
		if (cmd == null) {
			console.log("Error : stop requires a process name");
			console.log("stop <name>            Stop a process");
			console.log("stop <name> <name>     Stop multiple process");
			console.log("stop all               Stop all process");
			return;
		}

		let processes = this.processes[cmd];
		let index = 0;

		 if (this.check_name(cmd) === true) {
			while (processes[index]) {
				processes[index].stop();
				index++;
			}
		} else {
			console.log("Error : invalid process name.");
		}


	}

	restart(cmd) {

		if (cmd == null) {
			console.log("Error : restart recquire process name.")
			return;
		}
			
		if (this.check_name(cmd) === true) {
			this.stop_one(cmd);
			this.start_one(cmd);
		} else {
			console.log("Error : invalid process name.");
		}
		
	}

	check_status(opts) {

		let i_opts 		= 0;
		let lenght 		= this.array_lenght(this.name_array);
		let index 		= 0;
		opts.splice(0, 1);
		let lenght_opts = this.array_lenght(opts);

		console.log("");

		if (opts[0] == undefined) {
			this.check_all_status(lenght);
		} else {
			while (i_opts < lenght_opts) {
				if (this.check_name(opts[i_opts]) === true) {
					let count = this.found_process(this.name_array, opts, i_opts);
					let processes = this.processes[this.name_array[count]];
					let str = this.name_array[count];
					while (processes[index]) {
						processes[index].status(str, index);
						index++;
					}} else if (this.check_name(opts[i_opts]) == undefined) {
						console.log("Error : " +opts[i_opts] +" : does not exist");
						console.log("");
						}
						i_opts++;
					}
				}
				console.log("");
	}

	check_all_status(lenght) {

		let index = 0;
		let	i = 0;

		while (i < lenght) {
			let processes 	= this.processes[this.name_array[i]];
			let str = this.name_array[i];
			while (processes[index]) {
				processes[index].status(str, index);
				index++;
			}
			index = 0;
			i++;
		}

	}

	check_name(cmd) {

		let index = 0;

		while (this.name_array[index]) {
			if (cmd == this.name_array[index]) {
				return true;
			}
			index++;
		}


	}

	array_lenght(name_array) {

		let index = 0;

		while (name_array[index]) {
			index++;
		}
		return index;
	}

	found_process(name_array, opts, i_opts) {

		let index = 0;
		while(name_array[index] != opts[i_opts]) {
			index++
		}
		return index;

	}
}