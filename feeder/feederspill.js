var flash = require('express-flash-messages');
//var securePin = require('secure-pin');
var db = require('../db.js');
//var feeder2spill = require('./feeder2spill.js');
var Math = require('mathjs')

exports.feederspill = function(bio, req, res, order_id, date){
	db.query('SELECT node.username, node.amount, node.restricted, node.sponsor, node.order_id, (COUNT(parent.username) - (sub_tree.depth + 1)) AS depth FROM feeder_tree AS node, feeder_tree AS parent, feeder_tree AS sub_parent, ( SELECT node.username, (COUNT(parent.username) - 1) AS depth FROM feeder_tree AS node, feeder_tree AS parent WHERE node.lft BETWEEN parent.lft AND parent.rgt AND node.username = ? GROUP BY node.username ORDER BY node.lft )AS sub_tree WHERE node.amount < 2 and node.restricted = ? and node.lft BETWEEN parent.lft AND parent.rgt AND node.lft BETWEEN sub_parent.lft AND sub_parent.rgt AND sub_parent.username = sub_tree.username GROUP BY node.username  ORDER BY depth', [bio.username, 'No'], function(err, results, fields){
		if(err) throw err;
		var feeder = results[0];
		console.log('1', results)
		db.query('SELECT node.username, node.amount, node.restricted, node.sponsor, node.order_id, (COUNT(parent.username) - (sub_tree.depth + 1)) AS depth FROM feeder_tree AS node, feeder_tree AS parent, feeder_tree AS sub_parent, ( SELECT node.username, (COUNT(parent.username) - 1) AS depth FROM feeder_tree AS node, feeder_tree AS parent WHERE node.lft BETWEEN parent.lft AND parent.rgt AND node.username = ? GROUP BY node.username ORDER BY node.lft )AS sub_tree WHERE node.amount = 0 and node.restricted = ? and node.lft BETWEEN parent.lft AND parent.rgt AND node.lft BETWEEN sub_parent.lft AND sub_parent.rgt AND sub_parent.username = sub_tree.username GROUP BY node.username  ORDER BY depth', [bio.username, 'No'], function(err, results, fields){
			if(err) throw err;
			var feeder1 =  results
			console.log('2', results)
			db.query('SELECT node.username, node.amount, node.restricted, node.sponsor, node.order_id, (COUNT(parent.username) - (sub_tree.depth + 1)) AS depth FROM feeder_tree AS node, feeder_tree AS parent, feeder_tree AS sub_parent, ( SELECT node.username, (COUNT(parent.username) - 1) AS depth FROM feeder_tree AS node, feeder_tree AS parent WHERE node.lft BETWEEN parent.lft AND parent.rgt AND node.username = ? GROUP BY node.username ORDER BY node.lft )AS sub_tree WHERE node.amount = 1 and node.restricted = ? and node.lft BETWEEN parent.lft AND parent.rgt AND node.lft BETWEEN sub_parent.lft AND sub_parent.rgt AND sub_parent.username = sub_tree.username GROUP BY node.username  ORDER BY depth', [bio.username, 'No'], function(err, results, fields){
				if(err) throw err;
				var feeder2 =  results
				console.log('3', results)
				if(feeder.depth === feeder1[0].depth){
					//place in feeder1
					var receiver = feeder1[0];
					var purpose = 'feeder_matrix';
					db.query('CALL leafadd(?,?,?,?)', [receiver.username, order_id, bio.username, bio.sponsor], function(err, results, fields){
						if (err) throw err;
						db.query('CALL placefeeder(?,?,?,?,?,?,?)', [bio.username, purpose, bio.sponsor, receiver.username, order_id, date, receiver.order_id], function(err, results, fields){
							if (err) throw err;
							var success = 'You have been assigned to pay someone';
							req.flash('success', success);
							res.redirect('/dashboard')
						});
					});
				}else if(feeder.depth === feeder2[0].depth){
					//place in feeder1
					console.log('feeder 2 2');
					var purpose = 'feeder_matrix';
					var receiver = feeder2[0];
					db.query('CALL leafadd(?,?,?,?)', [receiver.username, order_id, bio.username, bio.sponsor], function(err, results, fields){
						if (err) throw err;
						db.query('CALL placefeeder(?,?,?,?,?,?,?)', [bio.username, purpose, bio.sponsor, receiver.username, order_id, date, receiver.order_id], function(err, results, fields){
							if (err) throw err;
							var success = 'You have been assigned to pay someone';
							req.flash('success', success);
							res.redirect('/dashboard')
						});
					});
				}else{
					if(feeder.order_id === feeder1[0].order_id){
						console.log('feeder 1 3');
						var receiver = feeder1[0];
						var purpose = 'feeder_matrix';
						db.query('CALL leafadd(?,?,?,?)', [receiver.username, order_id, bio.username, bio.sponsor], function(err, results, fields){
							if (err) throw err;
							db.query('CALL placefeeder(?,?,?,?,?,?,?)', [bio.username, purpose, bio.sponsor, receiver.username, order_id, date, receiver.order_id], function(err, results, fields){
								if (err) throw err;
								var success = 'You have been assigned to pay someone';
								req.flash('success', success);
								res.redirect('/dashboard')
							});
						});
					}else if (feeder.order_id === feeder2[0].order_id){
						//place in feeder1
						console.log('feeder 2 3');
						var purpose = 'feeder_matrix';
						var receiver = feeder2[0];
						db.query('CALL leafadd(?,?,?,?)', [receiver.username, order_id, bio.username, bio.sponsor], function(err, results, fields){
							if (err) throw err;
							db.query('CALL placefeeder(?,?,?,?,?,?,?)', [bio.username, purpose, bio.sponsor, receiver.username, order_id, date, receiver.order_id], function(err, results, fields){
								if (err) throw err;
								var success = 'You have been assigned to pay someone';
								req.flash('success', success);
								res.redirect('/dashboard')
							});
						});
					}else{
						var error = 'Something went wrong';
						req.flash('mergeerror', error);
						res.redirect('/dashboard')
					}
				}				
			});
		});
	});
}