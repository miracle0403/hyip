'use strict';

var express = require('express');
var router = express.Router();

var passport = require('passport'); 
var securePin = require('secure-pin');
var charSet = new securePin.CharSet();
charSet.addLowerCaseAlpha().addUpperCaseAlpha().addNumeric().randomize();

var { check, validationResult } = require('express-validator');
var bcrypt = require('bcryptjs');

var db = require('../db.js');
var getfunc = require('../functions.js');

var ensureLoggedIn = require( 'connect-ensure-login' ).ensureLoggedIn


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'hyip' });
});

router.get('/ref=:username', function(req, res, next) {
	var username = req.params.username;
	db.query( 'SELECT username FROM user WHERE username = ?', [username], function ( err, results, fields ){
		if( err ) throw err;
		if(results.length === 0){
			res.redirect('/');
		}else{
			res.render('index', { title: 'hyip', username: username});
		}
	});
});

router.get('/ref=', function(req, res, next) {
	res.redirect('/');
});


/* GET faq. */
router.get('/faq', function(req, res, next) {
  res.render('faq', { title: 'hyip', mess: 'FAQ'});
});

router.get('/faq/ref=:username', function(req, res, next) {
	var username = req.params.username;
	db.query( 'SELECT username FROM user WHERE username = ?', [username], function ( err, results, fields ){
		if( err ) throw err;
		if(results.length === 0){
			res.redirect('/faq');
		}else{
			res.render('faq', { title: 'hyip', username: username, mess: 'FAQ'});
		}
	});
});

router.get('/faq/ref=', function(req, res, next) {
	res.redirect('/faq');
});




/* GET howitworks. */
router.get('/howitworks', function(req, res, next) {
  res.render('howitworks', { title: 'hyip', mess: 'HOW IT WORKS'});
});

router.get('/howitworks/ref=:username', function(req, res, next) {
	var username = req.params.username;
	db.query( 'SELECT username FROM user WHERE username = ?', [username], function ( err, results, fields ){
		if( err ) throw err;
		if(results.length === 0){
			res.redirect('/howitworks');
		}else{
			res.render('howitworks', { title: 'hyip', username: username, mess: 'HOW IT WORKS'});
		}
	});
});

router.get('/howitworks/ref=', function(req, res, next) {
	res.redirect('/howitworks');
});



/* GET register. */
router.get('/register', function(req, res, next) {
  res.render('register', { title: 'hyip', mess: 'USER REGISTRATION'});
});

router.get('/ref=:username', function(req, res, next) {
	var username = req.params.username;
	db.query( 'SELECT username FROM user WHERE username = ?', [username], function ( err, results, fields ){
		if( err ) throw err;
		if(results.length === 0){
			res.redirect('/register');
		}else{
			res.render('register', { title: 'hyip', username: username, mess: 'USER REGISTRATION'});
		}
	});
});

router.get('/ref=', function(req, res, next) {
	res.redirect('/register');
});


/* GET login */
router.get('/login', function(req, res, next) {
	
	const flashMessages = res.locals.getMessages( );
	if( flashMessages.error ){
		res.render( 'login', {
			showErrors: true,
			errors: flashMessages.error
		});
	}else{
		var message = 'LOG IN';
		res.render('login', { mess: message });
	}
});

router.get('/login/ref=:username', function(req, res, next){
	const flashMessages = res.locals.getMessages( );
	var username = req.params.username;
	db.query('SELECT username FROM user WHERE username = ?', [username], function(err, results, fields){
		if (err) throw err;
		if(results.length === 0){
			res.redirect('/login');
		}else{
			if( flashMessages.error ){
				res.render( 'login', {
					showErrors: true,
					mess: 'LOG IN',
					errors: flashMessages.error
				});
			}else{
				var message = 'LOG IN';
				res.render('login', { mess: message });
			}
		}
	});
});


router.get('/login/ref=', function(req, res, next) {
	res.redirect('/login')
});

//get logout
router.get('/logout', function(req, res, next) {
  req.logout();
  req.session.destroy();
  res.redirect('/');
});

/* GET after login */

router.get('/iPaid/:order_id/', ensureLoggedIn('/login'), function(req, res, next) {
	var currentUser = req.session.passport.user.user_id;
	var order_id = req.params.order_id;	

	db.query( 'SELECT * FROM transactions WHERE order_id = ?', [order_id], function ( err, results, fields ){
		if( err ) throw err;
		if(results.length === 0){
			var error = 'Something went wrong';
			req.flash('mergeerror', error);
			res.redirect('/dashboard/#mergeerror');
		}else{
			var flashMessages = res.locals.getMessages();
			if (flashMessages.error ){
				res.render( 'ipaid', {
					mess: 'Upload POP',
					error: error,
					order_id: order_id,
					
					showErrors: true,
					error: flashMessages.error});
			}else{
				res.render('ipaid', {mess: 'Upload POP', order_id: order_id  });
			}
		}
	});
});


//get profile
router.get('/profile', ensureLoggedIn('/login'), function(req, res, next) {
	var currentUser = req.session.passport.user.user_id;
	db.query('SELECT * FROM user WHERE user_id = ? ', [currentUser], function(err, results, fields){
		if (err) throw err;
		if(results[0].user_type == 'user'){
			var bio = results[0];
			if(bio.bank_name === null && bitcoin === null){
				var error = 'You have not updated your bank details yet';
				var flashMessages = res.locals.getMessages();
				if (flashMessages.emailerror ){
					res.render( 'profile', {
							mess: 'PROFILE UPDATE',
							error: error,
							bio: bio,
							showErrors: true,
							emailerror: flashMessages.emailerror});
				}else if (flashMessages.emailsuccess){
					res.render( 'profile', {
							mess: 'PROFILE UPDATE',
							error: error,
							bio: bio,
							showSuccess: true,
							emailsuccess: flashMessages.emailsuccess});
				}else if (flashMessages.phonesuccess){
					res.render( 'profile', {
							mess: 'PROFILE UPDATE',
							error: error,
							showSuccess: true,
							bio: bio,
							phonesuccess: flashMessages.phonesuccess});
				}else if (flashMessages.phoneerror ){
					res.render( 'profile', {
							mess: 'PROFILE UPDATE',
							error: error,
							bio: bio,
							showErrors: true,
							phoneerror: flashMessages.phoneerror});
				}else if (flashMessages.passworderror ){
					res.render( 'profile', {
							mess: 'PROFILE UPDATE',
							error: error,
							bio: bio,
							showErrors: true,
							passworderror: flashMessages.passworderror});
				}else if (flashMessages.passwordsuccess){
					res.render( 'profile', {
							mess: 'PROFILE UPDATE',
							error: error,
							bio: bio,
							showSuccess: true,
							passwordsuccess: flashMessages.passwordsuccess});
				}else if (flashMessages.banksuccess){
					res.render( 'profile', {
							mess: 'PROFILE UPDATE',
							error: error,
							bio: bio,
							showSuccess: true,
							banksuccess: flashMessages.banksuccess});
				} else if (flashMessages.bankerror ){
					res.render( 'profile', {
							mess: 'PROFILE UPDATE',
							error: error,
							bio: bio,
							showErrors: true,
							bankerror: flashMessages.bankerror});
				}else if (flashMessages.bitcoinerror ){
					res.render( 'profile', {
							mess: 'PROFILE UPDATE',
							error: error,
							bio: bio,
							showErrors: true,
							bankerror: flashMessages.bankerror});
				}else if (flashMessages.bitcoinsuccess){
					res.render( 'profile', {
							mess: 'PROFILE UPDATE',
							error: error,
							bio: bio,
							showSuccess: true,
							banksuccess: flashMessages.banksuccess});
				}else{
					res.render('profile', {mess: 'User Profile', error: error, bio: bio});
				}
			}else{
				if (flashMessages.emailerror ){
					res.render( 'profile', {
							mess: 'PROFILE UPDATE',
							error: error,
							admin: admin,
							showErrors: true,
							emailerror: flashMessages.emailerror});
				}else if (flashMessages.emailsuccess){
					res.render( 'profile', {
							mess: 'PROFILE UPDATE',
							error: error,
							admin: admin,
							showSuccess: true,
							emailsuccess: flashMessages.emailsuccess});
				}else if (flashMessages.phonesuccess){
					res.render( 'profile', {
							mess: 'PROFILE UPDATE',
							error: error,
							showSuccess: true,
							admin: admin,
							phonesuccess: flashMessages.phonesuccess});
				}else if (flashMessages.phoneerror ){
					res.render( 'profile', {
							mess: 'PROFILE UPDATE',
							error: error,
							admin: admin,
							showErrors: true,
							phoneerror: flashMessages.phoneerror});
				}else if (flashMessages.passworderror ){
					res.render( 'profile', {
							mess: 'PROFILE UPDATE',
							error: error,
							admin: admin,
							showErrors: true,
							passworderror: flashMessages.passworderror});
				}else if (flashMessages.passwordsuccess){
					res.render( 'profile', {
							mess: 'PROFILE UPDATE',
							error: error,
							admin: admin,
							showSuccess: true,
							passwordsuccess: flashMessages.passwordsuccess});
				}else if (flashMessages.banksuccess){
					res.render( 'profile', {
							mess: 'PROFILE UPDATE',
							error: error,
							admin: admin,
							showSuccess: true,
							banksuccess: flashMessages.banksuccess});
				} else if (flashMessages.bankerror ){
					res.render( 'profile', {
							mess: 'PROFILE UPDATE',
							error: error,
							admin: admin,
							showErrors: true,
							bankerror: flashMessages.bankerror});
				}else if (flashMessages.bitcoinerror ){
					res.render( 'profile', {
							mess: 'PROFILE UPDATE',
							error: error,
							admin: admin,
							showErrors: true,
							bankerror: flashMessages.bankerror});
				}else if (flashMessages.bitcoinsuccess){
					res.render( 'profile', {
							mess: 'PROFILE UPDATE',
							error: error,
							admin: admin,
							showSuccess: true,
							banksuccess: flashMessages.banksuccess});
				}else{
					res.render('profile', {mess: 'User Profile', error: error, admin: admin});
				}
			}
		}else{
			var admin = results[0];
			if (flashMessages.emailerror ){
				res.render( 'profile', {
						mess: 'PROFILE UPDATE',
						
						admin: admin,
						showErrors: true,
						emailerror: flashMessages.emailerror});
			}else if (flashMessages.emailsuccess){
				res.render( 'profile', {
						mess: 'PROFILE UPDATE',
						
						admin: admin,
						showSuccess: true,
						emailsuccess: flashMessages.emailsuccess});
			}else if (flashMessages.phonesuccess){
				res.render( 'profile', {
						mess: 'PROFILE UPDATE',
						
						showSuccess: true,
						admin: admin,
						phonesuccess: flashMessages.phonesuccess});
			}else if (flashMessages.phoneerror ){
				res.render( 'profile', {
						mess: 'PROFILE UPDATE',
						
						admin: admin,
						showErrors: true,
						phoneerror: flashMessages.phoneerror});
			}else if (flashMessages.passworderror ){
				res.render( 'profile', {
						mess: 'PROFILE UPDATE',
						
						admin: admin,
						showErrors: true,
						passworderror: flashMessages.passworderror});
			}else if (flashMessages.passwordsuccess){
				res.render( 'profile', {
						mess: 'PROFILE UPDATE',
						
						admin: admin,
						showSuccess: true,
						passwordsuccess: flashMessages.passwordsuccess});
			}else if (flashMessages.banksuccess){
				res.render( 'profile', {
						mess: 'PROFILE UPDATE',
						
						admin: admin,
						showSuccess: true,
						banksuccess: flashMessages.banksuccess});
			} else if (flashMessages.bankerror ){
				res.render( 'profile', {
						mess: 'PROFILE UPDATE',
						
						admin: admin,
						showErrors: true,
						bankerror: flashMessages.bankerror});
			}else if (flashMessages.bitcoinerror ){
				res.render( 'profile', {
						mess: 'PROFILE UPDATE',
						
						admin: admin,
						showErrors: true,
						bankerror: flashMessages.bankerror});
			}else if (flashMessages.bitcoinsuccess){
				res.render( 'profile', {
						mess: 'PROFILE UPDATE',
						
						admin: admin,
						showSuccess: true,
						banksuccess: flashMessages.banksuccess});
			}else{
				res.render('profile', {mess: 'User Profile',  admin: admin});
			}
		}
		
	});
});


//transactions
router.get('/transactions', ensureLoggedIn('/login'), function(req, res, next) {
	
  var currentUser = req.session.passport.user.user_id;
  db.query('SELECT * FROM user WHERE user_id = ? ', [currentUser], function(err, results, fields){
		if (err) throw err;
		if (results[0].user_type === 'user'){
			var bio = results[0];
			db.query('SELECT * FROM transactions WHERE payer_username = ? or receiver_username = ? or user = ? ', [bio.username, bio.username, bio.username], function(err, results, fields){
				if (err) throw err;
				var transactions = results;
				var message = 'My Transactions';
				res.render('transactions', {title: 'HYIP', mess: message, transactions: transactions});
			});
		}else{
			var admin = results[0];
			db.query('SELECT * FROM transactions WHERE payer_username = ? or receiver_username = ? or user = ? ', [admin.username, admin.username, admin.username], function(err, results, fields){
				if (err) throw err;
				var transactions = results;
				var message = 'My Transactions';
				res.render('transactions', {title: 'HYIP', mess: message, transactions: transactions, admin: admin});
			});
		}
	});
});

//referrals
router.get('/referrals', ensureLoggedIn('/login'), function(req, res, next) {
	
  var currentUser = req.session.passport.user.user_id;
  //check for referrals.
  db.query('SELECT * FROM user WHERE user_id = ? ', [currentUser], function(err, results, fields){
		if (err) throw err;
		//console.log(results)
		if(results[0].user_type === 'user'){
			var bio = results[0];
			db.query('SELECT  username, phone, email, status, activated, full_name FROM user WHERE sponsor = ? ', [bio.username], function(err, results, fields){
				if (err) throw err;
				var referrals = results;
				db.query('SELECT a, b, c FROM feeder_tree WHERE (a is null or b is null or c is null) and username = ?', [bio.username], function(err, results, fields){
					if (err) throw err;
					var leg = results[0];
					db.query( 'SELECT COUNT(username) AS count FROM user WHERE sponsor = ?', [bio.username], function ( err, results, fields ){
						if (err) throw err;
						var count = results[0].count;
						console.log(count)
						res.render('referrals', {title: 'HYIP', mess: 'MY REFERRALS', count: count, leg: leg, bio: bio, referrals: referrals})
					});
				});
			});
		}else if(results.user_type === 'admin'){
			var admin = results[0];
			db.query('SELECT  username, phone, email, status, activated, full_name FROM user WHERE sponsor = ? ', [admin.username], function(err, results, fields){
				if (err) throw err;
				var referrals = results;
				var count = func.ref(admin.username);
				db.query('SELECT a, b, c FROM feeder_tree WHERE (a is null or b is null or c is null) and username = ?', [admin.username], function(err, results, fields){
					if (err) throw err;
					var leg = results[0];
					db.query( 'SELECT COUNT(username) AS count FROM user WHERE sponsor = ?', [admin.username], function ( err, results, fields ){
						if (err) throw err;
						var count = results[0].count;
						res.render('referrals', {title: 'HYIP', mess: 'MY REFERRALS', count: count, admin: admin, leg: leg, referrals: referrals});
					});
				});
			});
		}
	});
});

/* GET admin section */

//all users
router.get('/all-users', ensureLoggedIn('/login'), function(req, res, next) {
	var currentUser = req.session.passport.user.user_id;
	getfunc.admin(currentUser, db, req, res);
	db.query('SELECT * FROM user ', function ( err, results, fields ){
		if( err ) throw err;
		var users = results;
		res.render('all-users', {mess: 'EZWIFT  All Users ', users: users, admin: currentUser});
	});
});

//all users
router.get('/all-users', ensureLoggedIn('/login'), function(req, res, next) {
	var currentUser = req.session.passport.user.user_id;
	getfunc.admin(currentUser, db, req, res);
	db.query('SELECT * FROM user ', function ( err, results, fields ){
		if( err ) throw err;
		var users = results;
		res.render('all-users', {mess: 'EZWIFT  All Users ', users: users, admin: currentUser});
	});
});

//admin dashboard
router.get('/admin-dashboard', authentificationMiddleware(), ensureLoggedIn('/login'), function(req, res, next) {
	var currentUser = req.session.passport.user.user_id;
	getfunc.admin(currentUser, db, req, res);
	var flashMessages = res.locals.getMessages();
	if (flashMessages.adderror){
		res.render( 'admin-dashboard', {
			mess: 'ADMIN DASHBOARD',
			admin: currentUser,
			showErrors: true,
			adderror: flashMessages.adderror
		});
	}else if (flashMessages.delerror){
		res.render( 'admin-dashboard', {
			mess: 'ADMIN DASHBOARD',
			admin: currentUser,
			showErrors: true,
			delerror: flashMessages.delerror
		});
	}else if (flashMessages.addsuccess) {
		res.render( 'admin-dashboard', {
			mess: 'ADMIN DASHBOARD',
			admin: currentUser,
			showSuccess: true,
			addsuccess: flashMessages.addsuccess
		});
	}else if (flashMessages.delsuccess) {
		res.render( 'admin-dashboard', {
			mess: 'ADMIN DASHBOARD',
			admin: currentUser,
			showSuccess: true,
			delsuccess: flashMessages.delsuccess
		});
	}else{
		res.render( 'admin-dashboard', {
			mess: 'ADMIN DASHBOARD',
			admin: currentUser
		});
	}
});

//all transactions
router.get('/all-transactions', ensureLoggedIn('/login'), function(req, res, next) {
	var currentUser = req.session.passport.user.user_id;
	getfunc.admin(currentUser, db, req, res);
	db.query('SELECT * FROM transactions ', function ( err, results, fields ){
		if( err ) throw err;
		var transactions = results;
		res.render('all-transactions', {mess: 'EZWIFT  Transactions ', transactions: transactions, admin: currentUser});
	});
});


/* POST admin section */

//pay_user
router.post('/pay_user/:order_id', authentificationMiddleware(), function (req, res, next) {	
	var order_id = req.params.order_id;
	var transaction_id = req.body.transaction_id;
	db.query('SELECT * FROM transactions WHERE order_id = ? ', [order_id], function ( err, results, fields ){
		if( err ) throw err;
		if(results.length === 0){
			var error = 'incorrect order_id';
			req.flash('error', error);
			req.redirect('/pending_transactions');
		}else{
			db.query('UPDATE transactions SET transaction_id = ?, status = ? WHERE order_id = ?', [transaction_id, 'Paid', order_id], function ( err, results, fields ){
				var success = 'User has been paid!';
				req.flash('success', success);
				res.redirect('/transactions');
			});
		}
	});
});
	
	
	
//add pakages
router.post('/addpakages', authentificationMiddleware(), [	check('username', 'Username must be between 8 to 25 numbers').isLength(8,25),	check('fullname', 'Full Name must be between 8 to 25 characters').isLength(8,25),	check('password', 'Password must be between 8 to 15 characters').isLength(8,15),	 check('email', 'Email must be between 8 to 105 characters').isLength(8,105),	check('email', 'Invalid Email').isEmail(),		check('phone', 'Phone Number must be eleven characters').isLength(11)], function (req, res, next) {	 
	var days = req.body.days;
	var amount = req.body.amount;
	var packageName = req.body.packageName;
	var interest = req.body.interest;
	var products = req.body.products;
	
	var errors = validationResult(req).errors;
	
	if (errors.length > 0){
		res.render('admin', { mess: 'ADMIN DASHBOARD', errors: errors, days: days, amount: amount, interest: interest, packageName:packageName});
	}else{
		db.query('INSERT INTO pakages (amount, products, days, packageName, interest) VALUES (?,?,?,?,?)', [amount, products, productName, '/assets/img/pop/' + file.name], function(err, results, fields){
			if(err) throw err;
			var success = 'Product added successfully';
			req.flash('success', success);
			res.redirect('/admin/#products');
		});
	}
});



//add products
router.post('/addproduct', authentificationMiddleware(), function(req, res, next){
	var rootdir = genfunc.dirname(path);
	var subdir = '/public/assets/img/pop/';
	var dir  = path.join(rootdir + subdir);
	var maxFileSize = 2 * 1024 * 1024
	var form = formidable({ multiples: true});
	
	form.parse(req, function(err, fields, files){
		if(err){
			console.log(err)
		}else{
			var fi = JSON.stringify(files)
			var fil = JSON.parse(fi);
			var file = fil.pop;
			console.log(file)
			if (file.type === 'image/jpeg' || file.type === 'image/png'){
				if(file.size <= maxFileSize){
					mv(file.path, dir + file.name, function (err) {
						if (err) throw err;
						
						var productName = fields.productName;
						var amount = fields.amount;
						
						db.query('INSERT INTO products (amount, product_name, product_image) VALUES (?,?,?)', [amount, productName, '/assets/img/pop/' + file.name], function(err, results, fields){
							if(err) throw err;
							var success = 'Product added successfully';
							req.flash('success', success);
							res.redirect('/dashboard/');
						});
					});
				}else{
					var error = 'File must not exceed 2mb.';
					fs.unlink (file.path, function (err) {
						if (err) throw err;
						console.log('File deleted!');
						req.flash('error', error);
						res.redirect('/ipaid/' + order_id);
					});
				}
			}else{
				var error = 'File type must be either jpg or png format only.';
				fs.unlink (file.path, function (err) {
					if (err) throw err;
					console.log('File deleted!');
					req.flash('error', error);
					res.redirect('/ipaid/' + order_id);
				});
			}
		}
	});
});

/* post user section */

//post register
router.post('/register', [	check('username', 'Username must be between 8 to 25 numbers').isLength(8,25),	check('fullname', 'Full Name must be between 8 to 25 characters').isLength(8,25),	check('password', 'Password must be between 8 to 15 characters').isLength(8,15),	 check('email', 'Email must be between 8 to 105 characters').isLength(8,105),	check('email', 'Invalid Email').isEmail(),		check('phone', 'Phone Number must be eleven characters').isLength(11)], function (req, res, next) {	 
	console.log(req.body)
	
	var username = req.body.username;
    var password = req.body.password;
    var cpass = req.body.cpass;
    var email = req.body.email;
    var fullname = req.body.fullname;
    
    var phone = req.body.phone;
	var sponsor = req.body.sponsor;
	
	var errors = validationResult(req).errors;
	
	if (errors.length > 0){
		res.render('register', { mess: 'REGISTRATION FAILED', errors: errors, username: username, email: email, phone: phone, password: password, cpass: cpass, fullname: fullname, sponsor: sponsor});
	}else{
		if (cpass !== password){
			var error = 'Password must match';
			res.render('register', { mess: 'REGISTRATION FAILED', errors: errors, username: username, email: email, phone: phone, password: password, cpass: cpass, fullname: fullname, sponsor: sponsor, error: error});
		}else{
			if(typeof(phone) !== 'number'){
				var error = 'Unsupported phone number format. Please review.';
				res.render('register', { mess: 'REGISTRATION FAILED', errors: errors, username: username, email: email, phone: phone, password: password, cpass: cpass, fullname: fullname, sponsor: sponsor, error: error});
			}else{
				db.query('SELECT username FROM user WHERE username = ?', [username], function(err, results, fields){
					if (err) throw err;
					if(results.length > 0){
						var error = "Sorry, this username is taken";
						res.render('register', { mess: 'REGISTRATION FAILED', error: error, username: username, email: email, phone: phone, password: password, cpass: cpass, fullname: fullname,  sponsor: sponsor});
					}else{
						db.query('SELECT email FROM user WHERE email = ?', [email], function(err, results, fields){
							if (err) throw err;
							if (results.length > 0){
								var error = "Sorry, this email is taken";
								res.render('register', { mess: 'REGISTRATION FAILED', error: error, username: username, email: email, phone: phone, password: password, cpass: cpass, fullname: fullname,     sponsor: sponsor});
							}else{
								db.query('SELECT phone FROM user WHERE phone = ?', [phone], function(err, results, fields){
									if (err) throw err;
								
									if (results.length > 0){
										var error = "Sorry, this phone number is taken";
										res.render('register', { mess: 'REGISTRATION FAILED', error: error, username: username, email: email, phone: phone, password: password, cpass: cpass, fullname: fullname,     sponsor: sponsor});
									}else{
										db.query('SELECT username FROM user WHERE username = ?', [sponsor], function(err, results, fields){
											if (err) throw err;
											if (results.length === 0){
												db.query('SELECT user_id FROM user DESC', function(err, results, fields){
													if (err) throw err;
													if (results.length > 0){
														//register user
														bcrypt.hash(password, saltRounds,  function(err, hash){
															db.query('INSERT INTO user (user_id, full_name, phone, username, email, password) VALUES (?,?,?,?,?,?)', [ 1, fullname, phone, username, email, hash],  function(err, results, fields){
																if (err) throw err;
																var success = 'Registration successful! please login';
																res.render('register', {mess: 'REGISTRATION SUCCESSFUL', success: success});
															});
														});
													}else{
														//register user
														bcrypt.hash(password, saltRounds,  function(err, hash){
															db.query('INSERT INTO user ( full_name, phone, username, email, password) VALUES (?,?,?,?,?)', [  fullname, phone, username, email, hash],  function(err, results, fields){
																if (err) throw err;
																var success = 'Registration successful! please login';
																res.render('register', {mess: 'REGISTRATION SUCCESSFUL', success: success});
															});
														});
													}
												});
											}else{
												//register user
												bcrypt.hash(password, saltRounds,  function(err, hash){
													db.query('INSERT INTO user (sponsor, full_name, phone, username, email, password) VALUES (?,?,?,?,?,?)', [ sponsor, fullname, phone, username, email, hash],  function(err, results, fields){
														if (err) throw err;
														var success = 'Registration successful! please login';
														res.render('register', {mess: 'REGISTRATION SUCCESSFUL', success: success});
													});
												});
											}
										});
									}
								});
							}
						});
					}
				});
			}
		}
	}
});




//post log in
router.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
  function(req, res) {
	res.redirect('/dashboard');
});


//Passport login
passport.serializeUser(function(user_id, done){
  done(null, user_id)
});
        
passport.deserializeUser(function(user_id, done){
  done(null, user_id)
});



function authentificationMiddleware(){
  return (req, res, next) => {
    console.log(JSON.stringify(req.session.passport));
  if (req.isAuthenticated()) return next();

  res.redirect('/login'); 
  } 
}

//withraw
router.post('/withdraw', authentificationMiddleware(), function(req, res, next){
	var account = req.body.account;
	var bank = req.body.bank;
	
	var account_name = req.body.account_name;
	var account_number  = req.body.account_number;
	var bitcoin = req.body.bitcoin;
	var payment_method = req.body.payment_method;
	var currentUser = req.session.passport.user.user_id;
	
	db.query('SELECT * FROM user WHERE user_id = ? ', [currentUser], function(err, results, fields){
		if (err) throw err;
		var details = results[0];
		
		if(payment_method === 'Bitcoin' && bitcoin === ''){
			var error = 'Bitcoin address is empty!';
			req.flash('error', error);
			re.redirect('/withdraw');
		}else if(payment_method === 'Bank' && account_name === '' ){
			var error = 'Bank details is incomplete!';
			req.flash('error', error);
			re.redirect('/withdraw');
		}else if(payment_method === 'Bank' && account_number === ''){
			var error = 'Bank details is incomplete!';
			req.flash('error', error);
			re.redirect('/withdraw');
		}else if(payment_method === 'Bank' && bank === ''){
			var error = 'Bank details is incomplete!';
			req.flash('error', error);
			re.redirect('/withdraw');
		}else{
			var date = new Date();
			var year = date.getFullYear();
			var month = date.getMonth();
			securePin.generateString(10, charSet, function(str){
				var order_id = str + year + month;
				if(payment_method === 'Bitcoin'){
					db.query('INSERT INTO payment_queue (order_id, username, bitcoin_address, amount, full_name) VALUES (?,?,?,?,?)', [order_id, details.username, details.bitcoin_address, amount],  function(err, results, fields){
						if (err) throw err;
						var success = 'Withdraw request successful!';
						req.flash('success', success);
						re.redirect('/transactions');
					});
				}else if(payment_method === 'Bank'){
					db.query('INSERT INTO payment_queue (order_id, username, bank, amount, account_name, account_number) VALUES (?,?,?,?,?,?)', [order_id, details.username, details.bank, amount, details.account_name, details.account_number ],  function(err, results, fields){
						if (err) throw err;
						var success = 'Withdraw request successful!';
						req.flash('success', success);
						re.redirect('/transactions');
					});
				}
			});
		}
	});
});

//upload pop
router.post('/uploadpop/:order_id/', function(req, res, next){
	var order_id = req.params.order_id;
	var rootdir = genfunc.dirname(path);
	var subdir = '/public/assets/img/pop/';
	var dir  = path.join(rootdir + subdir);
	console.log(dir)
	var maxFileSize = 2 * 1024 * 1024
	var form = formidable({ multiples: true});
	form.parse(req, function(err, fields, files){
		if(err){
			console.log(err)
		}else{
			var fi = JSON.stringify(files)
			var fil = JSON.parse(fi);
			var file = fil.pop;
			console.log(file)
			if (file.type === 'image/jpeg' || file.type === 'image/png'){
					if(file.size <= maxFileSize){
						mv(file.path, dir + file.name, function (err) {
							if (err) throw err;
							var date = new Date();
							var dt = new Date();
													date.setHours(date.getHours() + 25);
							db.query('UPDATE transactions SET pop = ?, status = ?, expire = ? WHERE order_id = ?', ['/assets/img/pop/' + file.name, 'unconfirmed', date,  order_id], function(err, results, fields){
								if(err) throw err;
								var success = 'pop uploaded successfully';
								req.flash('success', success);
								res.redirect('/dashboard/');
							});
						});
					}else{
						var error = 'File must not exceed 2mb.';
						fs.unlink (file.path, function (err) {
							if (err) throw err;
							console.log('File deleted!');
							req.flash('error', error);
							res.redirect('/ipaid/' + order_id);
						});
					}
				//});
			}else{
				var error = 'File type must be either jpg or png format only.';
				fs.unlink (file.path, function (err) {
					if (err) throw err;
					console.log('File deleted!');
					req.flash('error', error);
				res.redirect('/ipaid/' + order_id);
				});
			}
		}
	});
});

module.exports = router;
