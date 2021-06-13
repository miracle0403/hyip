var flash = require('express-flash-messages');
//var securePin = require('secure-pin');
var db = require('../db.js');
//var feeder2spill = require('./feeder2spill.js');
var Math = require('mathjs')

exports.feederspill = function(receiver, bio, req, res, order_id, date, matid){
	var purpose = 'feeder_matrix';
	db.query('SELECT node.matrixid, node.amount, node.username, node.restricted, node.sponsor, node.order_id, (COUNT(parent.matrixid) - (sub_tree.depth + 1)) AS depth FROM feeder_tree AS node, feeder_tree AS parent, feeder_tree AS sub_parent, ( SELECT node.matrixid, (COUNT(parent.matrixid) - 1) AS depth FROM feeder_tree AS node, feeder_tree AS parent WHERE node.lft BETWEEN parent.lft AND parent.rgt AND node.matrixid = ? GROUP BY node.matrixid ORDER BY node.lft )AS sub_tree WHERE node.amount < 2 and node.restricted = ? and node.lft BETWEEN parent.lft AND parent.rgt AND node.lft BETWEEN sub_parent.lft AND sub_parent.rgt AND sub_parent.matrixid = sub_tree.matrixid  and node.status = ? GROUP BY node.matrixid  ORDER BY depth', [receiver.matrixid, 'No', 'confirmed'], function(err, results, fields){
		if(err) throw err;
		if(results.length === 0){
			var error = 'Take a chill pill. No one is ready to receive from you right now.';
			req.flash('mergeerror', error);
			res.redirect('/dashboard')
		}else{
			var feeder = results[0];
			db.query('SELECT node.matrixid, node.username, node.amount, node.restricted, node.sponsor, node.order_id, (COUNT(parent.matrixid) - (sub_tree.depth + 1)) AS depth FROM feeder_tree AS node, feeder_tree AS parent, feeder_tree AS sub_parent, ( SELECT node.matrixid, (COUNT(parent.matrixid) - 1) AS depth FROM feeder_tree AS node, feeder_tree AS parent WHERE node.lft BETWEEN parent.lft AND parent.rgt AND node.matrixid = ? GROUP BY node.matrixid ORDER BY node.lft )AS sub_tree WHERE node.amount = 0 and node.restricted = ? and node.lft BETWEEN parent.lft AND parent.rgt AND node.lft BETWEEN sub_parent.lft AND sub_parent.rgt AND sub_parent.matrixid = sub_tree.matrixid and node.status = ? GROUP BY node.matrixid  ORDER BY depth', [receiver.matrixid, 'No', 'confirmed'], function(err, results, fields){
				if(err) throw err;
				var feeder1 = results;
				db.query('SELECT node.matrixid, node.amount, node.username, node.restricted, node.sponsor, node.order_id, (COUNT(parent.matrixid) - (sub_tree.depth + 1)) AS depth FROM feeder_tree AS node, feeder_tree AS parent, feeder_tree AS sub_parent, ( SELECT node.matrixid, (COUNT(parent.matrixid) - 1) AS depth FROM feeder_tree AS node, feeder_tree AS parent WHERE node.lft BETWEEN parent.lft AND parent.rgt AND node.matrixid = ?  GROUP BY node.matrixid ORDER BY node.lft )AS sub_tree WHERE node.amount = 1 and node.restricted = ? and node.lft BETWEEN parent.lft AND parent.rgt AND node.lft BETWEEN sub_parent.lft AND sub_parent.rgt AND sub_parent.matrixid = sub_tree.matrixid and node.status = ?GROUP BY node.matrixid  ORDER BY depth', [receiver.matrixid, 'No', 'confirmed'], function(err, results, fields){
					if(err) throw err;
					var feeder2 =  results;
					if(feeder1.length === 0 && feeder2[0].depth === feeder.depth){
						var receiver = feeder2[0];
						db.query('CALL leafadd(?,?,?,?,?)', [matid, receiver.username, order_id, bio.username, bio.sponsor], function(err, results, fields){
							if(err){ console.log(err)}
							db.query('CALL placefeeder(?,?,?,?,?,?,?)', [bio.username, purpose, bio.sponsor, receiver.username, order_id, date, receiver.order_id], function(err, results, fields){
								if(err){ console.log(err)}
								console.log('fd')
								var success = 'You have been assigned to pay someone';
								req.flash('success', success);
								res.redirect('/dashboard')
							});
						});
					}else if(feeder2.length === 0 && feeder1[0].depth === feeder.depth){
						var receiver = feeder1[0];
						db.query('CALL leafadd(?,?,?,?,?)', [matid, receiver.username, order_id, bio.username, bio.sponsor], function(err, results, fields){
							if(err){ console.log(err)}
							db.query('CALL placefeeder(?,?,?,?,?,?,?)', [bio.username, purpose, bio.sponsor, receiver.username, order_id, date, receiver.order_id], function(err, results, fields){
								if(err){ console.log(err)}
								console.log('fd')
								var success = 'You have been assigned to pay someone';
								req.flash('success', success);
								res.redirect('/dashboard')
							});
						});
					}else if(feeder2.length > 0 && feeder1[0].depth === feeder.depth){
						var receiver = feeder1[0];
						db.query('CALL leafadd(?,?,?,?,?)', [matid, receiver.username, order_id, bio.username, bio.sponsor], function(err, results, fields){
							if(err){ console.log(err)}
							db.query('CALL placefeeder(?,?,?,?,?,?,?)', [bio.username, purpose, bio.sponsor, receiver.username, order_id, date, receiver.order_id], function(err, results, fields){
								if(err){ console.log(err)}
								console.log('fd')
								var success = 'You have been assigned to pay someone';
								req.flash('success', success);
								res.redirect('/dashboard')
							});
						});
					}else if(feeder1.length > 0 && feeder2[0].depth === feeder.depth){
						var receiver = feeder2[0];
						db.query('CALL leafadd(?,?,?,?,?)', [matid, receiver.username, order_id, bio.username, bio.sponsor], function(err, results, fields){
							if(err){ console.log(err)}
							db.query('CALL placefeeder(?,?,?,?,?,?,?)', [bio.username, purpose, bio.sponsor, receiver.username, order_id, date, receiver.order_id], function(err, results, fields){
								if(err){ console.log(err)}
								console.log('fd')
								var success = 'You have been assigned to pay someone';
								req.flash('success', success);
								res.redirect('/dashboard')
							});
						});
					}
				});
			});
		}
	});
}