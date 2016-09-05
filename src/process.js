
const child_process = require("child_process");
const fs 			= require("fs");
const util 			= require("util");
const exec			= require('child_process').exec;
const Timer 			= require('../node_modules/easytimer.js')


module.exports = class Process {
	constructor(options, cmd, paths, test) {
		
		let contents = fs.readFileSync(paths +"/config/config.json", 'utf8');
		this.options = JSON.parse(contents);

		let opt = options.cmd.split(" ");
		let _cmd = opt[0];
  		opt.splice(0, 1);

  		console.log("test : " +test);
  		if (cmd == undefined)
  			cmd = test;
  		console.log("cmd apres test : " +cmd)
		this.spawn_process(_cmd, opt, cmd);
	}

	spawn_process(_cmd, opt, cmd) {

		let workdir 	= this.options[cmd].workingdir;
		let umask_value = this.options[cmd].umask;
		let log_file 	= fs.createWriteStream(this.options[cmd].stdout, {flags : 'a'});
		let log_err  	= fs.createWriteStream(this.options[cmd].stderr, {flags : 'a'});
		let exit_code 	= this.options[cmd].exitcodes;
		const that 		= this;

		process.umask(umask_value);
		process.chdir(workdir);
		process.env.ANSWER;
		process.env.STARTDED_BY;

	/*	while (num < index) {
			let test = env_array[index_array];
			let tmp = process.env;
			num++;
		}
	*/
		this.timer();

		this._process = child_process.spawn(_cmd, [opt]);

		this._process.stdout.on("data", (data) => {	
			console.log = function(d) {
 				log_file.write(util.format(d) + '\n');
 				process.stdout.write(util.format(d) + '\n');
			};
			//console.log("stdout " +data);
		});

		this._process.stderr.on("data", (data) => {
			console.log = function(d) {
 				log_err.write(util.format(d) + '\n');
 				process.stderr.write(util.format(d) + '\n');
			};
			//console.log("stderr " +data);
		});
	
		this._process.on("close", (code) => {
			if (exit_code.indexOf(code) != -1) {
				return;
			} else {
				console.log("Error : crash restart process");
				that.restart(cmd);
			}
		});
	}

	stop() {

		this._process.kill("SIGINT");
		this._process.pid = null;
	}

	status(str, index) {

		if (this._process.pid != null) {
			console.log("[ " +str +" ]" +"     process number : " +index +"            RUNNING      " +"pid " +this._process.pid +", uptime " + this.timer_end());
		} else {
			console.log("[ " +str +" ]" +"     process number : " +index +"            STOPPED");
		}
		console.log("");
	}

	timer() {

		this.timer = new Timer();
		this.timer.start();
	}

	timer_end() {

		let time = this.timer.getTimeValues().toString();
		return time;
	}
}

