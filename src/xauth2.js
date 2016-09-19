const nodemailer    = require('nodemailer');

module.exports = class Xauth {
    constructor(taskmaster) {
        const generator     = require('xoauth2').createXOAuth2Generator({
            user: 'Doudou',
            clientId: '{Client ID}',
            clientSecret: '{Client Secret}',
            refreshToken: '{refresh-token}',
            accessToken: '{cached access token}' // optional
        });

        // listen for token updates
        // you probably want to store these to a db
        generator.on('token', function(token){
            console.log('New token for %s: %s', token.user, token.accessToken);
        });

        // login
        var transporter = nodemailer.createTransport(({
            service: 'gmail',
            auth: {
                xoauth2: generator
            }
        }));

        // send mail
        transporter.sendMail({
            from: 'edouard.ebersoldt@gmail.com',
            to: 'edouard.ebersoldt@gmail.com',
            subject: 'hello world!',
            text: 'Authenticated with OAuth2'
        }, function(error, response) {
           if (error) {
                console.log(error);
           } else {
                console.log('Message sent');
           }
        });
    }
}