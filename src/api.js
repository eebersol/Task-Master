const express = require('express');

class Api {

  constructor(taskmaster) {
    this.taskmaster = taskmaster;
    this.api = express();
    this.api.use(express.static(this.taskmaster.process_manager.old_path +'/static'));
    this.api.listen(8080, () => {
      this.taskmaster.logger.info("Api ready");
    });

    this.api.get('/programs', this.get_programs.bind(this));
    this.api.get('/start/:name', this.start.bind(this));
    this.api.get('/restart/:name', this.restart.bind(this));
    this.api.get('/stop/:name', (req, res) => {
      this.stop(req, res)
    });

  }

  get_programs(req, res) {
    let result = [];
    for (var process_name in this.taskmaster.process_manager.processes) {
       var id_hack = 0;
      let program = {};
      program.name = process_name;
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
    if (this.taskmaster.config.options[req.params.name])
      this.taskmaster.process_manager.start_one(req.params.name);
    res.send("ok");
  }

  restart(req, res) {
    let array = [];
    array.push('restart')
    if (this.taskmaster.config.options[req.params.name]) {
        array.push(req.params.name);
        this.taskmaster.process_manager.restart(array);
   }
    res.send("ok");
  }

  stop(req, res) {
    if (this.taskmaster.config.options[req.params.name])
      this.taskmaster.process_manager.stop_one(req.params.name);
    res.send("ok");  
  }
}

module.exports = Api;