const child_process = require("child_process");
const fs 			= require("fs");
const util 			= require("util");
const exec			= require('child_process').exec;

module.exports = class Process {
	constructor(options, cmd, paths) {

		let contents = fs.readFileSync(paths +"/config/config.json", 'utf8');
		this.options = JSON.parse(contents);
		
		let opt = options.cmd.split(" ");
		let _cmd = opt[0];
  		opt.splice(0, 1);

		let workdir = this.options[cmd].workingdir; // pour set le bon workingdir
		let log_file = fs.createWriteStream(this.options[cmd].stdout, {flags : 'a'});
		let log_err  = fs.createWriteStream(this.options[cmd].stderr, {flags : 'a'});

		this.spawn_process(_cmd, log_file, log_err, opt, workdir);
	}

	spawn_process(_cmd, log_file, log_err, opt, workdir) {

		process.chdir(workdir);
		this._process = child_process.spawn(_cmd, [opt]);

		this._process.stdout.on("data", function(data) {	
			console.log = function(d) {
 				log_file.write(util.format(d) + '\n');
 				process.stdout.write(util.format(d) + '\n');
			};
			console.log("stdout " +data);
		});

		this._process.stderr.on("data", function(data) {
			console.log = function(d) {
 				log_err.write(util.format(d) + '\n');
 				process.stderr.write(util.format(d) + '\n');
			};
			console.log("stderr " +data);
		});
	
		this._process.on("close", function(code) {
			//console.log("fin du code : " +code);
			// si code d'erreur (2)checker si le programme doit s'autorestart
		});
	}

	stop() {

		this._process.kill("SIGINT");
		this._process.pid = null;
	}

	status(str, index) {

		if (this._process.pid != null) {
			console.log("process [" +str +"] n˚" +index +" - up");
		} else {
			console.log("process [" +str +"] n˚" +index +" - down");
		}
	}
}
