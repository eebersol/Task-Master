const Config    		= require('./src/config');
const Readline 			= require('./src/readline');
const ProcessManager 	= require('./src/process_manager');
const Logger  			= require('./src/logger.js');
const Api  	  			= require('./src/api.js');

class Taskmaster {
	constructor() {
		this.processes			= {};
		this.logger  			= new Logger(this);
		this.config  			= new Config();
		this.readline 			= new Readline(this);
		this.process_manager 	= new ProcessManager(this);
	    this.api 				= new Api(this);
	    this.state 				= 'stopped';
	}
}

new Taskmaster();