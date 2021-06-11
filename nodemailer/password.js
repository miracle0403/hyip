var mailer = require('nodemailer');
var hbsmail = require('nodemailer-express-handlebars');
//var fs = require('fs');

exports.passReset = function (email, link, expire){
	
	var transporter = mailer.createTransport({ 
		host: 'gmail', 
		port: 26, 
		secure: false, // true for 465, false for other ports
		auth: { 
			user: 'theezwift@gmail.com', // generated ethereal 
			pass:  '08061179366' // generated ethereal password } }); 
		  }
   });


//hbs options
const handlebarOptions = {
	viewEngine: {
		extName: '.hbs',
		partialsDir: '../views/partials/',
		layoutsDir: '',
		defaultLayout: '',
		
	},
		viewPath: './views/', extName: '.hbs'
};

transporter.use('compile', hbsmail(handlebarOptions)); 

//the message properties
	var mailOptions = {
  		from: '',
  		to: email,
  		subject: 'Password Reset',
		template: 'PassReset',
  		context: {
  			expire: expire,
  			email: email,
  			pin: pin
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
function verifymail(email, mailer, hbsmail, fullname, username){
	
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
}