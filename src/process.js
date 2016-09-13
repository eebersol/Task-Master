
const spawn   = require("child_process").spawn;
const fs              = require("fs");

module.exports = class Process {
  constructor(object, process_name) {
    
    this.process_name = process_name;
    this.object       = object;
    this.args         = object.cmd.split(" ");
    this.cmd          = this.args[0];
    this.args.splice(0, 1);
    this.uptime       = 0;
    this.retries      = 0;

    this.spawn_process();
  }

  spawn_process(options) {

    if (this.object.stdout)
      this.stdout = fs.createWriteStream(this.object.stdout, { flags : 'a' });
    if (this.object.stderr)
      this.stderr = fs.createWriteStream(this.object.stderr, { flags : 'a' });
    let exit_codes = this.object.exitcodes;
    //process.umask(this.object.umask);
    process.chdir(this.object.workingdir);
    
    this.set_env()
    this.timer();

    this._process = spawn(this.cmd, this.args, {env : this.object.env});
    console.log(this._process.connected)
    this._process.stdout.pipe(this.stdout);
    this._process.stderr.pipe(this.stderr);
    this._process.on("close", (code) => {
      if (exit_codes.indexOf(code) != -1) {
        return;
      } else if (this.object.autorestart == "unexpected" 
         || this.object.autorestart == "always" 
            && this.retries < this.object.startretries) {
        console.log("Error : crash restart process");
        this.retries++;
        this.restart();
      }
    });

    if (this._process.pid != undefined && this.uptime == 5)
        console.log(` ${this.process_name} : started`);
  return ;
  }

  stop(force_stop = false) {
   if (force_stop == true)
      this.object.startretries = 0;
    this.uptime = 0;
    try {
        this._process.kill("SIG" +this.object.stopsignal);
        this._process.pid = null;
    } catch (e) { }

    this._process.stdout.end();
    this._process.stderr.end();
    setTimeout(() => {
       console.log(`\n\x1b[32m${this.process_name} : stopped\x1b[0m`); 
    }, 1000 * this.object.stoptime);
  }

  restart() {
    this.stop()
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
