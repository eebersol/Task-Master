
const spawn               = require('child_process').spawn;
const fs                  = require('fs');

module.exports            = class Process {
  constructor(process_config, process_name, taskmaster, old_path) {

    this.taskmaster       = taskmaster;
    this.name             = process_name;
    this.args             = process_config.cmd.split(' ');
    this.cmd_bis          = this.args[0];
    this.old_path         = old_path;
    this.state            = 'stopped';
    this.uptime           = 0;
    this.retries          = 0;
   
    this.args.splice(0, 1);
    this.reload_config(process_config);
  }

  reload_config(process_config) {
    this.cmd              = process_config.cmd;
    this.numprocs         = process_config.numprocs || 1;
    this.umask            = process_config.umask || '022';
    this.workingdir       = process_config.workingdir || '/tmp';
    this.autostart        = process_config.autostart || true;
    this.autorestart      = process_config.autorestart || 'unexpected';
    this.exitcodes        = process_config.exitcodes || [0];
    this.startretries     = process_config.startretries || 3;
    this.starttime        = process_config.starttime || 5;
    this.stopsignal       = process_config.stopsignal || 'Kill';
    this.stoptime         = process_config.stoptime || 10;
    this.stdout           = process_config.stdout;
    this.stderr           = process_config.stderr;
    this.env              = process_config.env || {};
    this.spawn_process();
  }

  spawn_process(options) {

    if (this.state == 'starting' || this.state == 'started')
      return;
    
    this.state            = 'starting';
    let args              = this.cmd.split(' ');
    let process_cmd       = args[0];
    args.splice(0, 1);


    if (!fs.existsSync(process_cmd))
      this.taskmaster.logger.error(`Cannot launch process ${this.name}`);

    this.timer();
    this._process         = spawn(process_cmd, args, {env : this.env});
    this.set_std();

    process.umask(this.umask);
    process.chdir(this.workingdir);

    this._process.stdout.on('data', this._on_stdout.bind(this));
    this._process.stdout.on('data', this._on_stderr.bind(this));
    this.pid               = this._process.pid;
    setTimeout(() => {
      if (this.is_running()) {
        this.state         = 'started';
        this._process.on('close', this._on_close.bind(this));
        this.taskmaster.logger.info(`\x1b[32m${this.name} has sucessfully started.\x1b[0m`);
      } 
      else
        this._on_close(this._process.exitCode);
    }, 1000 * this.startime);
  }

  set_std() {
    try {
      let flag = {flags : 'a'};
      if (this.stdout) {
        fs.appendFileSync(this.stdout, ' ', flag)
        this.stdout_stream  = fs.createWriteStream(this.stdout, { flags : 'a' });
      }
      if (this.stderr) {
        fs.appendFileSync(this.stderr, ' ', flag)
        this.stderr_stream  = fs.createWriteStream(this.stderr, { flags : 'a' });
      }
      return true;
    }
    catch(e) {
      this.stdout           = this.old_path.concat(this.stdout);
      this.stderr           = this.old_path.concat(this.stderr);
      if (this.set_std() == true)
        return ;
      else
        this.taskmaster.logger.error(`\x1b[31mError : ${e}\x1b[0m`);
    }
  }

  _on_stdout(data) {
    if (this.stdout_stream) {
      this.stdout_stream.write(data);
    }
  }

  _on_stderr(data) {
    if (this.stderr_stream) {
      this.stderr_stream.write(data);
    }
  }

  _on_close(code) {
    this.pid                = null;
    this.state              = 'stopped';
    if (this.stdout_stream)
      this.stdout_stream.end();
    if (this.stdin_stream)
      this.stdin_stream.end();
    this.stdout_stream      = null;
    this.stdin_stream       = null;
    if (this.exitcodes.indexOf(code) > -1 && this.startretries != 'always') {
      this.taskmaster.logger.info(`\x1b[32mProcess ${this.name} has normally stopped with code ${code}.\x1b[0m`);
      return;
    }
    this.taskmaster.logger.warn(`\x1b[31mProcess ${this.name} has crashed with code ${code}\x1b[0m`);
    if (this.retries < this.startretries && !this.startretries != 'never') {
      this.restart();
      this.retries++;
    }
  }

  is_running() {
    try {
      return process.kill(this.pid,0);
    }
    catch(e) {
      this.taskmaster.logger.error(`\x1b[31mError : ${e}\x1b[0m`);
    }
  }

  stop(force_stop = false) {
   if (force_stop == true)
      this.startretries = 0;
    this.uptime = 0;
    try {
        this._process.kill('SIG' +this.stopsignal);
        this._process.pid = null;
    } catch (e) {}
    setTimeout(() => {
       this.taskmaster.logger.info(`\x1b[32m${this.name} : stopped\x1b[0m`); 
    }, 1000 * this.stoptime);
  }

  restart() {
    this.stop()
    new Process (this.object, this.name, this.taskmaster);
    this.taskmaster.logger.info(`\n\x1b[32m${this.name} : started\x1b[0m`);
  }

  status(process_name, index) {

    if (this._process.pid != null && this.state == 'started')
      console.log(`[${process_name}][${index}] RUNNING with [${this._process.pid}] and uptime ${this.uptime}s`);
    else
      console.log(`[${process_name}][${index}] STOPPED`);
    console.log('');
  }

  timer() {
    setInterval(() => {
      if (this._process.pid) {
        this.uptime++;
        if (this.uptime == this.starttime && this._process.pid == null)
           this.taskmaster.logger.error(`\nprocess : [ ${this.name} ] fail`);
      }
    }, 1000)
  }
}
