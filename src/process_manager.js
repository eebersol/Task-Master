const child_process   = require("child_process");
const Process         = require("./process");
const fs              = require("fs");


module.exports = class ProcessManager {
  constructor(taskmaster) {

    this.processes  = {};
    this.old_path   = process.cwd();
    this.config_file = taskmaster.config.options;
    this.first_time = 0;
  //  this.processes  = [];

    for (let process_name in this.config_file) {
      this.start_one(process_name, this.config_file[process_name]);
    }
    this.first_time = 1;

  }

  start_one(process_name) {

    this.processes[process_name] = [];
    let indexes = 0;

    if (!this.process_exists(process_name)) { 
      console.log(`\x1b[31m Error : invalid process name.\x1b[0m`);
    } 
    if (this.first_time != 0 || (this.first_time == 0 && this.config_file[process_name].autostart == true)) {
      while (indexes < this.config_file[process_name].numprocs) {
          let _process = new Process(this.config_file[process_name], process_name);
          this.processes[process_name].push(_process);
          indexes++;
       }
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
         this.stop_one(process_name, this.processes);
       }
       return;
    }

     while(i_stop < cmd.length) {
      this.stop_one(cmd[i_stop], this.processes);
       i_stop++;
     }
  }

  stop_one(process_name, array_process) {
    array_process[process_name].forEach(_process => {
      _process.stop();
    });
  }

  status_general(opts) {
    opts.splice(0, 1);
    console.log("");
    if (!opts[0]) {
      for (let process_name in this.config_file) { 
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

  restart(cmd) {
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
      this.start_one(cmd[i_restart]);
      i_restart++;
    }
  }

  reload(cmd) {
    let old_config = Object.assign({}, this.config_file);
    let updated_properies = [];

    //Reload config file;
    this.taskmaster.config.load_config(this.old_path);

    for (let _p in this.config_file[cmd]) {
      let old_property = old_config[cmd][_p];
      let new_property = this.config_file[cmd][_p];

      if ((old_property != new_property) && _p == "cmd") {
        this.__reload_cmd(cmd);
      }
      if ((old_property != new_property) && _p == "numprocs") {
        this.__reload_numprocs(cmd);
      }

    }
  }

  __reload_cmd(cmd) {
    this.taskmaster.process_manager.stop_one(cmd);
    this.taskmaster.process_manager.start_one(cmd, this.taskmaster.config[cmd]);
  }

  __reload_numprocs(cmd) {
    let numprocs = this.taskmaster.config.options[cmd]["numprocs"];

    if (numprocs > this.processes[cmd].length) {
      let new_proc = numprocs - this.processes[cmd].length;
      console.log("new_proc " +new_proc);
      console.log("numprocs " +numprocs);
      for(let index = 0; index < new_proc; index++) {
        let _process = new Process(this.config_file[cmd], cmd);
        this.processes[cmd].push(_process);
      }
    }
    else {
      let new_proc = this.processes[cmd].length - numprocs;
      for(let index = 0; index < new_proc; index++) {
        let _process = this.processes[cmd][this.processes[cmd].length - 1];
        _process.stop(true);
        this.processes[cmd].pop();
      }
    }
  }

  process_exists(cmd) {
    return this.processes[cmd];
  }

  _exit() {
    console.log("Stopping, please wait");
    for (var process_name in this.processes) {
      let program_ = this.processes[process_name];
      program_.forEach(process_ => {
        process_.stop(true);
      });
    }
    setTimeout(() => {
      process.exit();
    }, 5000);
  }
}