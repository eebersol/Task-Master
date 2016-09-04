const Process = require("./process");
const child_process = require("child_process");


module.exports = class ProcessManager {
	constructor(taskmaster) {

		this.processes = {};
		this.taskmaster = taskmaster;
		this.name_array = [];
		let index_array = 0;
		this.paths = process.cwd();
		console.log("PATH 1 : " +process.cwd());

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
			console.log("Stop need argument.");
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
			console.log("invalid process name.");
		}


	}

	restart(cmd) {

		if (cmd == null) {
			console.log("Restart need argument.")
			return;
		}
			
		if (this.check_name(cmd) === true) {
			this.stop_one(cmd);
			this.start_one(cmd);
		} else {
			console.log("invalid process name.");
		}
		
	}

	check_status() {

		let	i = 0;
		let index = 0;
		let lenght = this.array_lenght(this.name_array);

		console.log(" ");

		while (i < lenght)
		{
			let processes = this.processes[this.name_array[i]];
			let str = this.name_array[i];
			while (processes[index]) {
				processes[index].status(str, index);
				index++;
			}
			index = 0;
			i++;
		}

		console.log(" ");
	}

	check_name(cmd) {

		let index = 0;

		while (this.name_array[index]) {
			if (cmd == this.name_array[index]) {
				return (true);
			}
			index++;
		}


	}

	array_lenght(name_array) {

		let index = 0;

		while (name_array[index]) {
			index++;
		}
		return (index);
	}


}