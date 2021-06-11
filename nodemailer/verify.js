var hbsmail = require('nodemailer-express-handlebars');
var path = require('path');
var mailer = require('nodemailer');

//var viewpath = require('./mail');
var fs = require('fs');

//console.log();

exports.verifymail = function(email, username, link){
	
	
	var transporter = mailer.createTransport({ 
		/*host: '', 
		port: 26, 
		secure: false, // true for 465, false for other ports*/
		service: 'gmail',
		auth: { 
			user: 'lawrencemiracle71@gmail.com', // generated ethereal 
			pass:  '08061179366' // generated ethereal password } }); 
		  }
   });
   var options = {
   		viewEngine : {
   			extname: '.hbs', // handlebars extension 
   			//layoutsDir: 'views/email/', // location of handlebars templates 
   			///defaultLayout: 'template', // name of main template 
   			partialsDir: '../views/partials/', // location of your subtemplates aka. header, footer etc 
   			
   			},
   			viewPath: '../views/mail',
   			extName: '.hbs'
   }
transporter.use('compile', hbsmail(options)); 

//the message properties
	var mailOptions = {
  		from: '',
  		to: email,
  		subject: 'Verify Your Email',
		template: 'verify',
  		context: {
  			email: email,
  			username: username,
  			link: link
  		}
	}
	
// send the mail
	transporter.sendMail(mailOptions, function(error, info) { 
		if (error) {
			return console.log(error); 
		} 
		console.log('Message sent: %s', info.messageId);
		//console.log(module.exports.email);
  	});
}


//welcome mail 
/*"function verifymail(email, mailer, hbsmail, fullname, username){
	
	var transporter = mailer.createTransport({ 
		host: '', 
		port: 26, 
		secure: false, // true for 465, false for other ports
		auth: { 
			user: '', // generated ethereal 
			pass:  '' // generated ethereal password } }); 
		  }
   });
transporter.use('compile', hbsmail({ viewPath: '.../views/mail/', extName: '.hbs' })); 

//the message properties
	var mailOptions = {
  		from: '',
  		to: email,
  		subject: 'Verify Your Email',
		template: 'welcome',
  		context: {
  			
  			username: username,
  			fullname: fullname
  		}
	}
	
// send the mail
	transporter.sendMail(mailOptions, function(error, info) { 
		if (error) {
			return console.log(error); 
		} 
		console.log('Message sent: %s', info.messageId);
		//console.log(module.exports.email);
  	});
}*/