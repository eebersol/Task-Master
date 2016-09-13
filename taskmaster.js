var Config    		= require("./src/config");
var Readline 		= require("./src/readline");
var ProcessManager 	= require("./src/process_manager");
const Logger  = require("./src/logger.js");

class Taskmaster {
	constructor() {
		this.logger  = new Logger(this);
		this.config   = new Config();
		this.readline = new Readline(this);
		this.process_manager = new ProcessManager(this);
	}
}

new Taskmaster();