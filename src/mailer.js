const nodemailer = require('nodemailer');


module.exports = class Mailer {
	constructor(taskmaster) {
		this.taskmaster = taskmaster;
		this.transporter =nodemailer.createTransport({
		  service: 'Hotmail',
		  auth: {
		    user: '',
		    pass: ''
		  }
		});
		console.log(this.taskmaster.process_manager.old_path)
		this.mailOptions = {
			from: '<edouard.ebersoldt@hotmail.fr>',
			to: 'edouard.ebersoldt@gmail.com',
			subject: 'Taskmaster',
			text: 'Coucou p',
			html:'<b>Hello world ?</b>',
		}
		this.transporter.sendMail(this.mailOptions, function(error, info){
			if (error) 
				return console.log(`mail don't send ${error}`);
			this.taskmaster.logger.info('Message sent: ' + info.response);
		});
	}
}
