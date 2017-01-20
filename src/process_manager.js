const child_process   = require('child_process');
const Process         = require('./process');
const fs              = require('fs');
const Mailer          = require('./mailer.js');

module.exports = class ProcessManager {
  constructor(taskmaster) {

    this.taskmaster   = taskmaster;
    this.processes    = {};
    this.config_file  = taskmaster.config.options;
    this.first_time   = 0;
    this.old_path     = process.cwd();

    for (let process_name in this.taskmaster.config.options)
      this.start_one(process_name, this.taskmaster.config.options[process_name]);
    
    this.first_time   = 1;
    this._fs_watch();
  }

  _fs_watch() {
    fs.watch(this.old_path + '/config/config.json', {encoding: 'buffer'}, (eventType, filename) => {
       if (filename) {
        this._reload_all();       
      }
    });
  }

  _reload_all() {
      let contents  = fs.readFileSync(this.old_path + "/config/config.json", 'utf8');
      contents      = JSON.parse(contents);

    for (let process_name in contents) {
      this.reload(process_name)
    }
  }

  start_one(process_name) {

    this.processes[process_name] = [];
    let indexes                  = 0;

    if (!this.process_exists(process_name))
        console.log(`\x1b[31mError  ${process_name}: invalid process name.\x1b[0m`);
    else if (this.first_time != 0 || (this.first_time == 0 && this.taskmaster.config.options[process_name].autostart == true)) {
        for (let indexes = 0;indexes < this.taskmaster.config.options[process_name].numprocs; indexes++) {
            let _process = new Process(
              this.taskmaster.config.options[process_name],
              process_name,
              this.taskmaster,
              this.old_path,
              0
              );
            this.processes[process_name].push(_process);
        }
      }
  }

  stop_general(cmd) {
    let i_stop    = 0;
    cmd.splice(0, 1);

    if (cmd[0] == undefined) {
      this._help_stop();
      return;
    } else if (cmd[0] == 'all') {
        for (let process_name in this.processes) {
           this.stop_one(process_name, cmd);
        }
        return;
      }

    for (let i_stop = 0; i_stop < cmd.length; i_stop++) {
      if (!this.process_exists(cmd[i_stop]))
        console.log(`\x1b[31mError  ${cmd[i_stop]}: invalid process name.\x1b[0m`);
    } 
    i_stop = 0;

    for (i_stop; i_stop < cmd.length; i_stop++) {
      this.stop_one(cmd[i_stop], cmd);
     }
  }

  stop_one(cmd) {
    this.processes[cmd].forEach(_process => {
      _process.stop(true);
    });
  }

  status_general(opts) {
    opts.splice(0, 1);
    console.log('');
    if (!opts[0]) {
      for (let process_name in this.taskmaster.config.options) { 
        this.status_one(process_name);
      }
      return;
    }
    let i_status = 0;
    for (let i_status = 0; i_status < opts.lenght; i_status++) {
      this.status_one(opts[i_status]);
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
    for (let i_restart; i_restart < (cmd.length - 1); i_restart++) {
      if (!this.process_exists(cmd[i_restart])) {
        console.log(`\x1b[31m Error  ${cmd[i_restart]}: invalid process name.\x1b[0m`);
        return ;
      }
    } 
    this.stop_general(cmd);

    for (i_restart = 0; i_restart < cmd.length; i_restart++)
      this.start_one(cmd[i_restart]);
  }

  reload(cmd) {
    let old_config = Object.assign({}, this.config_file);
    let updated_properies = [];

    if (!this.process_exists(cmd) && cmd != undefined) {
        console.log(`\x1b[31mError  ${cmd}: invalid process name.\x1b[0m`);
        return;
      }
    this.taskmaster.config.load_config();

    this.taskmaster.logger.info(`\x1b[32mProgram : ${cmd} reloading\x1b[0m`);
    for (let _p in this.taskmaster.config.options[cmd]) {
      if (old_config[cmd] == undefined) {
        var old_property = this.taskmaster.config.options[cmd[_p]];
        this.start_this = cmd;
      } else 
        var old_property = old_config[cmd][_p];
      let new_property = this.taskmaster.config.options[cmd][_p];

      if ((old_property != new_property) && _p == 'cmd' && this.start_this == undefined) {
        new Mailer(this.taskmaster, old_property, new_property);
        this.__reload_cmd(cmd);
      }
      if ((old_property != new_property) && _p == 'numprocs' && this.start_this == undefined) {
        this.__reload_numprocs(cmd);
      }
    }
    if (this.start_this != undefined)
      this.taskmaster.process_manager.start_one(this.start_this, this.taskmaster.config[this.start_this]);
  }

  __reload_cmd(cmd) {
    this.taskmaster.process_manager.stop_one(cmd);
    this.taskmaster.process_manager.start_one(cmd, this.taskmaster.config[cmd]);
  }

  __reload_numprocs(cmd) {
    let numprocs = this.taskmaster.config.options[cmd]['numprocs'];

    if (numprocs > this.processes[cmd].length) {
      let new_proc = numprocs - this.processes[cmd].length;
      for(let index = 0; index < new_proc; index++) {
        let _process = new Process(
          this.taskmaster.config.options[cmd],
          cmd,
          this.taskmaster,
          this.old_path,
          0
          );
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
    return this.taskmaster.config.options[cmd];
  }

  _exit() {
    console.log('Stopping, please wait');
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

  _help_stop() {
      console.log(`\x1b[31m Error : stop/restart requires a process name.`);
      console.log(`stop <name>            Stop a process.`);
      console.log(`stop <name> <name>     Stop multiple process.`);
      console.log(`stop                   Stop all process.\x1b[0m`);    
  }
}