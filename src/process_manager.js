const Process = require("./process");


module.exports = class ProcessManager {
	constructor(taskmaster) {

		this.processes = {};
		this.taskmaster = taskmaster;

		for (let process_name in taskmaster.config.options) {
			this.start_one(process_name);
		}
	}

	start_one(cmd) {
		let index = 0;
		this.processes[cmd] = [];

		while (index < this.taskmaster.config.options[cmd].numprocs) {
			if (this.taskmaster.config.options[cmd].autostart == true) { // permet de check si autostart
				let _process = new Process(this.taskmaster.config.options[cmd]); 
				this.processes[cmd].push(_process);
			}
				index++;
		}
	}

	stop_one(cmd) {

		if (cmd == null) {
			console.log("Stop need argument.");
			return;
		}

		let processes = this.processes[cmd];
		let index = 0;
		// checker si le processus existe 
		while (processes[index]) {
			processes[index].stop();
			index++;
		}


	}

	restart(cmd) {

		if (cmd == null) {
			console.log("Restart need argument.")
			return;
		}
			
		this.stop_one(cmd);
		this.start_one(cmd);
		
		}

	check_status(cmd) {

		let processes = this.processes[cmd];
		let index = 0;

		while (processes[index]) {
			processes[index].status();
			index++;
		}

	}

}