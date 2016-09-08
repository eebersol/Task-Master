const child_process   = require("child_process");
const StartRetries    = require("./object/start_retries");
const Process         = require("./process");
const fs              = require("fs");
const GetProperty     = require("./object/get_property");



module.exports = class ProcessManager {
  constructor(taskmaster) {

    this.processes  = {};
    this.taskmaster = taskmaster;
    this.old_path   = process.cwd();
    this.config     = this.taskmaster.config;
    this.array      = [];
    this.first_time = 0;
    this.processes  = [];
    let i           = 0;

    for (let process_name in taskmaster.config.options) {
      this.array[i] = new GetProperty(process_name, this.old_path, 1, this.config.options);
      this.start_one(process_name, 1, this.array[i]);
      i++;
    }
    this.first_time = 1;

  }

  start_one(process_name, index, object) {

    this.processes[process_name] = [];
    let indexes = 0;

    if (!this.process_exists(process_name)) { 
      console.log(`\x1b[31m Error : invalid process name.\x1b[0m`); // BUGBUGBUGBUGBUG
    } 
    if (index == 0)
      object = new GetProperty(process_name, this.old_path, 0, this.config.options);
    else
      object = new GetProperty(process_name, this.old_path, 1, this.config.options);
    if (this.first_time != 0 || (this.first_time == 0 && object.autostart == true)) {
      while (indexes < object.numprocs) {
          let _process = new Process(object, process_name);
          this.processes[process_name].push(_process);
          indexes++;
       }
     console.log(`\n\x1b[32m${process_name} : started\x1b[0m`);
     }
  }

  stop_general(cmd) {
    let i_stop = 0;
    cmd.splice(0, 1);

    if (cmd[0] == undefined) {
      console.log(`\x1b[31m Error : stop/restart requires a process name`);
      console.log(`stop <name>            Stop a process`);
      console.log(`stop <name> <name>     Stop multiple process`);
      console.log(`stop                   Stop all process \x1b[0m`);
      return;
    }

    while (i_stop < (cmd.length)) {
      if (!this.process_exists(cmd[i_stop])) {
         console.log(`\x1b[31mError  ${cmd[i_stop]}: invalid process name.\x1b[0m`);
        return;
      }
      i_stop++;
    } 
    i_stop = 0;

    if (cmd[0] == "all") {
      for (let process_name in this.processes) {
         this.stop_one(process_name);
       }
       return;
    }

     while(i_stop < cmd.length) {
      this.stop_one(cmd[i_stop]);
       i_stop++;
     }
  }

  stop_one(process_name) {
    this.processes[process_name].forEach(_process => {
      _process.stop();
    });
    console.log(`\x1b[32m${process_name} : stopped\x1b[0m`); 
  }

  status_general(opts) {
    opts.splice(0, 1);
    console.log("");
    if (!opts[0]) {
      for (let process_name in this.taskmaster.config.options) { 
        this.status_one(process_name);
      }
      return;
    }
    let i_status = 0;
    while(i_status < opts.length) {
      this.status_one(opts[i_status]);
      i_status++;
    }
  }

  status_one(process_name) {
    let index = 0;

    this.processes[process_name].forEach(_process => {
      _process.status(process_name, index);
      index++;
    }); 
 }

  restart(cmd, index) {
    console.log(`index ${index}`)
    let i_restart = 1;
    if (!cmd) {
      console.log(`\x1b[31m Error : restart recquire process name.\x1b[0m`)
      return;
    } 
    while (i_restart < (cmd.length - 1)) {
      if (!this.process_exists(cmd[i_restart])) {
        console.log(`\x1b[31m Error  ${cmd[i_restart]}: invalid process name.\x1b[0m`);
        return;
      }
      i_restart++;
    } 
    i_restart = 0;
    this.stop_general(cmd);

    while (i_restart < cmd.length) {
      this.start_one(cmd[i_restart], index);
      i_restart++;
    }
  }

  process_exists(cmd) {
    return this.processes[cmd];
  }
}