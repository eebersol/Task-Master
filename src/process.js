
const child_process = require("child_process");
const fs      = require("fs");

module.exports = class Process {
  constructor(options, process_name, paths) {
    
    let contents = fs.readFileSync(paths + "/config/config.json", 'utf8');
    this.options = JSON.parse(contents);

    this.args = options.cmd.split(" ");
    
    this.process_name = process_name;

    this.cmd = this.args[0];

    this.uptime = 0;

    this.args.splice(0, 1);

    this.spawn_process();
  }

  spawn_process() {

    let workdir   = this.options[this.process_name].workingdir;
    let umask_value = this.options[this.process_name].umask;
    let log_file  = fs.createWriteStream(this.options[this.process_name].stdout, { flags : 'a' });
    let log_err   = fs.createWriteStream(this.options[this.process_name].stderr, { flags : 'a' });

    let exit_code   = this.options[this.process_name].exitcodes;

    process.umask(umask_value);
    process.chdir(workdir);

    for(let env_key in this.options[this.process_name].env) {
      process.env[env_key] = this.options[this.process_name].env[env_key];
    }

    this.timer();

    this._process = child_process.spawn(this.cmd, this.args);

    this._process.stdout.pipe(log_file);
    this._process.stderr.pipe(log_err);
  
    this._process.on("close", (code) => {
      if (exit_code.indexOf(code) != -1) {
        return;
      } else {
        console.log("Error : crash restart process");
        this.restart();
      }
    });
  }

  stop() {

    this.uptime = 0;
    this._process.kill("SIGINT");
    this._process.pid = null;
  }

  restart() {
    this.stop();
    this.spawn_process();
  }

  status(index) {

    if (this._process.pid != null) {
      console.log(`[${this.process_name}][${index}] RUNNING with [${this._process.pid}] and uptime ${this.uptime}`);
    } else {
      console.log(`[${this.process_name}][${index}] STOPPED`);
    }
    console.log("");
  }

  timer() {
    setInterval(() => {
      if (this._process.pid) {
        this.uptime++;
      }
    }, 1000)
  }
}

