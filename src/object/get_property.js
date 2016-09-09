const fs = require("fs");

module.exports =  class GetProperty {
	constructor(process_name, paths, index, options) {

		this.process_name = process_name;
        if (index == 0){
            this.old_options = options;
            let contents      = fs.readFileSync(paths + "/config/config.json", 'utf8');
            this.options      = JSON.parse(contents);
           // this.check_diff();
    	} else
            this.options = options;
        this.startretries = this.options[this.process_name].startretries;
        return this.options[this.process_name];
	 }

	 check_diff() {
	 		this.check_cmd();
	 		this.check_numprocs();
	 		this.check_umask();
	 		this.check_working_dir();
	 		this.check_autostart();
	 		this.check_exitcodes();
	 		this.check_startretries();
	 		this.check_stoptime();
	 		this.check_stoptime();
	 		this.check_stopsignal();
	 		this.check_stdout();
	 		this.check_stderr();
//	 		this.check_env();
	 }

	 check_numprocs() {
	 	let procs1 = parseInt(this.old_options[this.process_name].numprocs)
	 	let procs2 = parseInt(this.options[this.process_name].numprocs);
	 	let numprocs = procs1 - procs2;

	 	console.log(`numprocs : ${numprocs} :::: ${procs1} - ${procs2}`);
	 	if (numprocs > 0)
	 		console.log(`Taskmaster : close ${numprocs} process of -> [ ${this.process_name} ]`);
	 	else if (numprocs < 0) {
	 		numprocs = numprocs.toString()
	 		numprocs = numprocs.substring(1, numprocs.length)
	 		console.log(`Taskmaster : start ${numprocs} process more of -> [ ${this.process_name} ]`);
	 	} else
	 		return ;
	 }

	check_cmd() {
		if(this.options[this.process_name].cmd
			!= this.old_options[this.process_name].cmd)
	 			console.log(`Error [${this.process_name}]: process name are different, process need to restart.`);
	}

	check_umask() {
		if(this.options[this.process_name].umask
			!= this.old_options[this.process_name].umask)
				console.log(`Taskmaster [${this.process_name}]: umask change new : ${this.options[this.process_name].umask} | old : this.old_options[this.process_name].umask, need to be restart.`);
	}

	check_working_dir() {
		if(this.options[this.process_name].workingdir
			!= this.old_options[this.process_name].workingdir)
			console.log(`Taskmaster [${this.process_name}]: workingdir change new : ${this.process_name} | old : ${this.old_options[this.process_name].workingdir}, need to restart.`);
	}

	check_autorestart() {
		if(this.options[this.process_name].autorestart
			!= this.old_options[this.process_name].autorestart)
				console.log(`Taskmaster : autorestart change value new : ${this.options[this.process_name].autorestart} | old : ${this.old_options[this.process_name].autorestart}.`);
	}

	check_exitcodes() {
		if(this.options[this.process_name].exitcodes
			!= this.old_options[this.process_name].exitcodes)
				console.log(`Taskmaster : exitcodes change value for ${this.options[this.process_name].exitcodes}.`);
	}

	check_startretries()  {
		if(this.options[this.process_name].startretries
			!= this.old_options[this.process_name].startretries)
			console.log(`Taskmaster : startretrie change value new : ${this.options[this.process_name].startretries} | old : ${this.old_options[this.process_name].startretries}`);
	}

	check_starttime() {
		if(this.options[this.process_name].starttime
			!= this.old_options[this.process_name].starttime) {
				console.log(`Taskmaster : startretrie change value new : ${this.options[this.process_name].starttime}
					| old : ${this.old_options[this.process_name].starttime}`);
		}
	}

	check_stoptime() {
		if(this.options[this.process_name].stoptime
			!= this.old_options[this.process_name].stoptime) {
				console.log(`Taskmaster : startretrie change value new : ${this.options[this.process_name].stoptime}
					| old : ${this.old_options[this.process_name].stoptime}`);
		}
	}

	check_stopsignal() {
		if(this.options[this.process_name].stopsignal
			!= this.old_options[this.process_name].stopsignal) {
				console.log(`Taskmaster : startretrie change value new : ${this.options[this.process_name].stopsignal}
					| old : ${this.old_options[this.process_name].stopsignal}`);
		}
	}

	check_stdout() {
		if(this.options[this.process_name].stdout
			!= this.old_options[this.process_name].stdout) {
				console.log(`Taskmaster : startretrie change value new : ${this.options[this.process_name].stdout}
					| old : ${this.old_options[this.process_name].stdout}`);
		}
	}

	check_stderr() {
		if(this.options[this.process_name].stderr
			!= this.old_options[this.process_name].stderr) {
				console.log(`Taskmaster : startretrie change value new : ${this.options[this.process_name].stderr}
					| old : ${this.old_options[this.process_name].stopsignal}`);
		}
	}
}
