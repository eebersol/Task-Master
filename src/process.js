
const spawn               = require('child_process').spawn;
const fs                  = require('fs');
const json 				  = require('../config/config.json');

module.exports            = class Process {
  constructor(process_config, process_name, taskmaster, old_path, retries) {

    this.taskmaster       = taskmaster;
    this.name             = process_name;
    this.args             = process_config.cmd.split(' ');
    this.cmd_bis          = this.args[0];
    this.old_path         = old_path;
    this.state            = 'stopped'
    this.uptime           = 0;
    if (retries)
    	this.retries      = retries;
    else
    	this.retries      = 0;
    this.args.splice(0, 1);
    this.reload_config(process_config);
  }

  reload_config(process_config) {
    this.cmd              = process_config.cmd;
    this.numprocs         = process_config.numprocs;
    this.umask            = process_config.umask;
    this.workingdir       = process_config.workingdir;
    this.autostart        = process_config.autostart;
    this.autorestart      = process_config.autorestart;
    this.exitcodes        = process_config.exitcodes;
    this.startretries     = process_config.startretries;
    this.starttime        = process_config.starttime;
    this.stopsignal       = process_config.stopsignal;
    this.stoptime         = process_config.stoptime;
    this.stdout           = process_config.stdout;
    this.stderr           = process_config.stderr;
    this.env              = process_config.env;
    this.type 			  = process_config.type;
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

    try {
      process.umask(this.umask);
      process.chdir(this.workingdir);
    } catch(e) {
      this.taskmaster.logger.error(`\x1b[31m${e}\x1b[0m`);
      return ;
    }

    this._process.stdout.on('data', this._on_stdout.bind(this));
    this._process.stderr.on('data', this._on_stderr.bind(this));

    this.pid               = this._process.pid;
    setTimeout(() => {
      if (this.is_running()) {
        this.state         = 'started';
        this._process.on('close', this._on_close.bind(this));
        this.taskmaster.logger.info(`\x1b[32m${this.name} has sucessfully started.\x1b[0m`);
      } 
      else {
        this._on_close(this._process.exitCode);
    	}
    }, 1000 * this.starttime);
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
    // this.pid                = null;
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
    this.taskmaster.logger.warn(`\x1b[31mProcess ${this.name} has crashed with code unexpected.\x1b[0m`);    console.log(`${this.retries} < ${this.startretries}`)
    if (this.retries < this.startretries && this.startretries != 'never') {
  		this.retries++;
  		this.state = 'started';
      	this.restart();
    }
    else 
    	this.pid  = null;
  }

  is_running() {
    try {
    	if (this.type == "loop")
      		return process.kill(this.pid,0);
    }
    catch(e) {
      this.taskmaster.logger.error(`\x1b[31mError : ${e}\x1b[0m`);
    }
  }

  stop(force_stop = false) {
   if (force_stop == true)''
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
    let restart = new Process (
      this.taskmaster.config.options[this.name],
      this.name,
      this.taskmaster,
      this.old_path,
      this.retries);
    this.taskmaster.process_manager.processes[this.name].push(restart);
    this.taskmaster.logger.info(`\x1b[32mRestaring : ${this.name} + ${this.pid} + ${this._process.pid}\x1b[0m`);
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
