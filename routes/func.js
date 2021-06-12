var db = require('../db.js');

var preset = function(){
	db.query( 'SELECT * FROM passwordReset', function ( err, results, fields ){
		if (err) throw err;
		if (results.length > 0){
			var details = results;
			var now = new Date();
			for(var i = 0; i < details.length; i++){
				if(details[i].expire <= now){
					db.query('DELETE from passwordReset where link = ?', [details[i].link],function ( err, results, fields ){
						if (err) throw err;
					});
				}
			}
		}
	});
}

setInterval(preset, 60000);

exports.feedtimer = function(){
	db.query( 'SELECT * FROM transactions WHERE status = ? and purpose = ? and amount = ?', ['pending', 'feeder_matrix', 10000], function ( err, results, fields ){
		if (err) throw err;
		var trans = results;
		var now = new Date()
		for(var i = 0; i < trans.length; i++){
			var cd = results[i].expire;
			var receiver = trans[i];
			if(now >= cd){
				db.query('CALL leafdel(?)', [receiver.order_id], function(err, results, fields){
					if (err) throw err;
				});
			}
		}
	});
}

exports.feedtimer2 = function(){
	db.query( 'SELECT * FROM transactions WHERE status = ? and purpose = ? and amount = ?', ['pending', 'feeder_matrix', 15000], function ( err, results, fields ){
		if (err) throw err;
		var trans = results;
		for(var i = 0; i < trans.length; i++){
			var cd = results[i].expire;
			var receiver = trans[i];
			if(now >= cd){
				db.query('UPDATE feeder_tree SET level_two = ?, order2 = ? WHERE order_id = ?', ['No', null, receiver.order_id], function(err, results, fields){
					if (err) throw err;
					db.query('UPDATE transactions SET status = ? WHERE order_id = ?', ['Not Paid', receiver.order_id], function(err, results, fields){
						if (err) throw err;
					});
				});
			}
		}
	});
}


exports.actimer = function(){
	db.query( 'SELECT * FROM transactions WHERE status = ? and purpose = ?', ['pending', 'activation'], function ( err, results, fields ){
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
 					
 				});
 			}
		}
	});
}
