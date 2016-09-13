
const spawn   = require("child_process").spawn;
const fs              = require("fs");

module.exports = class Process {
  constructor(object, process_name) {
    
    this.name         = process_name;
    this.object       = object;
    this.args         = object.cmd.split(' ');
    this.cmd          = this.args[0];
    this.args.splice(0, 1);
    this.state        = 'stopped'
    this.uptime       = 0;
    this.retries      = 0;

    this.reload_config(object);
    this.spawn_process();
  }

  reload_config(process_config) {
    this.cmd          = process_config.cmd;
    this.numprocs     = process_config.numprocs || 1;
    this.umask        = process_config.umask || '022';
    this.workingdir   = process_config.workingdir || '/tmp';
    this.autostart    = process_config.autostart || true;
    this.autorestart  = process_config.autorestart || 'unexpected';
    this.exitcodes    = process_config.exitcodes || [0];
    this.startretries = process_config.startretries || 3;
    this.starttime    = process_config.starttime || 5;
    this.stopsignal   = process_config.stopsignal || 'Kill';
    this.stoptime     = process_config.stoptime || 10;
    this.stdout       = process_config.stdout;
    this.stderr       = process_config.stderr;
    this.env          = process_config.env || {};

    console.log("ok")
  }

  spawn_process(options) {

    if (this.state == 'starting' || tjis.state == 'started')
      return;
    this.state = 'starting';

    if (!fs.existSync(this.cmd))
      console.log(`Cannot launch process ${this.name}`);

    //process.umask(this.object.umask);
    //process.chdir(this.workingdir);
    
    this.set_env();
    this.timer();

    this._process = spawn(this.cmd, this.args, {env : this.object.env});
    if (this._process.connected) {
      console.log('Yes umask setting');
      this._process._handle.umask([parseInt(this.umask)])
    }

    this.set_std();

    this._process.stdout.on('data', this._on_stdout.bind(this));
    this._process.stdout.on('data', this._on_stderr.bind(this));
    this.pid = this._process.pid;
    setTimeout(() => {
      if (this.is_running()) {
        this.state = 'started';
        this._process.on('close', this._on_close.bind(this));
        console.log(`${this.name} has sucessfully started ...`);
      } 
      else
        this._on_close(this._process.exitCode);
    }, 1000 * this.startime);
  }

  set_std() {
    try {
      let flag = {flags : 'a'};
      if (this.stdout) {
        fs.appendfileSync(this.stdout, ' ', flag)
        this.stdout_stream = fs.createWriteStream(this.object.stdout, { flags : 'a' });
      }
      if (this.stderr) {
        fs.appendfileSync(this.stderr, ' ', flag)
        this.stderr_stream = fs.createWriteStream(this.object.stderr, { flags : 'a' });
      }
    }
    catch(e) {
      console.log(`Error std : ${e}`);
    }
  }

  _on_stdout(data) {
    if (this.stdout_stream) {
      this.stdout_stream.write(data);
    }
  }

  _on_stderr() {
    if (this.stderr_stream) {
      this.stderr_stream.write(data);
    }
  }

  _on_close() {
    this.pid            = null;
    this.state          = 'stopped';
    if (this.stdout_stream)
      this.stdout_stream.end();
    if (this.stdin_stream)
      this.stdin_stream.end();
    this.stdout_stream  = null;
    this.stdin_stream   = null;
    if (this.exitcodes.indexOf(code) > -1 && this.startretries != 'always') {
      console.log(`Process ${this.name} has normally stopped with code ${code}...`);
      return;
    }
    console.log(`Process ${this.name} has crashed with code ${code}...`);
    if (this.retries < this.startretries && !this.startretries != 'never') {
      this.restart();
      this.retries++;
    }
  }

  is_running() {
    try {
      return process.kill(this.pid,0);
    }
  }

  stop(force_stop = false) {
   if (force_stop == true)
      this.startretries = 0;
    this.uptime = 0;
    try {
        this._process.kill("SIG" +this.stopsignal);
        this._process.pid = null;
    } catch (e) { }

    this._process.stdout.end();
    this._process.stderr.end();
    setTimeout(() => {
       console.log(`\n\x1b[32m${this.name} : stopped\x1b[0m`); 
    }, 1000 * this.stoptime);
  }

  restart() {
    this.stop()
    new Process (this.object, this.name);
    console.log(`\n\x1b[32m${this.name} : started\x1b[0m`);
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
           console.log(`\nprocess : [ ${this.name} ] fail`);
      }
    }, 1000)
  }

  set_env() {
      for(let env_key in this.env) {
       process.env[env_key] = this.env[env_key];
    }
  }
}
