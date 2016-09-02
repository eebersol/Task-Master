const child_process = require("child_process");

module.exports = class Process {
	constructor(options) {

		console.log(options.cmd);

		var opt = options.cmd.split(" ");
		var _cmd = opt[0];
  		opt.splice(0, 1);
		
		this._process = child_process.spawn(_cmd, [opt]);

		this._process.stdout.on("data", function(data) {
			console.log("stdout " +data);
		});

		this._process.stderr.on("data", function(data) {
			console.log("stderr " +data);
		});

		this._process.on("close", function(code) {
			console.log("fin du code : " +code);
			// si code d'erreur (2)checker si le programme doit s'autorestart
		});
	}

	stop() {

		this._process.kill("SIGINT");
		this._process.pid = null;
	}

	status() {

		if (this._process.pid != null){
			console.log("Process running.");
		} else {
			console.log("Process stoppped.");
		}
	}
}
