
const child_process   = require("child_process");
const fs              = require("fs");

module.exports = class Process {
  constructor(object, process_name) {
    
    this.process_name = process_name;
    this.object       = object;
    this.args         = object.cmd.split(" ");
    this.cmd          = this.args[0];
    this.args.splice(0, 1);
    this.uptime       = 0;

    this.spawn_process();
  }

  spawn_process(options) {

    let log_file      = fs.createWriteStream(
                             this.object.stdout, 
                              { flags : 'a' });
    let log_err       = fs.createWriteStream(
                              this.object.stderr, 
                              { flags : 'a' });
    let exit_code     = this.object.exitcodes;

    process.umask(this.object.umask);
    process.chdir(this.object.workingdir);
    
    this.set_env()
    this.timer();

    this._process = child_process.spawn(this.cmd, this.args);
    this._process.stdout.pipe(log_file);
    this._process.stderr.pipe(log_err);
    this._process.on("close", (code) => {
      if (exit_code.indexOf(code) != -1) {
        return;
      } else if (this.object.autorestart == "unexpected" 
        || this.object.autorestart == "always" && this.object.startretries > 0) {
        console.log("Error : crash restart process");
        this.object.startretries--;
        console.log(`startretries -> ${this.object.startretries}`)
        this.restart();
      }
    });

    if (this._process.pid != undefined && this.uptime == 5)
        console.log(` ${this.process_name} : started`);
  return ;
  }

  stop() {

    this.uptime = 0;
    this._process.kill("SIG" +this.object.stopsignal);
    this._process.pid = null;
  }

  restart() {
    this.stop();
    this.spawn_process();
    console.log(`\n\x1b[32m${this.process_name} : started\x1b[0m`);
  }

  status(process_name, index) {

    if (this._process.pid != null) {
      console.log(`[${process_name}][${index}] RUNNING with [${this._process.pid}] and uptime ${this.uptime}s`);
    } else {
      console.log(`[${process_name}][${index}] STOPPED`);
    }
    console.log("");
  }

  timer() {
    setInterval(() => {
      if (this._process.pid) {
        this.uptime++;
        if (this.uptime == this.object.starttime &&
          this._process.pid == null)
           console.log(`\nprocess : [ ${this.process_name} ] fail`);
      }
    }, 1000)
  }

  set_env() {
      for(let env_key in this.object.env) {
       process.env[env_key] = this.object.env[env_key];
    }
  }
}
