'use strict';

var express = require('express');
var router = express.Router();


var passport = require('passport'); 
var securePin = require('secure-pin');
var charSet = new securePin.CharSet();
charSet.addLowerCaseAlpha().addUpperCaseAlpha().addNumeric().randomize();
var mailer = require('nodemailer');
var mail = require('../nodemailer/password.js');

var path = require ('path');
var mv = require('mv');


var { check, validationResult } = require('express-validator');
var bcrypt = require('bcryptjs');

var func = require('../routes/func.js');
var mergefeed1 = require('../feeder/merge.js');
var db = require('../db.js');
var genfunc = require('../functions.js');

var ensureLoggedIn = require( 'connect-ensure-login' ).ensureLoggedIn
const saltRounds = bcrypt.genSaltSync(10);
var formidable = require('formidable');

/* GET home page. */
router.get('/', function(req, res, next) {
	db.query( 'SELECT COUNT(username) AS noactivated  FROM user WHERE activation = ?', ['Yes'], function ( err, results, fields ){
		if( err ) throw err;
		var activated = results[0].noactivated;
		db.query( 'SELECT SUM(amount) AS amount  FROM transactions',  function ( err, results, fields ){
			if( err ) throw err;
			var amount = results[0].amount;
			db.query( 'SELECT COUNT(username) AS nousers  FROM user', function ( err, results, fields ){
				if( err ) throw err;
				var nousers = results[0].nousers;
				res.render('index', { 
					title: 'EZWIFT',
					amount: amount,
					activated: activated,
					nousers: nousers,
					mess: 'BEST P2P ONLINE PLATFORM'					
				});
			});
		});
	});
});

router.get('/ref=:username', function(req, res, next) {
	var username = req.params.username;
	db.query( 'SELECT username FROM user WHERE username = ?', [username], function ( err, results, fields ){
		if( err ) throw err;
		if(results.length === 0){
			res.redirect('/');
		}else{
			db.query( 'SELECT COUNT(username) AS noactivated  FROM user WHERE activation = ?', ['Yes'], function ( err, results, fields ){
				if( err ) throw err;
				var activated = results[0].noactivated;
				db.query( 'SELECT SUM(amount) AS amount  FROM transactions',  function ( err, results, fields ){
					if( err ) throw err;
					var amount = results[0].amount;
					db.query( 'SELECT COUNT(username) AS nousers  FROM user', function ( err, results, fields ){
						if( err ) throw err;
						var nousers = results[0].nousers;
						db.query( 'SELECT *  FROM testimonies ORDER BY date_entered DESC LIMIT 4', function ( err, results, fields ){
							if( err ) throw err;
							var testimonies = results;
							res.render('index', { 
								title: 'EZWIFT',
								date1: testimonies[0].date_entered,
								testimony1: testimonies[0].testimony,
								fullname1: testimonies[0].fullname,
								fullname2: testimonies[1].fullname,
								testimony2: testimonies[1].testimony,
								date2: testimonies[1].date_entered,
								amount: amount,
								activated: activated,
								sponsor: username,
								nousers: nousers,
								mess: 'BEST P2P ONLINE PLATFORM'
							});
						});
					});
				});
			});
		}
	});
});

router.get('/ref=', function(req, res, next) {
	res.redirect('/');
});


/*forgot password*/
router.get('/forgotpassword', function(req, res, next) {	
	const flashMessages = res.locals.getMessages( );
	if(flashMessages.error){
		res.render('forgotpassword', { 
			title: 'EZWIFT', 
			mess: 'Forgot Password?',
			showErrors: true,
			ne: 'fd',
			error: flashMessages.error
		});
	}else if(flashMessages.success){
		res.render('forgotpassword', { 
			title: 'EZWIFT', 
			mess: 'Forgot Password?',
			showSuccess: true,
			ne: 'fd',
			success: flashMessages.success
		});
	} else{
		res.render('forgotpassword', { 
			title: 'EZWIFT', 
			ne: 'fd',
			mess: 'Forgot Password?'
		});
	} 
});

router.get('/forgotpassword/ref=:username', function(req, res, next) {
	var username = req.params.username;
	db.query( 'SELECT username FROM user WHERE username = ?', [username], function ( err, results, fields ){
		if( err ) throw err;
		if(results.length === 0){
			res.redirect('/forgotpassword');
		}else{
			const flashMessages = res.locals.getMessages( );
			if(flashMessages.error){
				res.render('forgotpassword', { 
					title: 'EZWIFT', 
					mess: 'Forgot Password?',
					sponsor: username,
					ne: 'fd',
					showErrors: true,
					error: flashMessages.error
				});
			}else if(flashMessages.success){
				res.render('forgotpassword', { 
					title: 'EZWIFT', 
					mess: 'Forgot Password?',
					sponsor: username,
					ne: 'fd',
					showSuccess: true,
					success: flashMessages.success
				});
			} else{
				res.render('forgotpassword', { 
					title: 'EZWIFT', 
					ne: 'fd',
					sponsor: username,
					mess: 'Forgot Password?'
				});
			} 
		}
	});
});


router.get('/forgotpassword/ref=', function(req, res, next) {
	res.redirect('/forgotpassword');
});

router.get('/forgotpassword/:pin/:email', function(req, res, next) {
	var pin = req.params.pin;
	var email = req.params.email;
	db.query( 'SELECT * FROM passwordreset WHERE email = ? and link = ?', [email, pin], function ( err, results, fields ){
		if( err ) throw err;
		if(results.length === 0){
			var error = 'Invalid link!'
			req.flash('error', error);
			res.redirect('/forgotpassword')
		}else if(results.length > 0 && results[0].status === 'Expired'){
			var error = 'Link is expired!';
			db.query('DELETE FROM passwordreset WHERE link = ? and email = ?', [pin, email],function ( err, results, fields ){
				if( err ) throw err;
				req.flash('error', error);
				res.redirect('/forgotpassword')
			});
		}else if(results.length > 0 && results[0].status === 'Active'){
			res.render('forgotpassword',{
				title: 'EZWIFT',
				mess: 'Forgot Password?',
				passchange: 'CHANGE PASSWORD'
			});
		}
	});
	
});	

//resend password reset code
router.get('/resendPass/email=:email/str=:str', function(req, res, next) {
	func.preset()
	var details = req.params;
	console.log(details)
	db.query( 'SELECT * FROM passwordReset WHERE email = ?  AND link = ?', [details.email, details.str], function ( err, results, fields ){
		if( err ) throw err;
		if(results.length === 0){
				res.redirect('/forgotpassword');
			}else{
				var details = results[0];
				var date = new Date();
				if (details.expire <= date){
					db.query('delete from passwordReset where link = ?', ['/' + details.email + '/' + details.str], function ( err, results, fields ){
						var error = 'Link Expired!';
						req.flash('error', error);
						res.redirect('/forgotpassword');
					});
				}else{
					var success = 'Link resent!'
					var mail = require('../nodemailer/password.js')
					//mail.passReset(details.email, details.link, details.expire);
					res.render('forgotpassword', {
						mess: 'Forgot Password?',
						title: 'EZWIFT',
						email: email,
						str: pin,
						success: success
					});
				}
			}
	 });
});


/* GET faq. */
router.get('/faq', function(req, res, next) {
  res.render('faq', { title: 'EZWIFT', mess: 'FAQ'});
});

router.get('/faq/ref=:username', function(req, res, next) {
	var username = req.params.username;
	db.query( 'SELECT username FROM user WHERE username = ?', [username], function ( err, results, fields ){
		if( err ) throw err;
		if(results.length === 0){
			res.redirect('/faq');
		}else{
			res.render('faq', { title: 'EZWIFT', username: username, mess: 'FAQ'});
		}
	});
});

router.get('/faq/ref=', function(req, res, next) {
	res.redirect('/faq');
});




/* GET howitworks.*/ 
router.get('/howitworks', function(req, res, next) {
  res.render('howitworks', { title: 'EZWIFT', mess: 'HOW IT WORKS'});
});

router.get('/howitworks/ref=:username', function(req, res, next) {
	var username = req.params.username;
	db.query( 'SELECT username FROM user WHERE username = ?', [username], function ( err, results, fields ){
		if( err ) throw err;
		if(results.length === 0){
			res.redirect('/howitworks');
		}else{
			res.render('howitworks', { title: 'EZWIFT', username: username, mess: 'HOW IT WORKS'});
		}
	});
});

router.get('/howitworks/ref=', function(req, res, next) {
	res.redirect('/howitworks');
});



/* GET register. */
router.get('/register', function(req, res, next) {
  res.render('register', { title: 'EZWIFT', mess: 'USER REGISTRATION'});
});

router.get('/register/ref=:username', function(req, res, next) {
	var username = req.params.username;
	db.query( 'SELECT username FROM user WHERE username = ?', [username], function ( err, results, fields ){
		if( err ) throw err;
		if(results.length === 0){
			res.redirect('/register');
		}else{
			res.render('register', { title: 'EZWIFT', sponsor: username, mess: 'USER REGISTRATION'});
		}
	});
});

router.get('/register/ref=', function(req, res, next) {	
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
  res.redirect('/login');
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

//transactions
router.get('/transactions', ensureLoggedIn('/login'), function(req, res, next) {
	var currentUser = req.session.passport.user.user_id;
	db.query('SELECT * FROM user WHERE user_id = ? ', [currentUser], function(err, results, fields){
		if (err) throw err;
		var users = results[0];
		if(users.user_type === 'Administrator'){
			var admin = users;
			db.query('SELECT * FROM transactions WHERE receiver_username = ? OR payer_username = ? ORDER BY status', [admin.username, admin.username], function(err, results, fields){
				if (err) throw err;
				var transactions = results;
				res.render('transactions',{
					title: 'EZWIFT',
					mess: 'MY TRANSACTIONS',
					admin: admin,
					transactions: transactions
				});
			});
		}else{
			var bio = users;
			db.query('SELECT * FROM transactions WHERE receiver_username = ? OR payer_username = ? ORDER BY status', [bio.username, bio.username], function(err, results, fields){
				if (err) throw err;
				var transactions = results;
				res.render('transactions',{
					title: 'EZWIFT',
					mess: 'MY TRANSACTIONS',
					bio: bio,
					transactions: transactions
				});
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
		var users = results[0];
		//console.log(results)
		if(users.user_type === 'Administrator'){
			var admin = users;
			console.log(admin)
			db.query('SELECT  username, phone, email, status, activation, full_name FROM user WHERE sponsor = ? ', [admin.username], function(err, results, fields){
				if (err) throw err;
				var referrals = results;
				db.query('SELECT  COUNT(username) AS count FROM user WHERE sponsor = ? ', [admin.username], function(err, results, fields){
					if (err) throw err;
					console.log(results)
					var count = results[0].count;
					db.query('SELECT  * FROM ftree WHERE username = ? and matrix = ?', [admin.username, 'incomplete'], function(err, results, fields){
						if (err) throw err;
						var ftree = results[0];
						console.log(ftree)
						res.render('referrals', {
							mess: 'MY REFERRALS', 
							title: 'EZWIFT',
							admin: admin,
							count: count,
							ftree: ftree,
							referrals: referrals
						});
					});
				});
			});
		}else{
			var user = users;
			console.log(user)
			db.query('SELECT  username, phone, email, status, activation, full_name FROM user WHERE sponsor = ? ', [user.username], function(err, results, fields){
				if (err) throw err;
				var referrals = results;
				db.query('SELECT  COUNT(username) AS count FROM user WHERE sponsor = ? ', [user.username], function(err, results, fields){
					if (err) throw err;
					console.log(results)
					var count = results[0].count;
					db.query('SELECT  * FROM ftree WHERE username = ?  and matrix = ? ', [user.username, 'incomplete'], function(err, results, fields){
						if (err) throw err;
						var ftree = results[0];
						res.render('referrals', {
							mess: 'MY REFERRALS', 
							title: 'EZWIFT',
							user: user,
							count: count,
							ftree: ftree,
							referrals: referrals
						});
					});
				});
			});
		}
	});
});



//get dashboard
router.get('/dashboard', ensureLoggedIn('/login'), function(req, res, next) {
	func.feedtimer(); func.feedtimer2()
	var currentUser = req.session.passport.user.user_id;
	db.query( 'SELECT * FROM user WHERE user_id = ?', [currentUser], function ( err, results, fields ){
		if( err ) throw err;
		var user = results[0];
		if(user.profile === 'No'){
			res.redirect('/profile');
		}else{
			if(user.user_type === 'Administrator'){
				if(user.activation === 'No'){
					db.query('SELECT * FROM transactions WHERE payer_username = ? AND (status = ? OR status = ? OR status = ?) ', [user.username, 'PENDING', 'UnConfirmed', 'in contest' ], function(err, results, fields){
						if (err) throw err;
						if(results.length === 0){
							res.render('dashboard', {
								title: 'EZWIFT',
								mess: 'DASHBOARD',
								admin: user,
								user: user,
								noactivate: 'You'
							});
						}else{
							var transactions = results[0];
							var flashMessages = res.locals.getMessages();
							if(transactions.status === 'PENDING'){
								if (flashMessages.mergeerror){
									res.render( 'dashboard', {
										mess: 'USER DASHBOARD',
										title: 'EZWIFT',
										user: user,
										admin: user,
										transactions: transactions,
										showErrors: true,
										mergeerror: flashMessages.mergeerror,
										actimerge:'no merging',
										pending: transactions
									});
								}else if (flashMessages.success) {
									res.render( 'dashboard', {
										mess: 'USER DASHBOARD',
										user: user,
										showSuccess: true,
										title: 'EZWIFT',
										admin: user,
										transactions: transactions,
										success: flashMessages.success,
										actimerge:'no merging',
										pending: transactions
									});
								}else if (flashMessages.error){
									res.render( 'dashboard', {
										mess: 'USER DASHBOARD',
										user: user,
										showErrors: true,
										admin: user,
										error: flashMessages.error,
										transactions: transactions,
										actimerge:'no merging',
										title: 'EZWIFT',
										pending: transactions
									});
								}else{
									res.render('dashboard', {
										transactions: transactions,
										title: 'EZWIFT', 
										mess: 'USER DASHBOARD', 
										actimerge:'no merging', 
										admin: user,
										pending: transactions
									});
								}
							}else if(transactions.status === 'unconfirmed'){
								if (flashMessages.mergeerror){
									res.render( 'dashboard', {
										mess: 'USER DASHBOARD',
										title: 'EZWIFT',
										user: user,
										admin: user,
										transactions: transactions,
										showErrors: true,
										mergeerror: flashMessages.mergeerror,
										actimerge:'no merging',
										unconfirmed: transactions
									});
								}else if (flashMessages.success) {
									res.render( 'dashboard', {
										mess: 'USER DASHBOARD',
										user: user,
										showSuccess: true,
										title: 'EZWIFT',
										admin: user,
										transactions: transactions,
										success: flashMessages.success,
										actimerge:'no merging',
										unconfirmed: transactions
									});
								}else if (flashMessages.error){
									res.render( 'dashboard', {
										mess: 'USER DASHBOARD',
										user: user,
										showErrors: true,
										admin: user,
										error: flashMessages.error,
										transactions: transactions,
										actimerge:'no merging',
										title: 'EZWIFT',
										unconfirmed: transactions
									});
								}else{
									res.render('dashboard', {
										transactions: transactions,
										title: 'EZWIFT', 
										mess: 'USER DASHBOARD', 
										actimerge:'no merging', 
										admin: user,
										unconfirmed: transactions
									});
								}
							}else if(transactions.status === 'incontest'){
								if (flashMessages.mergeerror){
									res.render( 'dashboard', {
										mess: 'USER DASHBOARD',
										title: 'EZWIFT',
										user: user,
										admin: user,
										transactions: transactions,
										showErrors: true,
										mergeerror: flashMessages.mergeerror,
										actimerge:'no merging',
										contestmerge: transactions
									});
								}else if (flashMessages.success) {
									res.render( 'dashboard', {
										mess: 'USER DASHBOARD',
										user: user,
										showSuccess: true,
										title: 'EZWIFT',
										admin: user,
										transactions: transactions,
										success: flashMessages.success,
										actimerge:'no merging',
										contestmerge: transactions
									});
								}else if (flashMessages.error){
									res.render( 'dashboard', {
										mess: 'USER DASHBOARD',
										user: user,
										showErrors: true,
										admin: user,
										error: flashMessages.error,
										transactions: transactions,
										actimerge:'no merging',
										title: 'EZWIFT',
										contestmerge: transactions
									});
								}else{
									res.render('dashboard', {
										transactions: transactions,
										title: 'EZWIFT', 
										mess: 'USER DASHBOARD', 
										actimerge:'no merging', 
										admin: user,
										contestmerge: transactions
									});
								}
							}
						}
					});					
				}else{
					db.query( 'SELECT * FROM transactions WHERE payer_username = ? AND status = ? ', [user.username, 'PENDING', ], function ( err, results, fields ){
						if( err ) throw err;
						var nopop = results;
						db.query( 'SELECT * FROM transactions WHERE payer_username = ? AND status = ? ', [user.username, 'Unconfirmed', ], function ( err, results, fields ){
							if( err ) throw err;
							var pop = results;
							db.query( 'SELECT * FROM transactions WHERE payer_username = ? AND status = ? ', [user.username, 'In contest', ], function ( err, results, fields ){
								if( err ) throw err;
								var chat = results;
								db.query( 'SELECT * FROM transactions WHERE receiver_username = ? AND (status = ? OR status = ? OR status = ?) AND purpose = ?', [user.username, 'Pending', 'UnConfirmed', 'in contest', 'activation'], function ( err, results, fields ){
									if( err ) throw err;
									var receivingact = results;
									db.query( 'SELECT * FROM transactions WHERE receiver_username = ? AND (status = ? OR status = ? OR status = ?) AND purpose = ?', [user.username, 'Pending', 'UnConfirmed', 'in contest', 'feeder_matrix'], function ( err, results, fields ){
										if( err ) throw err;
										db.query( 'SELECT sum(amount) AS count FROM transactions WHERE receiver_username = ? AND  status = ? AND purpose = ?', [user.username,  'confirmed', 'feeder_matrix'], function ( err, results, fields ){
											if( err ) throw err;
											var feedmatrix = results[0];
											db.query( 'SELECT sum(amount) AS count FROM transactions WHERE receiver_username = ? AND  status = ? AND purpose = ?', [user.username,  'confirmed', 'activation'], function ( err, results, fields ){
												if( err ) throw err;
												var actimatrix = results[0];
												db.query( 'SELECT sum(amount) AS count FROM transactions WHERE receiver_username = ? AND (status = ? OR status = ? OR status = ?) AND (purpose = ? OR purpose = ? ) ', [user.username, 'Pending', 'UnConfirmed', 'in contest', 'feeder_matrix', 'feeder_bonus'], function ( err, results, fields ){
													if( err ) throw err;
													var expectedEarn = results[0];
													db.query( 'SELECT sum(amount) AS count FROM transactions WHERE payer_username = ? AND status = ? and (purpose = ? or purpose = ?) ', [user.username, 'confirmed', 'activation', 'feeder_matrix'], function ( err, results, fields ){
														if( err ) throw err;
														var totalPaid = results[0];
														db.query( 'SELECT * FROM transactions WHERE receiver_username = ? AND (status = ? OR status = ? OR status = ?) AND purpose = ?', [user.username, 'Pending', 'UnConfirmed', 'in contest', 'feeder_matrix'], function ( err, results, fields ){
															if( err ) throw err;
															var receivingmatrix = results;
															var totalEarned = actimatrix + feedmatrix;
															var flashMessages = res.locals.getMessages();
															if (flashMessages.mergeerror){
																res.render( 'dashboard', {
																	mess: 'USER DASHBOARD',
																	chat: chat,
																	pop: pop,
																	user: user,
																	nopop: nopop,
																	totalPaid: totalPaid,
																	expectedEarn: expectedEarn,
																	admin: user,
																	showErrors: true,
																	mergeerror: flashMessages.mergeerror,
																	activate: 'You are activated',
																	actimatrix: actimatrix,
																	feedmatrix: feedmatrix,
																	totalEarned: totalEarned,
																	receivingact: receivingact,
																	receivingmatrix: receivingmatrix
																	
																});
															}else if (flashMessages.success){
																res.render( 'dashboard', {
																	mess: 'USER DASHBOARD',
																	totalPaid: totalPaid,
																	admin: user,
																	expectedEarn: expectedEarn,
																	showSuccess: true,
																	success: flashMessages.success,
																	chat: chat,
																	user: user,
																	pop: pop,
																	nopop: nopop,
																	activate: 'You are activated',
																	actimatrix: actimatrix,
																	feedmatrix: feedmatrix,
																	totalEarned: totalEarned,
																	receivingact: receivingact,
																	receivingmatrix: receivingmatrix
																});
															}else{
																res.render( 'dashboard', {
																	mess: 'USER DASHBOARD',
																	expectedEarn: expectedEarn,
																	chat: chat,
																	pop: pop,
																	nopop: nopop,
																	admin: user,
																	user: user,
																	totalPaid: totalPaid,
																	activate: 'You are activated',
																	actimatrix: actimatrix,
																	feedmatrix: feedmatrix,
																	totalEarned: totalEarned,
																	receivingact: receivingact,
																	receivingmatrix: receivingmatrix
																});
															}
														});
													});
												});
											});
										});
									});
								});
							});
						});
					});
				}
			}else{
				if(user.activation === 'No'){
					db.query('SELECT * FROM transactions WHERE payer_username = ? AND (status = ? OR status = ? OR status = ?) ', [user.username, 'PENDING', 'UnConfirmed', 'in contest' ], function(err, results, fields){
						if (err) throw err;
						if(results.length === 0){
							res.render('dashboard', {
								title: 'EZWIFT',
								mess: 'DASHBOARD',
								
								user: user,
								noactivate: 'You'
							});
						}else{
							var transactions = results[0];
							var flashMessages = res.locals.getMessages();
							if(transactions.status === 'PENDING'){
								if (flashMessages.mergeerror){
									res.render( 'dashboard', {
										mess: 'USER DASHBOARD',
										title: 'EZWIFT',
										user: user,
										
										transactions: transactions,
										showErrors: true,
										mergeerror: flashMessages.mergeerror,
										actimerge:'no merging',
										pending: transactions
									});
								}else if (flashMessages.success) {
									res.render( 'dashboard', {
										mess: 'USER DASHBOARD',
										user: user,
										showSuccess: true,
										title: 'EZWIFT',
										
										transactions: transactions,
										success: flashMessages.success,
										actimerge:'no merging',
										pending: transactions
									});
								}else if (flashMessages.error){
									res.render( 'dashboard', {
										mess: 'USER DASHBOARD',
										user: user,
										showErrors: true,
										
										error: flashMessages.error,
										transactions: transactions,
										actimerge:'no merging',
										title: 'EZWIFT',
										pending: transactions
									});
								}else{
									res.render('dashboard', {
										transactions: transactions,
										title: 'EZWIFT', 
										mess: 'USER DASHBOARD', 
										actimerge:'no merging', 
										
										pending: transactions
									});
								}
							}else if(transactions.status === 'unconfirmed'){
								if (flashMessages.mergeerror){
									res.render( 'dashboard', {
										mess: 'USER DASHBOARD',
										title: 'EZWIFT',
										user: user,
										
										transactions: transactions,
										showErrors: true,
										mergeerror: flashMessages.mergeerror,
										actimerge:'no merging',
										unconfirmed: transactions
									});
								}else if (flashMessages.success) {
									res.render( 'dashboard', {
										mess: 'USER DASHBOARD',
										user: user,
										showSuccess: true,
										title: 'EZWIFT',
										
										transactions: transactions,
										success: flashMessages.success,
										actimerge:'no merging',
										unconfirmed: transactions
									});
								}else if (flashMessages.error){
									res.render( 'dashboard', {
										mess: 'USER DASHBOARD',
										user: user,
										showErrors: true,
										
										error: flashMessages.error,
										transactions: transactions,
										actimerge:'no merging',
										title: 'EZWIFT',
										unconfirmed: transactions
									});
								}else{
									res.render('dashboard', {
										transactions: transactions,
										title: 'EZWIFT', 
										mess: 'USER DASHBOARD', 
										actimerge:'no merging', 
										
										unconfirmed: transactions
									});
								}
							}else if(transactions.status === 'incontest'){
								if (flashMessages.mergeerror){
									res.render( 'dashboard', {
										mess: 'USER DASHBOARD',
										title: 'EZWIFT',
										user: user,
										
										transactions: transactions,
										showErrors: true,
										mergeerror: flashMessages.mergeerror,
										actimerge:'no merging',
										contestmerge: transactions
									});
								}else if (flashMessages.success) {
									res.render( 'dashboard', {
										mess: 'USER DASHBOARD',
										user: user,
										showSuccess: true,
										title: 'EZWIFT',
										
										transactions: transactions,
										success: flashMessages.success,
										actimerge:'no merging',
										contestmerge: transactions
									});
								}else if (flashMessages.error){
									res.render( 'dashboard', {
										mess: 'USER DASHBOARD',
										user: user,
										showErrors: true,
										
										error: flashMessages.error,
										transactions: transactions,
										actimerge:'no merging',
										title: 'EZWIFT',
										contestmerge: transactions
									});
								}else{
									res.render('dashboard', {
										transactions: transactions,
										title: 'EZWIFT', 
										mess: 'USER DASHBOARD', 
										actimerge:'no merging', 
										
										contestmerge: transactions
									});
								}
							}
						}
					});					
				}else{
					db.query( 'SELECT * FROM transactions WHERE payer_username = ? AND status = ? ', [user.username, 'PENDING', ], function ( err, results, fields ){
						if( err ) throw err;
						var nopop = results;
						db.query( 'SELECT * FROM transactions WHERE payer_username = ? AND status = ? ', [user.username, 'Unconfirmed', ], function ( err, results, fields ){
							if( err ) throw err;
							var pop = results;
							db.query( 'SELECT * FROM transactions WHERE payer_username = ? AND status = ? ', [user.username, 'In contest', ], function ( err, results, fields ){
								if( err ) throw err;
								var chat = results;
								db.query( 'SELECT * FROM transactions WHERE receiver_username = ? AND (status = ? OR status = ? OR status = ?) AND purpose = ?', [user.username, 'Pending', 'UnConfirmed', 'in contest', 'activation'], function ( err, results, fields ){
									if( err ) throw err;
									var receivingact = results;
									db.query( 'SELECT * FROM transactions WHERE receiver_username = ? AND (status = ? OR status = ? OR status = ?) AND purpose = ?', [user.username, 'Pending', 'UnConfirmed', 'in contest', 'feeder_matrix'], function ( err, results, fields ){
										if( err ) throw err;
										db.query( 'SELECT sum(amount) AS count FROM transactions WHERE receiver_username = ? AND  status = ? AND purpose = ?', [user.username,  'confirmed', 'feeder_matrix'], function ( err, results, fields ){
											if( err ) throw err;
											var feedmatrix = results[0];
											db.query( 'SELECT sum(amount) AS count FROM transactions WHERE receiver_username = ? AND  status = ? AND purpose = ?', [user.username,  'confirmed', 'activation'], function ( err, results, fields ){
												if( err ) throw err;
												var actimatrix = results[0];
												db.query( 'SELECT sum(amount) AS count FROM transactions WHERE receiver_username = ? AND (status = ? OR status = ? OR status = ?) AND (purpose = ? OR purpose = ? ) ', [user.username, 'Pending', 'UnConfirmed', 'in contest', 'feeder_matrix', 'feeder_bonus'], function ( err, results, fields ){
													if( err ) throw err;
													var expectedEarn = results[0];
													db.query( 'SELECT sum(amount) AS count FROM transactions WHERE payer_username = ? AND status = ? and (purpose = ? or purpose = ?) ', [user.username, 'confirmed', 'activation', 'feeder_matrix'], function ( err, results, fields ){
														if( err ) throw err;
														var totalPaid = results[0];
														db.query( 'SELECT * FROM transactions WHERE receiver_username = ? AND (status = ? OR status = ? OR status = ?) AND purpose = ?', [user.username, 'Pending', 'UnConfirmed', 'in contest', 'feeder_matrix'], function ( err, results, fields ){
															if( err ) throw err;
															var receivingmatrix = results;
															var totalEarned = actimatrix + feedmatrix;
															var flashMessages = res.locals.getMessages();
															if (flashMessages.mergeerror){
																res.render( 'dashboard', {
																	mess: 'USER DASHBOARD',
																	chat: chat,
																	pop: pop,
																	user: user,
																	nopop: nopop,
																	totalPaid: totalPaid,
																	expectedEarn: expectedEarn,
																	
																	showErrors: true,
																	mergeerror: flashMessages.mergeerror,
																	activate: 'You are activated',
																	actimatrix: actimatrix,
																	feedmatrix: feedmatrix,
																	totalEarned: totalEarned,
																	receivingact: receivingact,
																	receivingmatrix: receivingmatrix
																	
																});
															}else if (flashMessages.success){
																res.render( 'dashboard', {
																	mess: 'USER DASHBOARD',
																	totalPaid: totalPaid,
																	
																	expectedEarn: expectedEarn,
																	showSuccess: true,
																	success: flashMessages.success,
																	chat: chat,
																	user: user,
																	pop: pop,
																	nopop: nopop,
																	activate: 'You are activated',
																	actimatrix: actimatrix,
																	feedmatrix: feedmatrix,
																	totalEarned: totalEarned,
																	receivingact: receivingact,
																	receivingmatrix: receivingmatrix
																});
															}else{
																res.render( 'dashboard', {
																	mess: 'USER DASHBOARD',
																	expectedEarn: expectedEarn,
																	chat: chat,
																	pop: pop,
																	nopop: nopop,
																	
																	user: user,
																	totalPaid: totalPaid,
																	activate: 'You are activated',
																	actimatrix: actimatrix,
																	feedmatrix: feedmatrix,
																	totalEarned: totalEarned,
																	receivingact: receivingact,
																	receivingmatrix: receivingmatrix
																});
															}
														});
													});
												});
											});
										});
									});
								});
							});
						});
					});
				}
			}
		}
	});
});


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
		var bio = results[0];
		if(bio.bank_name === null){
			var error = 'You have not updated your receiving details yet';
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
			var flashMessages = res.locals.getMessages();
			if(results[0].user_type === 'Administrator'){
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
	db.query('SELECT user_type FROM user WHERE user_id = ? AND user_type = ?  ', [currentUser, 'admin'], function ( err, results, fields ){
		if( err ) throw err;
		if (results.length > 0){
			res.redirect('/404');
		}else{
			db.query('SELECT * FROM transactions ', function ( err, results, fields ){
				if( err ) throw err;
				var transactions = results;
				res.render('all-transactions', {mess: 'EZWIFT  Transactions ', transactions: transactions, admin: currentUser});
			});
		}
	});
});


/* POST admin section */

//pay_user
router.post('/pay_user/:order_id', authentificationMiddleware(), function (req, res, next) {	
	var order_id = req.params.order_id;
	var currentUser = req.session.passport.user.user_id;
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
	
//search payment by order_id
router.post('/search-payment/', authentificationMiddleware(), function (req, res, next) {	
	var order_id = req.body.order_id;
	db.query('SELECT * FROM transactions WHERE order_id = ?', [order_id], function ( err, results, fields ){
		if( err ) throw err;
		if(results.length === 0){
			var error = 'Order ID does not exist';
			req.flash('ordererror', error);
			req.redirect('/admin/#order');
		}else{
			var transations = results[0];
			res.render('search', {title: 'HYIP', mess: 'Order ID Search', transactions: transactions, success: 'Search results was successful'});
		}
	});
});
	
//add pakages
router.post('/addpakages', authentificationMiddleware(), [	check('username', 'Username must be between 8 to 25 numbers').isLength(8,25),	check('fullname', 'Full Name must be between 8 to 25 characters').isLength(8,25),	check('password', 'Password must be between 8 to 15 characters').isLength(8,15),	 check('email', 'Email must be between 8 to 105 characters').isLength(8,105),	check('email', 'Invalid Email').isEmail(),		check('phone', 'Phone Number must be eleven characters').isLength(11)], function (req, res, next) {	 
	var days = req.body.days;
	var currentUser = req.session.passport.user.user_id;
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
											db.query('SELECT username FROM user ', function(err, results, fields){
												if (err) throw err;
												if (results.length === 0){
													var sponsor = username;
													//register user
													bcrypt.hash(password, saltRounds,  function(err, hash){
														db.query('INSERT INTO user (user_id, sponsor, full_name, phone, username, email, password, user_type, activation) VALUES (?,?,?,?,?,?,?,?,?)', [ 1, sponsor,  fullname, phone, username, email, hash, 'Administrator', 'Yes'],  function(err, results, fields){
															if (err) throw err;
															var success = 'Registration successful! please login';
															res.render('register', {mess: 'REGISTRATION SUCCESSFUL', success: success});
														});
													});
												}else{
													var sponsor = results[0].username;
													//register user
													bcrypt.hash(password, saltRounds,  function(err, hash){
														db.query('INSERT INTO user ( sponsor,  full_name, phone, username, email, password) VALUES (?,?,?,?,?)', [ sponsor,  fullname, phone, username, email, hash],  function(err, results, fields){
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

router.post('/phonechange', [	 check('phone', 'Phone Number must be between 11 characters').isLength(11) ], function(req, res, next){
	var currentUser = req.session.passport.user.user_id;
	var bio = req.body;
	var errors = validationResult(req).errors;
	if (errors.length > 0){
		res.render('profile', {mess: 'PROFILE UPDATE FAILED', errors: errors, bio: bio });
	}else{
		db.query('SELECT phone FROM user WHERE phone = ?', [bio.phone], function(err, results, fields){
			if (err) throw err;
			if (results.length > 0){
				var error = "Sorry, this Phone number is taken";
				req.flash('phoneerror', error);
				res.redirect('/profile/#phoneerror');
			}else{
				db.query('UPDATE user SET phone = ? WHERE user_id = ?', [bio.phone, currentUser], function(err, results, fields){
					if (err) throw err;
					var success = 'Phone number update was successful!';
					req.flash('phonesuccess', success);
					res.redirect('/profile/#phonesuccess');
				}); 
			}
		});
	}
});


router.post('/emailchange', [	 check('email', 'Email must be between 8 to 105 characters').isLength(8,105),
	check('email', 'Invalid Email').isEmail() ], function(req, res, next){
	var currentUser = req.session.passport.user.user_id;
	var bio = req.body;
	var errors = validationResult(req).errors;
	if (errors.length > 0){
		res.render('profile', {mess: 'PROFILE UPDATE FAILED', errors: errors, bio: bio});
	}else{
		db.query('SELECT email FROM user WHERE email = ?', [bio.email], function(err, results, fields){
			if (err) throw err;
			if (results.length > 0){
				var error = "Sorry, this email is taken";
				req.flash('emailerror', error);
			res.redirect('/profile/#emailerror');
			}else{
				db.query('UPDATE user SET email = ? WHERE user_id = ?', [bio.email, currentUser], function(err, results, fields){
					if (err) throw err;
					var success = 'Email update was successful!';
					req.flash('emailsuccess', success);
			res.redirect('/profile/#emailsuccess');
				}); 
			}
		});
	}
});


router.post('/passwordchange',[	 check('password', 'Password must be between 8 to 15 characters').isLength(8, 15), check('oldpass', 'Old password must be between 8 to 15 characters').isLength(8, 15), check('cpass', 'Password confirmation must be between 8 to 15 characters').isLength(8, 15)], function(req, res, next){
	var currentUser = req.session.passport.user.user_id;
	var bio = req.body;
	var errors = validationResult(req).errors;
	if (errors.length > 0){
		res.render('profile', {mess: 'PROFILE UPDATE FAILED', errors: errors, bio: bio});
	}else if (bio.cpass !== bio.password){
		var error = 'Password does not match';
		req.flash('passworderror', error);
		res.redirect('/profile/#passworderror');
	}else{
		db.query('SELECT password FROM user WHERE user_id = ?', [currentUser], function(err, results, fields){
			if (err) throw err;
			var pash = results[0].password;
			bcrypt.compare(bio.oldpass, pash, function(err, response){
				if(response === false){
					//flash message
					var error = 'password change failed';
					req.flash('passworderror', error);
					res.redirect('/profile/#passworderror');
				}else{
					bcrypt.hash(password, saltRounds, function(err, hash){
						db.query('UPDATE user SET password = ? WHERE user_id = ?', [hash, currentUser], function(err, results, fields){
							if(err) throw err;
							var success = 'Password change was successful';
							req.flash('passwordsuccess', success);
							res.redirect('/profile/#passwordsuccess')
						});
					});
				}
			});
		});
	}
});


router.post('/bank', ensureLoggedIn('/login'), [	 check('fullname', 'Full Name must be less than 25 characters').isLength(5, 25), check('account_name', 'Account Name must be between 8 to 25 characters').isLength(8, 25), check('bank_name', 'Bank Name must be between 3 to 15 characters').isLength(3, 15), check('account_number', 'Account Number must be between 10 characters').isLength(10)], function(req, res, next){
	var currentUser = req.session.passport.user.user_id;
	var bio = req.body;
	var errors = validationResult(req).errors;
	if (errors.length > 0){
		res.render('profile', {mess: 'PROFILE UPDATE FAILED', errors: errors, bio: bio});
	}else{
		db.query('UPDATE user SET full_name = ?, account_name = ?, bank_name = ?, account_number = ?, profile = ? WHERE user_id = ?', [bio.fullname, bio.account_name, bio.bank_name, bio.account_number, 'Yes', currentUser], function(err, results, fields){
			if (err) throw err;
			var success = 'Bank details updated successfully!';
			req.flash('banksuccess', success);
			res.redirect('/profile/#banksuccess')
		});
	}
});


router.post('/activate', authentificationMiddleware(), function(req, res, next) {
	var currentUser = req.session.passport.user.user_id;
	db.query('SELECT * FROM user WHERE user_id = ? ', [currentUser], function(err, results, fields){
		if (err) throw err;
		var details = results[0];
		db.query('SELECT expire FROM transactions WHERE payer_username = ? AND (status = ? OR status = ?  OR status = ?)', [details.username, 'PENDING', 'in contest', 'unconfirmed'], function(err, results, fields){
			if (err) throw err;
			if (results.length > 0){
				var error = 'You still have a pending transaction.'
				req.flash('mergeerror', error);
				res.redirect('/dashboard/#mergeerror');
			}else{
				db.query('SELECT * FROM user WHERE username = ? AND activation = ?', [details.sponsor, 'Yes'], function(err, results, fields){
					if (err) throw err; 
					if(results.length === 0){
						db.query('SELECT * FROM user ', function(err, results, fields){
							if (err) throw err; 
							var receiver = results[0];
							securePin.generateString(13, charSet, function(str){
								var date = new Date();
								var hour = date.getHours();
								var order_id = 'act' + str + hour;
								var dt = new Date();
								date.setHours(date.getHours() + 3);
								console.log(dt, date, receiver, details);
								db.query('INSERT INTO transactions (amount, receiver_username, receiver_phone, receiver_fullname, receiver_bank_name, receiver_account_name, receiver_account_number, payer_username, payer_phone, payer_fullname, order_id, date_entered, expire, purpose) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [1000, receiver.username, receiver.phone, receiver.full_name, receiver.bank_name, receiver.account_name, receiver.account_number, details.username, details.phone, details.full_name, order_id, dt, date, 'activation'], function(err, results, fields){
									if (err){
										var error = 'something went wrong';
										req.flash('mergeerror', error);
										res.redirect('/dashboard/#mergeerror');
									}else{
										var success = 'Someone is ready to receive from you. You have only 2 hours to complete payment';
										req.flash('success', success);
										res.redirect('/dashboard/#success');
									}
								});
							});
						});
					}
					var receiver = results[0];
					securePin.generateString(13, charSet, function(str){
						var date = new Date();
						var hour = date.getHours();
						var order_id = 'act' + str + hour;
						var dt = new Date();
						date.setHours(date.getHours() + 3);
						console.log(dt, date, receiver, details);
						db.query('INSERT INTO transactions (amount, receiver_username, receiver_phone, receiver_fullname, receiver_bank_name, receiver_account_name, receiver_account_number, payer_username, payer_phone, payer_fullname, order_id, date_entered, expire, purpose) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [1000, receiver.username, receiver.phone, receiver.full_name, receiver.bank_name, receiver.account_name, receiver.account_number, details.username, details.phone, details.full_name, order_id, dt, date, 'activation'], function(err, results, fields){
							if (err){
								var error = 'something went wrong';
								req.flash('mergeerror', error);
								res.redirect('/dashboard/#mergeerror');
							}else{
								var success = 'Someone is ready to receive from you. You have only 2 hours to complete payment';
								req.flash('success', success);
								res.redirect('/dashboard/#success');
							}
						});
					});
				});
			}
		});
	});
});


//upload pop
router.post('/uploadpop/:order_id', authentificationMiddleware(),  function(req, res, next){
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

router.post('/confirm-payment-act/:order_id/', authentificationMiddleware(), function(req, res, next){
	var order_id = req.params.order_id;
	var currentUser = req.session.passport.user.user_id;
	db.query('SELECT * FROM transactions WHERE order_id = ?', [order_id], function(err, results, fields){
		if (err) throw err;
		if(results.length === 0){
			var error = 'Something went wrong';
			req.flash('mergeerror', error);
			res.redirect('/dashboard/#mergeerror');
		}else{
			var trans = results[0];
			if(trans.purpose === 'activation'){
				db.query('UPDATE user SET activation = ? WHERE username = ?', ['yes', trans.payer_username], function(err, results, fields){
					if (err) throw err;
					db.query('UPDATE transactions SET status = ? WHERE order_id = ?', ['confirmed', order_id], function(err, results, fields){
						if (err) throw err;
						var success = 'Payment confirmation was successful!';
						req.flash('success', success);
						res.redirect('/dashboard/#success');
						
					});
				});
			}
		}
	});
});


//enter feeder
router.post('/enter-feeder',authentificationMiddleware(), function(req, res, next){
	var currentUser = req.session.passport.user.user_id;
	func.feedtimer();
	//get the username
	db.query('SELECT * FROM user WHERE user_id = ?', [currentUser], function(err, results, fields){
		if (err) throw err;
		var user = results[0];
		db.query('SELECT username FROM feeder_tree WHERE username = ? AND (status = ? OR status = ?)', [user.username, 'PENDING', 'unconfirmed'], function(err, results, fields){
			if (err) throw err;
			if(results.length > 0){
				//console.log(results)
				var error = 'Oooops! you have an unconfirmed feeder matrix transaction. Try again once it is confirmed.';
				req.flash('mergeerror', error)
				res.redirect('/dashboard')
			}else{
				db.query('SELECT * FROM feeder_tree WHERE username = ? AND totalamount < ?', [user.username, 4], function(err, results, fields){
					if (err) throw err;
					if(results.length > 0){
						var error = 'You have to finish a matrix cycle before you start a new one.';
						req.flash('mergeerror', error)
						res.redirect('/dashboard')
					}else{
								//check if the user has entered the matrix before now
						db.query('SELECT * FROM feeder_tree WHERE username = ?', [user.username], function(err, results, fields){
							if (err) throw err;
							//console.log(user)
							if(results.length === 0){
								//get from sponsor
								mergefeed1.merge(user, req, res);
							}else{
								mergefeed1.merge1(user, req, res);
							}
						});
					}
				});
			}
		});
	});
});

//upgrade 
router.post('/upgradefeeder', authentificationMiddleware(), function(req, res, next){
	var currentUser = req.session.passport.user.user_id;
	db.query('SELECT * FROM user WHERE user_id = ?', [currentUser], function(err, results, fields){
		if (err) throw err;
		var users = results[0];
		db.query('SELECT * FROM feeder_tree WHERE username = ? AND amount = ? AND level_two = ?', [users.username, 2, 'No'], function(err, results, fields){
			if (err) throw err;
			if(results.length === 0){
				var error = 'You can not upgrade right now';
				req.flash('mergeerror', error);
				res.redirect('/dashboard/#mergeerror');
			}else{
				var uset = results[0];
				if(uset.level_two === 'pending'){
					var error = 'You have a pending payment';
					req.flash('mergeerror', error);
					res.redirect('/dashboard/#mergeerror');
				}else{
					db.query('SELECT parent.username, parent.totalamount, parent.sponsor, parent.amount, parent.order_id FROM feeder_tree AS node, feeder_tree AS parent WHERE node.lft BETWEEN parent.lft AND parent.rgt AND node.username = ? AND parent.restricted = ? AND parent.level_two = ? AND node.totalamount < 4 ORDER BY parent.lft', [uset.username, 'No', 'Yes'], function(err, results, fields){
						if (err) throw err;
						var receiver = results.slice(-2)[0];
						securePin.generateString (10, charSet, function(str){
							var date = new Date();
							date.setHours(date.getHours() + 3);
							var year = date.getFullYear();
							var month = date.getMonth() + 1;
							var day = date.getDate() + 1;
							var order_id = 'fel2' + str + year + month + day;
							
							var purpose = 'feeder_matrix';
							console.log(receiver)
							db.query('UPDATE feeder_tree SET order2 = ? WHERE order_id = ?', [order_id, uset.order_id], function(err, results, fields){
								if (err) throw err;
								db.query('CALL placefeeder1(?,?,?,?,?,?,?,?)', [users.username, purpose, users.sponsor, receiver.username, order_id, date, receiver.order_id, uset.order_id], function(err, results, fields){
									if (err) throw err;
									var success = 'You have been assigned to pay someone';
									req.flash('success', success);
									res.redirect('/dashboard')
								});
							});
						});
					});
				}
			}
		});
	});
});



//confirm payment 
router.post('/confirm-payment/:order_id/:receive', authentificationMiddleware(), function(req, res, next){
	var order_id = req.params.order_id;
	var receive = req.params.receive;
	var currentUser = req.session.passport.user.user_id;
	//get the username
	db.query('SELECT * FROM user WHERE user_id = ?', [currentUser], function(err, results, fields){
		if (err) throw err;
		var users = results[0];
		//get the details from the transactions table and be sure the order id exist
		db.query('SELECT * FROM transactions WHERE order_id = ?', [order_id], function(err, results, fields){
			if (err) throw err;
			if(results.length === 0){
				var error = 'Something went wrong';
				console.log('wrong orderid')
				req.flash('mergeerror', error);
				res.redirect('/dashboard/#mergeerror');
			}else{
				var trans = results[0];
				//check if the receiving order is correct
				db.query('SELECT * FROM feeder_tree WHERE order_id = ?', [receive], function(err, results, fields){
					if (err) throw err;
					if(results.length === 0){
						var error = 'Something went wrong';
						console.log('wrong receive')
						req.flash('mergeerror', error);
						res.redirect('/dashboard/#mergeerror');
					}else{
						var ord = results[0];
						if(trans.user !== users.username && trans.receiver_username !== users.username){
							var error = 'Something went wrong';
							req.flash('mergeerror', error);
							console.log(username, trans.receiver_username);
							res.redirect('/dashboard/#mergeerror');
						}else{
							if(trans.purpose === 'feeder_matrix' && trans.amount === 10000){
								db.query('SELECT * FROM ftree WHERE orderid = ?', [receive], function(err, results, fields){
									if (err) throw err;
									var matrixid = results;
									db.query('SELECT username FROM feeder_tree WHERE order_id = ?', [order_id], function(err, results, fields){
										if (err) throw err;
										var username = results[0].username;
										genfunc.fillup(username, ord, order_id, matrixid)
										db.query('CALL confirm_feeder1(?,?,?)', [trans.order_id, trans.receiver_username, trans.payer_username ], function(err, results, fields){
											if (err) throw err;
											var success = 'Payment confirmation was successful!';
											req.flash('success', success);
											res.redirect('/dashboard/#success');
										});
									});
								});
							}else if(trans.purpose === 'feeder_matrix' && trans.amount === 15000){
								db.query('SELECT order_id FROM feeder_tree WHERE order2 = ?', [order_id], function(err, results, fields){
									if (err) throw err;
									var totalamount = ord.totalamount;
									var ord2 = results[0].order_id;
									db.query('CALL confirm_feeder2(?,?,?,?,?)', [trans.order_id, trans.receiver_username, trans.payer_username, trans.receving_order, ord2 ], function(err, results, fields){
										if (err) throw err;
										if(totalamount === 4){
											console.log(totalamount, receive)
											db.query('UPDATE ftree SET matrix = ? WHERE orderid = ?', ['completed', receive], function(err, results, fields){
												if (err) throw err;
												var success = 'Payment confirmation was successful! You have completed this matrix, please enter the matrix again to continue earning.';
												req.flash('success', success);
												res.redirect('/dashboard/#success');
											});
										}else{
											
									console.log(ord)
											var success = 'Payment confirmation was successful!';
											req.flash('success', success);
											res.redirect('/dashboard/#success');
										}										
									});
								});
							}
						}
					}
				});
			}
		});
	});
});

//post password reset
router.post('/forgotpassword/:pin', [	 check('pin', 'Code must be 7 characters').isLength(7)], function(req, res, next){
	var email = req.body.email;
	var pin = req.params.pin;
	console.log(req.body)
	var errors = validationResult(req).errors;
	if (errors.length > 0){
		res.render('forgotpassword', {mess: 'Password Reset Failed', errors: errors, email: email, str: pin});
	}else{
		db.query('SELECT email, link FROM passwordreset WHERE email = ? and link = ?', [email, pin], function(err, results, fields){
			if (err) throw err;
			console.log(results);
			if(results.length === 0){
				var error = 'Code is invalid';
				res.render('forgotpassword', {
					mess: 'Forgot Password?',
					title: 'EZWIFT',
					email: email,
					str: pin,
					error: error
				});
			}else{
				res.render('forgotpassword', {
					mess: 'Forgot Password?',
					title: 'EZWIFT',
					email: email,
					changepass: 'fd'
				});
			}
		});
	}
});


router.post('/changepass/:email', [	 check('password', 'Password must be between 7 to 25 characters').isLength(7, 25)], function(req, res, next){
	var email = req.params.email;
	var pass1 = req.body.password;
	var pass2 = req.body.cpass;
	
	var errors = validationResult(req).errors;
	if (errors.length > 0){
		res.render('forgotpassword', {mess: 'Password Reset Failed', errors: errors, email: email, changepass: 'c', pass1: pass1, pass2: pass2});
	}else{
		if(pass1 !== pass2){
			var error = 'Password must match';
			res.render('forgotpassword', {
				mess: 'Password Reset Failed', 
				error: error, 
				email: email, 
				changepass: 'c', 
				pass1: pass1, 
				pass2: pass2
			})
		}else{
			bcrypt.hash(pass1, saltRounds,  function(err, hash){
				db.query('UPDATE user SET password = ? WHERE email = ?', [hash, email], function(err, results, fields){
					if (err) throw err;
					var success = 'Password changed successfully! please login';
					res.render('forgotpassword', {
						mess: 'Password Reset Failed', 
						success: success,
						email: email, 
						changepass: 'c', 
						pass1: pass1, 
						pass2: pass2
					})
				});
			});
		}
	}
});


//post password reset
router.post('/forgotpassword',[	 check('email', 'Email must be between 7 to 50 characters').isLength(7, 50).isEmail()], function(req, res, next){
	var email = req.body.email
	var errors = validationResult(req).errors;
	if (errors.length > 0){
		res.render('forgotpassword', {mess: 'Password Reset Failed', errors: errors, email: email});
	}else{
		db.query('SELECT email FROM user WHERE email = ?', [email], function(err, results, fields){
			if (err) throw err;
			if(results.length === 0){
				var error = 'There is no user associated with this email';
				req.flash('error', error);
				res.redirect('/forgotpassword?');
			}else{
				db.query('DELETE FROM passwordreset WHERE email = ?', [email], function(err, results, fields){
					if (err) throw err;
					var date = new Date();
					date.setMinutes(date.getMinutes() + 20)
					securePin.generatePin(7,  function(pin){
						db.query('INSERT INTO passwordReset (email, expire, link) VALUES (?,?,?)', [email, date, pin], function(err, results, fields){
							if(err) throw err;
							mail.passReset(email, pin, date)
							var success = 'A link has been sent to your email... Check your spam if you did not see it in your inbox.';
							res.render('forgotpassword', {
								mess: 'Forgot Password?',
								title: 'EZWIFT',
								email: email,
								str: pin,
								success: success
							});
						});
					});
				});
			}
		});
	}
});


module.exports = router;
