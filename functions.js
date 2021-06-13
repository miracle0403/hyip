var db = require('./db.js');

exports.dirname = function(path){
	return path.dirname(__filename);
}

function percent(percent, amount){
	var hu = percent / 100;
	var answer = hu * amount;
	return answer;
}


var addmoney = function (){
	var date = new Date();
	
	db.query('SELECT * FROM earnings WHERE next_due >= ? ', [date], function ( err, results, fields ){
		if(err){ console.log(err)}
		if (results.length > 0){
			for (var i = 0; i < results.length; i++){
				var amount = percent(results[i].percent, results[i].amount);
				var date = new Date();
				var days  = results[i].days * 24;
				var next_due = date.setHours(date.getHours() + days);
				
				db.query('UPDATE earnings SET units = ?, next_due = ? WHERE sn = ?', [amount, next_due, results[i].sn], function ( err, results, fields ){
					if(err){ console.log(err)}
				});
			}
		} 
	});
}


exports.fillup = function(username, receiver, order, matid){
	db.query('INSERT INTO ftree (orderid, username) VALUES (?,?)', [order, username],  function(err, results, fields){
		if (err) throw err;
		db.query('SELECT totalamount, amount FROM feeder_tree WHERE order_id = ? and username = ?', [receiver.order_id, receiver.username], function ( err, results, fields ){
			if(err){ console.log(err)}
			var resu = results[0];
			console.log(resu, receiver, order)
			if(matid[0].a === null){
				console.log('here')
				db.query('UPDATE ftree SET a = ? WHERE orderid = ?', [username, receiver.order_id], function ( err, results, fields ){
					if(err){ console.log(err)}
					db.query('SELECT receiving_order FROM transactions WHERE order_id = ? and payer_username = ?', [receiver.order_id, receiver.username], function ( err, results, fields ){
						if(err){ console.log(err)}
						if(results.length === 1){
							var reorder = results[0].receiving_order;
							db.query('SELECT a, b FROM ftree WHERE orderid = ? ', [reorder], function ( err, results, fields ){
								if(err){ console.log(err)}
								var red = results[0];
								if (red.a === receiver.username){
									db.query('UPDATE ftree SET aa = ? WHERE orderid = ?', [username, reorder], function ( err, results, fields ){
										if(err){ console.log(err)}
									});
								}else if (red.b === receiver.username){
									db.query('UPDATE ftree SET ba = ? WHERE orderid = ?', [username, reorder], function ( err, results, fields ){
										if(err){ console.log(err)}
									});
								}
							});
						}
					});
				});
			}else if(matid[0].b === null){
				db.query('UPDATE ftree SET b = ? WHERE orderid = ?', [username, receiver.order_id], function ( err, results, fields ){
					if(err){ console.log(err)}
					db.query('SELECT receiving_order FROM transactions WHERE order_id = ? and payer_username = ?', [receiver.order_id, receiver.username], function ( err, results, fields ){
						if(err){ console.log(err)}
						if(results.length === 1){
							var reorder = results[0].receiving_order;
							db.query('SELECT a, b FROM ftree WHERE orderid = ? ', [reorder], function ( err, results, fields ){
								if(err){ console.log(err)}
								var red = results[0];
								if (red.a === receiver.username){
									db.query('UPDATE ftree SET ab = ? WHERE orderid = ?', [username, reorder], function ( err, results, fields ){
										if(err){ console.log(err)}
									});
								}else if (red.b === receiver.username){
									db.query('UPDATE ftree SET bb = ? WHERE orderid = ?', [username, reorder], function ( err, results, fields ){
										if(err){ console.log(err)}
									});
								}
							});
						}
						
					});
				});
			}
		});
	});
}


setInterval(addmoney, 87400000);