var x = setInterval(function(){
	var expire = document.getElementById('expirenopop').innerHTML;
	var countDown= new Date(expire).getTime(  );
 		var now = new Date().getTime(  );
		var distance = countDown - now;
		//console.log( distance )
		var days = Math.floor(distance /(1000 * 60 * 60 * 24));
		var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  		var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  		var seconds = Math.floor((distance % (1000 * 60)) / 1000);
	//	var status = 'ACTIVE'
		
		//show them in the demo
						document.getElementById("nopopleft").innerHTML = " " + days + "d " + hours + "h "
  + minutes + "m " + seconds + "s ";
		//document.getElementById("registerbutton").style.display= "none";
		
		if (distance  < 0) {
    		clearInterval(x);
			document.getElementById('nopopleft').innerHTML = "EXPIRED";
			//document.getElementById("registerbutton").style.display= "block";
    		
  		}
 	
		
 	}, 1000);

	
var a = setInterval(function(){
	var expire1 = document.getElementById('expirepop').innerHTML;
	var countDown= new Date(expire1).getTime(  );
 		var now = new Date().getTime(  );
		var distance = countDown - now;
		//console.log( distance )
		var days = Math.floor(distance /(1000 * 60 * 60 * 24));
		var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  		var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  		var seconds = Math.floor((distance % (1000 * 60)) / 1000);
	//	var status = 'ACTIVE'
		
		//show them in the demo
						document.getElementById("popleft").innerHTML = " " + days + "d " + hours + "h "
  + minutes + "m " + seconds + "s ";
		//document.getElementById("registerbutton").style.display= "none";
		
		if (distance  < 0) {
    		clearInterval(x);
			document.getElementById('popleft').innerHTML = "EXPIRED";
			//document.getElementById("registerbutton").style.display= "block";
    		
  		}
 	
		
 	}, 1000);

	
	var b = setInterval(function(){
		var expire2 = document.getElementsById('recevingmatrix');
		for(var i = 0; i < expire2.length; i++){
			var countDown= new Date(expire2.innerHTML).getTime(  );
			console.log(countDown)
			var now = new Date().getTime(  );
			var distance = countDown - now;
			//console.log( distance )
			var days = Math.floor(distance /(1000 * 60 * 60 * 24));
			var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	  		var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
	  		var seconds = Math.floor((distance % (1000 * 60)) / 1000);
		//	var status = 'ACTIVE'
			
			//show them in the demo
							document.getElementById("receivingmatrixtime").innerHTML = " " + days + "d " + hours + "h "
	  + minutes + "m " + seconds + "s ";
			//document.getElementById("registerbutton").style.display= "none";
			
			if (distance  < 0) {
	    		clearInterval(x);
				document.getElementById('receivingmatrixtime').innerHTML = "EXPIRED";
				//document.getElementById("registerbutton").style.display= "block";
	    		
	  		}
		}
		
	}, 1000);

	console.log(expire2)
	
	
	
