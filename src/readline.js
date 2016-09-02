const readline 	= require("readline");
//const exit 		= require("exit");

module.exports = class Readline {

	constructor(taskmaster) {

		this.taskmaster = taskmaster;
		this.readline = readline.createInterface(process.stdin, process.stdout);
		this.readline.setPrompt("taskmaster>", 11);
		this.readline.on("line", this.on_command.bind(this));
  		this.readline.prompt();
	}

	on_command(cmds) {

		let opts = cmds.split(" ");

		if (opts[0] == "help"){
			this.help();
		} else if (opts[0] == "stop") {
			this.taskmaster.process_manager.stop_one(opts[1]);
		} else if (opts[0] == "restart") {
			this.taskmaster.process_manager.restart(opts[1]);
		} else if (opts[0] == "status") {
			this.taskmaster.process_manager.check_status(opts[1]);
		} else if (opts[0] == "shutdown") {
			process.exit(1);
		}  else if (opts[0] == "start") {
			this.taskmaster.process_manager.start_one(opts[1]);
		} else if (cmds != "") {
			console.log(opts[0], ": command not found");
		}
		this.readline.setPrompt("taskmaster>", 11);
		this.readline.prompt()
	}

	help() {
		console.log(" _____________________________________________ ");
		console.log("|                                             |")
		console.log("|             Default command :               |");
		console.log("|_____________________________________________|");
		console.log("|                                             |");
		console.log("|           .start  .restart .stop            |");
		console.log("|           .status .reload  .shutdown        |");
		console.log("|_____________________________________________|");
	}
}