const express = require('express');

class Api {

  constructor(taskmaster) {
    this.taskmaster = taskmaster;
    this.api = express();
    this.api.use(express.static(this.taskmaster.process_manager.old_path +'/static'));
    this.api.listen(8080, () => {
      this.taskmaster.logger.info('Api ready');
    });

    this.api.get('/programs', this.get_programs.bind(this));
    this.api.get('/start/:name', this.start.bind(this));
    this.api.get('/restart/:name', this.restart.bind(this));
    this.api.get('/stop/:name', this.stop.bind(this));
    this.api.get('/shutdown', this.shutdown.bind(this));
  }

  get_programs(req, res) {
    let result = [];
    for (var process_name in this.taskmaster.process_manager.processes) {
       var id_hack = 0;
      let program = {};
      let uper_name = this.capitalizeFirstLetter(process_name)
      program.name = uper_name;
      program.processes = [];
     let program_ = this.taskmaster.process_manager.processes[process_name];
      program_.forEach(process_ => {
        program.processes.push({
          id : id_hack,
          state : process_.state
        });
        id_hack++;
      });
      result.push(program);
    }
    res.send(result);
  }

  start(req, res) {
    req.params.name = this.uncapitalizeFirstLetter(req.params.name);
    if (this.taskmaster.process_manager.processes[req.params.name][0].state == 'started')
      this.taskmaster.logger.info(`${req.params.name} are already started`);
    else if (this.taskmaster.config.options[req.params.name])
      this.taskmaster.process_manager.start_one(req.params.name);
    res.send('ok');
  }

  restart(req, res) {
    let array = [];
    array.push('restart')
    req.params.name = this.uncapitalizeFirstLetter(req.params.name);
    if (this.taskmaster.config.options[req.params.name]) {
        array.push(req.params.name);
        this.taskmaster.process_manager.restart(array);
   }
    res.send('ok');
  }

  stop(req, res) {
    req.params.name = this.uncapitalizeFirstLetter(req.params.name);
    if (this.taskmaster.config.options[req.params.name]) {
      this.taskmaster.process_manager.stop_one(req.params.name);
    }
    res.send('ok');  
  }
  
  shutdown(req, res) {
    for (var process_name in this.taskmaster.process_manager.processes) {
      let program_ = this.taskmaster.process_manager.processes[process_name];
      program_.forEach(process_ => {
        process_.stop(true);
      });
    }
    setTimeout(() => {
      process.exit();
    }, 5000);
    res.send('ok');
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  uncapitalizeFirstLetter(string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
  } 
}

module.exports = Api;