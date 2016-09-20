const nodemailer = require('nodemailer');


module.exports = class Mailer {
	constructor(taskmaster, old, news) {
		this.taskmaster 	= taskmaster;
		this.transporter 	= nodemailer.createTransport({
		  service: 'Hotmail',
		  auth: {
		    user: 'edouard.ebersoldt@hotmail.fr',
		    pass: ''
		  }
		});
		this.mailOptions = {
			from: '<edouard.ebersoldt@hotmail.fr>',
			to: 'edouard.ebersoldt@gmail.com',
			subject: 'Taskmaster',
			text: 'goulouloulou',
			html: `Program ${old} has been modified to ${news}, need to restart`,
		}
		this.transporter.sendMail(this.mailOptions, function(error, info){
			if (error) 
				return this.taskmaster.logger.error(`mail don't send ${error}`);
			this.taskmaster.logger.info('Message sent: ' + info.response);
		}.bind(this));
	}
}
