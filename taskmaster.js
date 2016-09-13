var Config    		= require("./src/config");
var Readline 		= require("./src/readline");
var ProcessManager 	= require("./src/process_manager");

class Taskmaster {
	constructor() {
		this.config   = new Config();
		this.readline = new Readline(this);
		this.process_manager = new ProcessManager(this);
	}
}

new Taskmaster();