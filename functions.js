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
		if( err ) throw err;
		if (results.length > 0){
			for (var i = 0; i < results.length; i++){
				var amount = percent(results[i].percent, results[i].amount);
				var date = new Date();
				var days  = results[i].days * 24;
				var next_due = date.setHours(date.getHours() + days);
				
				db.query('UPDATE earnings SET units = ?, next_due = ? WHERE sn = ?', [amount, next_due, results[i].sn], function ( err, results, fields ){
					if( err ) throw err;
				});
			}
		} 
	});
}



setInterval(addmoney, 87400000);