const nodemailer = require('nodemailer');


module.exports = class Mailer {
	constructor(taskmaster, old, news) {
		this.taskmaster 	= taskmaster;
		this.transporter 	= nodemailer.createTransport({
		  service: 'Hotmail',
		  auth: {
		    user: '',
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
				return console.log(`mail don't send ${error}`);
			console.log('Message sent: ' + info.response);
		});
	}
}
