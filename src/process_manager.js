const child_process = require("child_process");
const Process       = require("./process");


module.exports = class ProcessManager {
  constructor(taskmaster) {

    this.processes  = {};
    this.taskmaster = taskmaster;
    this.old_path   = process.cwd();

    let index_array = 0;

    for (let process_name in taskmaster.config.options) {
      this.start_one(process_name);
      index_array++;
    }

  }

  start_one(cmd) {
    this.processes[cmd] = [];

    let index = 0;

    if (!this.process_exists(cmd)) {
      console.log("Error : invalid process name.");
      return;
    }

    while (index < this.taskmaster.config.options[cmd].numprocs) {
      //Autostart process if needed
      if (this.taskmaster.config.options[cmd].autostart == true) {
        let _process = new Process(
          this.taskmaster.config.options[cmd],
          cmd,
          this.old_path
        ); 
        this.processes[cmd].push(_process);
      }
      index++;
    }
  }

  stop_general(cmd) {
    let ii = 0;
    cmd.splice(0, 1);

    if (!cmd) {
      console.log("Error : stop requires a process name");
      console.log("stop <name>            Stop a process");
      console.log("stop <name> <name>     Stop multiple process");
      console.log("stop                   Stop all process");
      return;
    }
 /*   
    if (!this.process_exists(cmd)) {
      console.log("Error : invalid process name.");
      return;
    }
*/
    if (!cmd[0]) {
      for (let process_name in this.processes) {
        this.stop_one(process_name);
      }
      return;
    }

    while(ii < cmd.length) {
      this.stop_one(cmd[ii]);
      ii++;
    }
  }

  restart(cmd) {
    let iii = 0;
    if (!cmd) {
      console.log("Error : restart recquire process name.")
      return;
    }  
/* 
    if (!this.process_exists(cmd)) {
      console.log("Error : invalid process name.");
      return;
    } 
*/ 
    this.stop_general(cmd);
    while (iii < cmd.length) {
      this.start_one(cmd[iii]);
      iii++;
    }
  }

  status(opts) {
    let i = 0;
    opts.splice(0, 1);

    console.log("");

    //No command, show all statut
    if (!opts[0]) {
      for (let process_name in this.processes) {
        this.status_one(process_name);
      }
      return;
    }

    while(i < opts.length) {
      this.status_one(opts[i]);
      i++;
    }
  }

  status_one(process_name) {
    let index = 0;
    this.processes[process_name].forEach(_process => {
      _process.status(index);
      index++;
    });
  }

  stop_one(process_name) {
    this.processes[process_name].forEach(_process => {
      _process.stop();
    });
  }

  process_exists(cmd) {
    return this.processes[cmd];
  }
}