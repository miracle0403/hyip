var db = require('../db.js');

var preset = function(){
	db.query( 'SELECT * FROM passwordreset', function ( err, results, fields ){
		if(err){ console.log(err)}
		if (results.length > 0){
			var details = results;
			var now = new Date();
			for(var i = 0; i < details.length; i++){
				if(details[i].expire <= now){
					db.query('DELETE from passwordReset where link = ?', [details[i].link],function ( err, results, fields ){
						if(err){ console.log(err)}
					});
				}
			}
		}
	});
}

setInterval(preset, 60000);

exports.feedtimer = function(){
	db.query( 'SELECT * FROM transactions WHERE (status = ? OR status = ?) and purpose = ? and amount = ?', ['pending', 'unconfirmed', 'feeder_matrix', 10000], function ( err, results, fields ){
		if(err){ console.log(err)}
		var trans = results;
		var now = new Date()
		for(var i = 0; i < trans.length; i++){
			var cd = results[i].expire;
			var receiver = trans[i];
			if(now >= cd){
				db.query('CALL leafdel(?,?)', [receiver.order_id, receiver.receiving_order], function(err, results, fields){
					if(err){ console.log(err)}
				});
			}
		}
	});
}


exports.feedtimer2 = function(){
	db.query( 'SELECT * FROM transactions WHERE (status = ? OR status = ?) and purpose = ? and amount = ?', ['pending', 'unconfirmed', 'feeder_matrix', 15000], function ( err, results, fields ){
		if(err){ console.log(err)}
		var trans = results;
		var now = new Date()
		for(var i = 0; i < trans.length; i++){
			var cd = results[i].expire;
			var receiver = trans[i];
			
			if(now >= cd){
				db.query('CALL leafdel2(?,?)', [receiver.order_id, receiver.receiving_order], function(err, results, fields){
					if(err){ console.log(err)}
				});
			}
		}	
	});	
}

exports.feedtimer3 = function(){
	db.query( 'SELECT * FROM transactions WHERE (status = ? OR status = ?) and purpose = ? and amount = ?', ['pending', 'unconfirmed', 'feeder_bonus', 15000], function ( err, results, fields ){
		if(err){ console.log(err)}
		var trans = results;
		var now = new Date()
		for(var i = 0; i < trans.length; i++){
			var cd = results[i].expire;
			var receiver = trans[i];
			
			if(now >= cd){
				db.query('CALL leafdel3(?,?)', [receiver.order_id, receiver.receiving_order], function(err, results, fields){
					if(err){ console.log(err)}
				});
			}
		}	
	});	
}

	
exports.actimer = function(){
	db.query( 'SELECT * FROM transactions WHERE status = ? and purpose = ?', ['pending', 'activation'], function ( err, results, fields ){
		if(err){ console.log(err)}
		
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
 					if(err){ console.log(err)}
 					
 				});
 			}
		}
	});
}
