const child_process = require("child_process");
const StartRetries  = require("./object/start_retries");
const Process       = require("./process");
const fs              = require("fs");



module.exports = class ProcessManager {
  constructor(taskmaster) {

    this.processes  = {};
    this.taskmaster = taskmaster;
    this.old_path   = process.cwd();

    for (let process_name in taskmaster.config.options) {
      this.startretries = new StartRetries(
        process_name, 
        taskmaster.config.options[process_name].startretries);
      this.start_one(process_name);
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
      if (this.taskmaster.config.options[cmd].autostart == true && this.startretries.nb > 0) {
        let _process = new Process(
          this.taskmaster.config.options[cmd],
          cmd,
          this.old_path
        ); 
        this.processes[cmd].push(_process);
      }
      index++;
    }
    this.startretries.nb--;
    console.log(`${cmd} : started`);

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

    while (ii < (cmd.length - 1)) {
      if (!this.process_exists(cmd[ii])) {
         console.log(`Error  ${cmd[ii]}: invalid process name.`);
        return;
      }
      ii++;
    } 
    ii = 0;

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
    let iii = 1;
    if (!cmd) {
      console.log("Error : restart recquire process name.")
      return;
    }  
 
    while (iii < (cmd.length - 1)) {
      if (!this.process_exists(cmd[iii])) {
        console.log(`Error  ${cmd[iii]}: invalid process name.`);
        return;
      }
      iii++;
    } 
    iii = 0;
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
    console.log(`${process_name} : stopped`);
  }

  process_exists(cmd) {
    return this.processes[cmd];
  }
}