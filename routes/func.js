var db = require('../db.js');

exports.sponsor = function(){
	
}

exports.timer = function(now, distance){
	var days = Math.floor(distance / (1000 * 60 * 60 * 24));
  var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = Math.floor((distance % (1000 * 60)) / 1000);
 return days + ' days ' + hours + ' hours ' + ' minutes ' + minutes + ' seconds ';
}


exports.preset = function(){
	db.query( 'SELECT * FROM passwordReset', function ( err, results, fields ){
		if (err) throw err;
		if (results.length > 0){
			var details = results;
			var now = new Date();
			for(var i = 0; i < details.length; i++){
				if(details[i] <= now){
					db.query('DELETE from passwordReset where link = ?', [details[i].link],function ( err, results, fields ){
						if (err) throw err;
					});
				}
			}
		}
	});
}


exports.spon = function(sponsor){
	db.query( 'SELECT user, number FROM default_sponsor WHERE user = ?', [sponsor], function ( err, results, fields ){
		if (err) throw err;
		if (results.length > 0){
			//add the amount
			db.query('UPDATE default_sponsor SET number = ? WHERE user = ?', [results[0].number + 1, sponsor], function(err, results, fields){
 				if (err) throw err;
 			});
		}
	});
}

exports.feedtimer = function(){
	db.query( 'SELECT * FROM transactions WHERE status = ? and purpose = ? or purpose = ?', ['pending', 'feeder_matrix', 'feeder_bonus'], function ( err, results, fields ){
		if (err) throw err;
		var trans = results;
		var now = new Date()
		for(var i = 0; i < trans.length; i++){
			var cd = results[i].expire;
			var receiver = trans[i];
			if(now >= cd){
				db.query('CALL leafdel(?,?,?,?)', [receiver.user, receiver.payer_username, receiver.order_id, receiver.receiving_order], function(err, results, fields){
					if (err) throw err;
				});
			}
		}
	});
}

exports.ref = function(user){
	db.query( 'SELECT COUNT(username) AS count FROM user WHERE sponsor = ?', [user], function ( err, results, fields ){
		if (err) throw err;
		var coun = results[0].count;
		return coun;
	});
}

exports.actimer = function(){
	db.query( 'SELECT * FROM transactions WHERE status = ?', ['pending'], function ( err, results, fields ){
		if (err) throw err;
		
		var trans = results;
		var now = new Date()
		for(var i = 0; i < trans.length; i++){ 
			
			var cd = results[i].expire;
			//var countDown = cd
			var receiver = trans[i].receiver_username;
			
			//var distance = countDown - now;
			console.log(now, cd, now > cd)
			
			if(now >= cd){
 				db.query('UPDATE transactions SET status = ? WHERE expire = ?', ['Not Paid', cd], function(err, results, fields){
 					if (err) throw err;
 					db.query('UPDATE activation SET alloted = alloted + 1 WHERE username = ?', [receiver], function(err, results, fields){
 						if (err) throw err;
 					});
 				});
 			}
		}
	});
}

exports.norec = function(order_id){
	db.query( 'SELECT a, b, c, requiredEntrance FROM feeder_tree WHERE order_id = ? ', [order_id ],function ( err, results, fields ){
		if (err) throw err;
		var resu = results[0];
		console.log(results);
		if(resu.a !== null && resu.b !== null && resu.c !== null){
			db.query( 'UPDATE feeder_tree set  requiredEntrance = ? WHERE order_id = ?', [resu.requiredEntrance - 1, order_id ],function ( err, results, fields ){
				if(err)throw err;
			});
		}
	});
}

exports.noreceive = function(){
	db.query( 'SELECT * FROM feeder_tree WHERE receive = ? and requiredEntrance > ?', ['yes', 0 ],function ( err, results, fields ){
		if (err) throw err;
		if(results.length > 0){
			var re = results;
		//	console.log(re)
			for(var i = 0; i < re.length; i++){
				console.log(re[i]);
				db.query( 'UPDATE feeder_tree set receive = ? WHERE username = ?', ['No', re[i].username], function ( err, results, fields ){
					if(err)throw err;
					//check if the sponsor is present
					db.query( 'SELECT sponsor FROM feeder_tree WHERE sponsor = ?', [re[i].username], function ( err, results, fields ){
						if (err) throw err;
						if(results.length > 0){
							db.query( 'UPDATE feeder_tree set sponreceive = ? WHERE sponsor = ?', ['No', re[i].sponsor],function ( err, results, fields ){
								if(err)throw err;
							});
						}
					});
				});
			}
		}
	
	});
}



exports.receive = function(){
	db.query( 'SELECT * FROM feeder_tree WHERE receive = ? and restricted = ? and requiredEntrance < ?', ['No', 'No', 1 ],function ( err, results, fields ){
		if (err) throw err;
		if(results.length > 0){
			var re = results;
		//	console.log(re)
			for(var i = 0; i < re.length; i++){
				db.query( 'UPDATE feeder_tree set receive = ? WHERE username = ?', ['yes', re[i].username], function ( err, results, fields ){
					if(err)throw err;
					//check if the sponsor is present
					console.log(re[i].username);
					db.query( 'SELECT sponsor FROM feeder_tree WHERE sponsor = ?', [re[i].username], function ( err, results, fields ){
						if (err) throw err;
						if(results.length > 0){
							db.query( 'UPDATE feeder_tree set sponreceive = ? WHERE sponsor = ?', ['yes', re[i].sponsor],function ( err, results, fields ){
								if(err)throw err;
							});
						}
					});
				});
			}
		}
	
	});
}


exports.spamActi = function(currentUser, req, res){
	db.query( 'SELECT COUNT(payer_username) AS count FROM transactions WHERE status = ? AND payer_username = ?', ['Not Paid', currentUser ],function ( err, results, fields ){
		if (err) throw err;
		var count = results[0].count;
		db.query( 'SELECT payer_username FROM transactions WHERE (status = ? OR status = ? OR status = ? OR status = ?) AND payer_username = ?',	['confirmed', 'pending', 'unconfirmed', 'in contest', currentUser ],function ( err, results, fields ){
			if (err) throw err;
			if (results.length === 0 && count >= 3){
				var error = 'You have been banned for spam';
				req.flash('mergeerror', error);
				res.redirect('/dashboard/#mergeerror');
			}
		});
	});
}