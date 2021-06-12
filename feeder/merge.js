var db = require('../db.js');
var feederspill = require('./feederspill.js');
var flash = require('express-flash-messages');
var securePin = require('secure-pin');
var charSet = new securePin.CharSet();
charSet.addLowerCaseAlpha().addUpperCaseAlpha().addNumeric().randomize();
//var func = require('../routes/func.js');

exports.merge = function (bio, req, res){
	securePin.generateString (10, charSet, function(str){
		var date = new Date();
		date.setHours(date.getHours() + 3);
		var year = date.getFullYear();
		var month = date.getMonth() + 1;
		var day = date.getDate() + 1;
		var order_id = 'fe' + str + year + month + day;
		var matrixid = order_id + '/' + bio.username;
		db.query('SELECT * FROM feeder_tree', function(err, results, fields){
			if(err) throw err;
			if(results.length === 0){
				db.query('INSERT INTO feeder_tree(matrixid, username, sponsor,  lft, rgt,  order_id, status, level_two) VALUES(?, ?, ?, ?, ?, ?, ?, ?)', [matrixid, bio.username, bio.sponsor, 1, 2, order_id, 'confirmed', 'Yes'], function(err, results, fields){
					if(err) throw err; 
					db.query('INSERT INTO ftree (orderid, username) VALUES (?,?)', [order_id, bio.username],  function(err, results, fields){
						if (err) throw err;
						var success = 'Matrix created!';
						req.flash('success', success);
						res.redirect('/dashboard')
					});
				});
			}else{
				db.query('SELECT * FROM feeder_tree WHERE username = ? AND status = ?', [bio.sponsor, 'confirmed'], function(err, results, fields){
					if(err) throw err;
					var receiver = results[0]
					//console.log(receiver)
					if(receiver.amount === 0 && receiver.restricted === 'No' && receiver.status === 'confirmed'){
						var purpose = 'feeder_matrix';
						db.query('CALL leafadd(?,?,?,?,?)', [matrixid, receiver.username, order_id, bio.username, bio.sponsor], function(err, results, fields){
							if (err) throw err;
							db.query('CALL placefeeder(?,?,?,?,?,?,?)', [bio.username, purpose, bio.sponsor, receiver.username, order_id, date, receiver.order_id], function(err, results, fields){
								if (err) throw err;
								var success = 'You have been assigned to pay someone';
								req.flash('success', success);
								res.redirect('/dashboard')
							});
						});
					}else if(receiver.amount === 1 && receiver.restricted === 'No' && receiver.status === 'confirmed'){
						var purpose = 'feeder_matrix';
						db.query('CALL leafadd(?,?,?,?,?)', [matrixid, receiver.username, order_id, bio.username, bio.sponsor], function(err, results, fields){
							if (err) throw err;
							db.query('CALL placefeeder(?,?,?,?,?,?,?)', [bio.username, purpose, bio.sponsor, receiver.username, order_id, date, receiver.order_id], function(err, results, fields){
								if (err) throw err;
								var success = 'You have been assigned to pay someone';
								req.flash('success', success);
								res.redirect('/dashboard')
							});
						});
					}else if(receiver.amount > 1 && receiver.restricted === 'No'){
						//spillover
						feederspill.feederspill(receiver, bio, req, res, order_id, date, matrixid);
					}else if(receiver.amount >= 1 && receiver.restricted === 'Yes'){
						//spillover
						feederspill.feederspill(receiver, bio, req, res, order_id, date, matrixid);
					}else if(receiver.amount === 0 && receiver.restricted === 'Yes'){
						db.query('SELECT * FROM feeder_tree ', function(err, results, fields){
							if (err) throw err; 
							var receiver = results[0];
							//spillover
							feederspill.feederspill(receiver, bio, req, res, order_id, date, matrixid);
						});
					}else if(receiver.status !== 'confirmed'){
						var error = 'Take a chill pill. No one is available to receive from you yet.';
						req.flash('mergeerror', error);
						res.redirect('/dashboard')
					}					
				});
			}
		});
	});
}

exports.merge1 = function (bio, req, res){
	securePin.generateString (10, charSet, function(str){
		var date = new Date();
		date.setHours(date.getHours() + 3);
		var year = date.getFullYear();
		var month = date.getMonth() + 1;
		var day = date.getDate() + 1;
		var order_id = 'fe' + str + year + month + day;
		var matrixid = order_id + '/' + bio.username;
		db.query('SELECT * FROM feeder_tree WHERE username = ? AND status = ?', [bio.username, 'confirmed'], function(err, results, fields){
			if(err) throw err;
			var receiver = results[0]
			console.log(results)
			if(receiver.amount === 0 && receiver.restricted === 'No'){
				console.log('1')
				var purpose = 'feeder_matrix';
				db.query('CALL leafadd(?,?,?,?,?)', [matrixid, receiver.username, order_id, bio.username, bio.sponsor], function(err, results, fields){
					if (err) throw err;
					db.query('CALL placefeeder(?,?,?,?,?,?,?)', [bio.username, purpose, bio.sponsor, receiver.username, order_id, date, receiver.order_id], function(err, results, fields){
						if (err) throw err;
						var success = 'You have been assigned to pay someone';
						req.flash('success', success);
						res.redirect('/dashboard')
					});
				});
			}else if(receiver.amount === 1 && receiver.restricted === 'No'){
				console.log('2')
				var purpose = 'feeder_matrix';
				db.query('CALL leafadd(?,?,?,?,?)', [matrixid, receiver.username, order_id, bio.username, bio.sponsor], function(err, results, fields){
					if (err) throw err;
					db.query('CALL placefeeder(?,?,?,?,?,?,?)', [bio.username, purpose, bio.sponsor, receiver.username, order_id, date, receiver.order_id], function(err, results, fields){
						if (err) throw err;
						var success = 'You have been assigned to pay someone';
						req.flash('success', success);
						res.redirect('/dashboard')
					});
				});
			}else if(receiver.amount > 1 && receiver.restricted === 'No'){
				//spillover
				console.log('spill')
				feederspill.feederspill(receiver, bio, req, res, order_id, date, matrixid);
			}else{
				feederspill.feederspill(receiver, bio, req, res, order_id, date, matrixid);
			}
			
		});
	});
}