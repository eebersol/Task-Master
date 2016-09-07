
const child_process   = require("child_process");
const fs              = require("fs");

module.exports = class Process {
  constructor(options, process_name, paths) {
    
    let contents      = fs.readFileSync(paths + "/config/config.json", 'utf8');
    this.options      = JSON.parse(contents);

    this.args         = options.cmd.split(" ");
    
    this.process_name = process_name;

    this.cmd          = this.args[0];

    this.uptime       = 0;

    this.args.splice(0, 1);


    this.spawn_process();
  }

  spawn_process(options) {

    let workdir       = this.options[this.process_name].workingdir;
    let umask_value   = this.options[this.process_name].umask;
    let log_file      = fs.createWriteStream(
                             this.options[this.process_name].stdout, 
                              { flags : 'a' });
    let log_err       = fs.createWriteStream(
                              this.options[this.process_name].stderr, 
                              { flags : 'a' });
    let exit_code     = this.options[this.process_name].exitcodes;

    process.umask(umask_value);
    process.chdir(workdir);

    this.set_env()
    this.timer();

    this._process = child_process.spawn(this.cmd, this.args);

    this._process.stdout.pipe(log_file);
    this._process.stderr.pipe(log_err);
  
    this._process.on("close", (code) => {
      if (exit_code.indexOf(code) != -1) {
        return;
      } else if (this.options[this.process_name].autorestart == "unexpected" 
        || this.options[this.process_name].autorestart == "always") {
        console.log("Error : crash restart process");
        this.restart();
      }
    });

  //  this.get_cpu();

  }

  stop() {

    this.uptime = 0;
    this._process.kill("SIG" +this.options[this.process_name].stopsignal);
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
        if (this.uptime == this.options[this.process_name].starttime &&
          this._process.pid != null)
           console.log(`\nprocess : [ ${this.process_name} ] successful`);
      }
    }, 1000)
  }

  set_env() {
      for(let env_key in this.options[this.process_name].env) {
       process.env[env_key] = this.options[this.process_name].env[env_key];
    }
  }
/*
  get_cpu() {

    console.log(`pid = ${this._process.pid}`)
    let getUsage = (cb) => {
       let contents = fs.readFile("/proc" + this._process.pid + "stat");
            console.log(`Contents : ${contents}`);
            let elems = contents.toString().split(' ');
            let utime = elems[13];
            let stime = elems[14];

            cb(utime + stime);
    }

    setInterval(() => {
        getUsage((startTime) =>{
            setTimeout(() =>{
                getUsage((endTime) =>{
                    let delta = endTime - startTime;
                    let percentage = 100 * (delta / 10000);

                    if (percentage > 1){
                        console.log("CPU Usage Over 20%!");
                    }
                });
            }, 1000);
        });
    }, 10000);
  }
*/
}
