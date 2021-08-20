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

	var y = setInterval(function(){
	var expire = document.getElementById('expirependingact').innerHTML;
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
						document.getElementById("expirependingacttime").innerHTML = " " + days + "d " + hours + "h "
  + minutes + "m " + seconds + "s ";
		//document.getElementById("registerbutton").style.display= "none";
		
		if (distance  < 0) {
    		clearInterval(x);
			document.getElementById('expirependingacttime').innerHTML = "EXPIRED";
			//document.getElementById("registerbutton").style.display= "block";
    		
  		}
 	
		
 	}, 1000);

	var z = setInterval(function(){
	var expire = document.getElementById('unconfirmedexpire').innerHTML;
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
						document.getElementById("unconfirmedexpiretime").innerHTML = " " + days + "d " + hours + "h "
  + minutes + "m " + seconds + "s ";
		//document.getElementById("registerbutton").style.display= "none";
		
		if (distance  < 0) {
    		clearInterval(x);
			document.getElementById('unconfirmedexpiretime').innerHTML = "EXPIRED";
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
		var expire2 = document.getElementsByName('recevingmatrix');
		for(var i = 0; i < expire2.length; i++){
			var countDown= new Date(expire2[i].innerHTML).getTime(  );
			console.log(expire2[i].innerHTML)
			var now = new Date().getTime(  );
			var distance = countDown - now;
			//console.log( distance )
			var days = Math.floor(distance /(1000 * 60 * 60 * 24));
			var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	  		var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
	  		var seconds = Math.floor((distance % (1000 * 60)) / 1000);
		//	var status = 'ACTIVE'
			
			//show them in the demo
			document.getElementsByName("receivingmatrixtime")[i].innerHTML = " " + days + "d " + hours + "h " + minutes + "m " + seconds + "s ";
			//document.getElementById("registerbutton").style.display= "none";
			
			if (distance  < 0) {
	    		clearInterval(x);
				document.getElementByName('receivingmatrixtime')[i].innerHTML = "EXPIRED";
				//document.getElementById("registerbutton").style.display= "block";
	    		
	  		}
		}
		
	}, 1000);

	var c = setInterval(function(){
		var expire2 = document.getElementsByName('receivingact');
		console.log(expire2)
		for(var i = 0; i < expire2.length; i++){
			var countDown= new Date(expire2[i].innerHTML).getTime(  );
			console.log(expire2[i].innerHTML)
			var now = new Date().getTime(  );
			var distance = countDown - now;
			//console.log( distance )
			var days = Math.floor(distance /(1000 * 60 * 60 * 24));
			var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	  		var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
	  		var seconds = Math.floor((distance % (1000 * 60)) / 1000);
		//	var status = 'ACTIVE'
			
			//show them in the demo
			document.getElementsByName("receivingacttime")[i].innerHTML = " " + days + "d " + hours + "h " + minutes + "m " + seconds + "s ";
			//document.getElementById("registerbutton").style.display= "none";
			
			if (distance  < 0) {
	    		clearInterval(x);
				document.getElementByName('receivingacttime')[i].innerHTML = "EXPIRED";
				//document.getElementById("registerbutton").style.display= "block";
	    		
	  		}
		}
		
	}, 1000);

	var d = setInterval(function(){
		var expire2 = document.getElementsByName('recevingbonus');
		for(var i = 0; i < expire2.length; i++){
			var countDown= new Date(expire2[i].innerHTML).getTime(  );
			console.log(expire2[i].innerHTML)
			var now = new Date().getTime(  );
			var distance = countDown - now;
			//console.log( distance )
			var days = Math.floor(distance /(1000 * 60 * 60 * 24));
			var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	  		var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
	  		var seconds = Math.floor((distance % (1000 * 60)) / 1000);
		//	var status = 'ACTIVE'
			
			//show them in the demo
			document.getElementsByName("receivingbonustime")[i].innerHTML = " " + days + "d " + hours + "h " + minutes + "m " + seconds + "s ";
			//document.getElementById("registerbutton").style.display= "none";
			
			if (distance  < 0) {
	    		clearInterval(x);
				document.getElementByName('receivingbonustime')[i].innerHTML = "EXPIRED";
				//document.getElementById("registerbutton").style.display= "block";
	    		
	  		}
		}
		
	}, 1000);

	
	