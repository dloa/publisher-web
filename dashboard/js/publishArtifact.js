ipfs.setProvider({host: 'ipfs.alexandria.io', port: '443', protocol: 'https'});

// Set up here so that it is accessable in other methods.
var duration = 0;

$('#previewButton').click(function(e){
	var hasPaymentInfo = false;
	var mediaType = "#" + $("#metainfo div.active").attr('id');
	console.log(mediaType);
	// Validate form.
	// Required: Video Title
	if (isBlank($(mediaType + ' #title').val())){
		swal("Error!", "You must provide a title", "error");
		$(mediaType + " #artifactTitleGroup").addClass('has-error');
		return;
	} else {
		$(mediaType + " #artifactTitleGroup").removeClass('has-error');
	}
	// Required: Date
	if (isBlank($(mediaType + ' #releaseDate').val()) || isNaN(parseInt($(mediaType + ' #releaseDate').val())) || parseInt($(mediaType + ' #releaseDate').val()) <= 0){
		swal("Error!", "You must provide a release year", "error");
		$(mediaType + " #artifactDateGroup").addClass('has-error');
		return;
	} else {
		$(mediaType + " #artifactDateGroup").removeClass('has-error');
	}
	// Required: Description
	if (isBlank($(mediaType + ' #description').val())){
		swal("Error!", "You must provide a description", "error");
		$(mediaType + " #artifactDescriptionGroup").addClass('has-error');
		return;
	} else {
		$(mediaType + " #artifactDescriptionGroup").removeClass('has-error');
	}

	// Validate optional items for music metadata
	if (mediaType == '#music'){
		// Optional: Artist Name
		if (isBlank($(mediaType + ' #artistName').val())){
			$(mediaType + " #artifactArtistGroup").addClass('has-warning');
		} else {
			$(mediaType + " #artifactArtistGroup").removeClass('has-warning');
		}
		// Optional: genre
		if (isBlank($(mediaType + ' #genre').val())){
			$(mediaType + " #artifactgenreGroup").addClass('has-warning');
		} else {
			$(mediaType + " #artifactgenreGroup").removeClass('has-warning');
		}
		// Optional: Tags
		if (isBlank($(mediaType + ' #tags').val())){
			$(mediaType + " #artifactTagsGroup").addClass('has-warning');
		} else {
			$(mediaType + " #artifactTagsGroup").removeClass('has-warning');
		}
		// Optional: Record Label
		if (isBlank($(mediaType + ' #recordLabel').val())){
			$(mediaType + " #artifactRecordLabelGroup").addClass('has-warning');
		} else {
			$(mediaType + " #artifactRecordLabelGroup").removeClass('has-warning');
		}
	}
	// Validate optional items for video metadata
	if (mediaType == '#video'){
		// Optional: Director Name
		if (isBlank($(mediaType + ' #directorName').val())){
			$(mediaType + " #artifactDirectorGroup").addClass('has-warning');
		} else {
			$(mediaType + " #artifactDirectorGroup").removeClass('has-warning');
		}
		// Optional: Distributor
		if (isBlank($(mediaType + ' #distributor').val())){
			$(mediaType + " #artifactDistributorGroup").addClass('has-warning');
		} else {
			$(mediaType + " #artifactDistributorGroup").removeClass('has-warning');
		}
	}

	// Check if there is any pricing info entered at all
	// Optional: Pricing
	$('.price').each(function(){
		if (!isBlank($(this).val()))
			hasPaymentInfo = true;
	});
	// Required: Bitcoin Address
	if (hasPaymentInfo && isBlank($('#bitcoinAddressGroup input').val())){
		swal("Error!", "You must provide a Bitcoin address", "error");
		$("#bitcoinAddressGroup").addClass('has-error');
		return;
	} else {
		$("#bitcoinAddressGroup").removeClass('has-error');
	}

	// Set all of the items in the preview.
	// Set title.
	$('#previewTitle').text($(mediaType + ' #title').val());
	// Set Publisher
	if (mediaType == '#music')
		$('#previewArtist').text($(mediaType + ' #artist').val());
	else if (mediaType == '#video')
		$('#previewArtist').text($(mediaType + ' #directorName').val());
	// Set Description
	$('#previewDescription').text($(mediaType + ' #description').val());
	// Set Media
	try {
		var newURL = URL.createObjectURL(mediaFiles[0]);
		$('#previewVideo').attr('src', newURL);
	} catch(e) {
		swal('Error', 'You must select a video file.', 'error');
		return;
	}
	// Try to set poster
	try {
		var reader = new FileReader();
		reader.onload = function (e) {
		  $('#previewVideo').attr('poster', e.target.result);
		};
		reader.readAsDataURL($(mediaType + 'PosterFile').prop('files')[0]);
	} catch(e) { }
	// Get and set runtime
	window.URL = window.URL || window.webkitURL;
	var video = document.createElement('video');
	video.preload = 'metadata';
	video.onloadedmetadata = function() {
		window.URL.revokeObjectURL(this.src)
		duration = video.duration;
		mediaFiles[0].duration = duration;
		$("#runtime").text(formatRuntime(duration.toFixed(0).toString()));
	}
	video.src = URL.createObjectURL(mediaFiles[0]);
	// Set the publish time/date
	var dateString = dateFormat(new Date(), "dddd, mmmm dS, yyyy, h:MM:ss TT Z");
	$('#current-time').text(dateString);

	$('#previewModal').modal('show');
})

function submitArtifact(){
	// Pause the preview video to stop it playing
	$('#previewVideo').get(0).pause();

	swal({
		title: "Are you sure?",
		text: "You will not be able to change this later! Please make sure everything is correct!",
		type: "warning",
		showCancelButton: true,
		confirmButtonClass: "btn-success",
		confirmButtonText: "Yes, publish it!",
		closeOnConfirm: true
	},
	function(){
		window.onbeforeunload = function() {
			return "You are currently publishing, are you sure you want to navigate away?";
		}
		
		var $active = $('.wizard .nav-tabs li.active');
		$active.next().removeClass('disabled');
		nextTab($active);
		publishArtifact();
	});
}

function addFilesToIPFS(files, count, callback){
	// Check if files is null.
	if (!files)
		return;

	// Since we are not null, add the files to IPFS
	ipfs.add(files, function (err, hash) {
		if (err || !hash){
			console.error("Error adding files to IPFS, please try again later.")
			callback('', null);
			return;
		}
		document.getElementById('publishWell').innerHTML += "<br />Hash Results: " + JSON.stringify(hash, null, 4) + "<br /";
		document.getElementById('publishWell').innerHTML += "<br />File count: " + count + "<br />";
		document.getElementById('publishWell').innerHTML += "Hashes: " + hash.length + "<br />";
		callback(hash, count);
		return;
	}, function(evt){
		// Progress function
		if (evt.lengthComputable){
			var progress = Math.ceil(((evt.loaded) / evt.total) * 100);
			$('#progressBar').css('width', progress + '%');
			$('#progressBar').html(progress + '%');
		}
	});
}

function publishArtifact(){
	var mediaType = "#" + $("#metainfo div.active").attr('id');
	var poster = $(mediaType + "PosterFile").prop('files');
	// mediaFiles and extraFiles are defined in dropzone.js

	// count will store the current readable index, total the total amount of files.
	var count = 0;
	var total = 0;

	// Holds all of the files as you push them in.
	var ipfsFiles = [];

	if (poster.length > 0)
		total += poster.length;
	if (mediaFiles.length > 0)
		total += mediaFiles.length;
	if (extraFiles.length > 0)
		total += extraFiles.length;

	function addFile(file, index){
		document.getElementById('publishWell').innerHTML += "[IPFS] Adding " + count + " files to IPFS...</br>";
		console.info(file);
		console.log(index);
		/*
		for (var i = 0; i < index-1; i++) {
			document.getElementById('publishWell').innerHTML += "File: " + JSON.stringify(file[i], null, 4) + "<br /";
		}
		*/		
  		addFilesToIPFS(file, index, function(hash, callIndex){ 
  			if (hash == ""){
  				// OstlerDev - Disable & reroute (4/2/17)
				/*swal({
					title: "Something went wrong.",
					text: "There was an error publishing the files to IPFS. Please try again later or contact us on our Slack: http://dloaslack.bitspill.net/",
					type: "error",
					showCancelButton: true,
					confirmButtonClass: "btn-success",
					confirmButtonText: "Try again!",
					closeOnConfirm: true
				},
				function(){
					// Log the error
		  			document.getElementById('publishWell').innerHTML += "<br />[IPFS] Error adding files. Trying again ...</br>";
					// Try to publish again
					publishArtifact();
				});
 				return false;*/

 				// Instead of the old fail method, we set the hash to a special value, then send it through. This allows us to generate the JSON while preventing it being published into the blockchain.
 				var uploadFailure = [ { Name: 'ipfs-upload-failure', Hash: 'ipfs-upload-failure' } ];
 				allFilesAddedToIPFS(uploadFailure);
  			}
  			var hashes = "";
  			var hashArray = [];
  			for (var i = 0; i < hash.length-1; i++) {
  				// Build the new hashes
  				if (hash[i].Hash){
  					hashes += "\"" + hash[i].Name + "\", ";
  					hashArray.push(hash[i]);
  				}
  			}
  			document.getElementById('publishWell').innerHTML += "[IPFS] Files added to IPFS: " + hashes + "</br>";

  			allFilesAddedToIPFS(hash);
		});
	}

	// Add the poster file. We are safe to assume 0 as there is only one index.
	if (poster.length > 0){
  		ipfsFiles[count] = poster[0];
  		count++;
	}

	// Add all media files.
	if (mediaFiles.length > 0){
		for (var i = 0; i < mediaFiles.length; i++) {
  			ipfsFiles[count] = mediaFiles[i];
			count++;
		}
	}

	// Add all extra files.
	if (extraFiles.length > 0){
		for (var i = 0; i < extraFiles.length; i++) {
	  		ipfsFiles[count] = extraFiles[i];
			count++;
		}
	}
	addFile(ipfsFiles, count);

	// This function will be called once all files have been added
	function allFilesAddedToIPFS(hashes){
		document.getElementById('publishWell').innerHTML += "All files added to IPFS, publishing artifact...</br>";

		// Select media type based off of pill nav
		var mediaType = "#" + $("#metainfo div.active").attr('id');

		// Load the selected and only keep the address that is inside the parens.
		var walletAddress = '';
		for (var addr in wallet.addresses){
			if ($("#publisherSelect").val().includes(addr))
				walletAddress = addr;
		}
		var title = $(mediaType + ' #title').val();
		var description = $(mediaType + ' #description').val();
		var year = parseInt($(mediaType + ' #releaseDate').val());
		var bitcoinAddress = $('#bitcoinAddress').val();

		// Info calc
		var totMinPlay = 0;
		var totSugBuy = 0;

		var mainHashIndex = 0;
		if (!isBlank($(mediaType + 'PosterFile').val()))
			mainHashIndex = 1;

		console.info(hashes);
		console.log(mainHashIndex);

		// Catch the mainHashIndex error and try again.
		if (!hashes[mainHashIndex]){
			// Log the error
  			document.getElementById('publishWell').innerHTML += "<br />[IPFS] Error adding files. Trying again ...</br>";
			setTimeout(function(){
				// Try to publish again
				publishArtifact();
			}, 1000);
			return false;

			// Check if it is a failure.
/*			if (hashes[0].Hash == 'ipfs-upload-failure')
				mainHashIndex = 0;
*/
		}

		var alexandriaMedia = {
				"publisher": walletAddress,
				"timestamp":parseInt(Date.now().toString().slice(0, -3)), 
				"type": mediaType.replace('#',''),
				"info": {
					"title": title,
					"description": description,
					"year": year,
					"extraInfo": {
					}
				},
				"payment": {
					"fiat": "USD", // Hardcode USD, unknown if is needed yet.
					"scale": "1000:1",
					"sugTip": [
					1,2,3],
					"tokens": {
					},
					"addresses": [{
						"token":"BTC",
						"address":bitcoinAddress						
					}]
				},				
				"storage": {
					"network": "IPFS",
					"location": hashes[hashes.length-1].Hash,
					"files": []
				
		}
		};

		// If item is not blank, then add it, otherwise just continue as these are all optional.
//		if (!isBlank(bitcoinAddress))
//			alexandriaMedia["payment"]["addresses"]["address"] = bitcoinAddress;

		// Optional Fields
		var poster = $(mediaType + 'PosterFile').val();
		var genre = $(mediaType + ' #genre').val();
		var tags = $(mediaType + ' #tags').val();
		// Check if the tags are set, if they are, then set them.
		if (!isBlank(tags))
			alexandriaMedia["info"]["extraInfo"]["tags"] = tags;
		// Check if the genre is set, if it is, set it.
		if (!isBlank(genre))
				alexandriaMedia["info"]["extraInfo"]["genre"] = genre;

		// Metadata per artifact type
		if (mediaType == '#music'){
			//################################
			//            MUSIC
			//################################
			var artistName = $(mediaType + ' #artistName').val();
			var recordLabel = $(mediaType + ' #recordLabel').val();

			if (!isBlank(artistName))
				alexandriaMedia["info"]["extraInfo"]["artist"] = artistName;

			if (!isBlank(recordLabel))
				alexandriaMedia["info"]["extraInfo"]["company"] = recordLabel;
		} else if (mediaType == '#video'){
			//################################
			//            VIDEO
			//################################
			var director = $(mediaType + ' #directorName').val();
			var distributor = $(mediaType + ' #distributor').val();	

			if (!isBlank(director))
				alexandriaMedia["info"]["extraInfo"]["artist"] = director;

			if (!isBlank(distributor))
				alexandriaMedia["info"]["extraInfo"]["company"] = distributor;
		} else if (mediaType == '#podcast'){
			//################################
			//            PODCAST
			//################################
			var episodeTitle = $(mediaType + ' #directorName').val();
			var seasonNum = $(mediaType + ' #distributor').val();	
			var episodeNum = $(mediaType + ' #distributor').val();	

			if (!isBlank(episodeTitle))
				alexandriaMedia["info"]["extraInfo"]["epTitle"] = episodeTitle;

			if (!isBlank(seasonNum))
				alexandriaMedia["info"]["extraInfo"]["season"] = seasonNum;

			if (!isBlank(episodeNum))
				alexandriaMedia["info"]["extraInfo"]["episode"] = episodeNum;

		} else if (mediaType == '#pdf'){
			//################################
			//              PDF
			//################################
			var authorName = $(mediaType + ' #authorName').val();

			if (!isBlank(authorName))
				alexandriaMedia["info"]["extraInfo"]["author"] = director;
		} else if (mediaType == '#movie'){
			//################################
			//            MOVIE
			//################################
			var director = $(mediaType + ' #directorName').val();
			var distributor = $(mediaType + ' #distributor').val();	

			if (!isBlank(director))
				alexandriaMedia["info"]["extraInfo"]["artist"] = director;

			if (!isBlank(distributor))
				alexandriaMedia["info"]["extraInfo"]["company"] = distributor;
		} else if (mediaType == '#thing'){
			//################################
			//            THING
			//################################
			var creatorName = $(mediaType + ' #creatorName').val();

			if (!isBlank(creatorName))
				alexandriaMedia["info"]["extraInfo"]["creator"] = creatorName;
		} else if (mediaType == '#html'){
			//################################
			//             HTML
			//################################
			var creatorName = $(mediaType + ' #creatorName').val();

			if (!isBlank(creatorName))
				alexandriaMedia["info"]["extraInfo"]["creator"] = creatorName;
		}

		if (!isBlank(mediaFiles)){
			for (var i = 0; i < mediaFiles.length; i++) {
				// Get Display Name from Table
				var displayName = $('#' + sanitizeID(mediaFiles[i].name) + ' #name').val();
				if (displayName == mediaFiles[i].name)
					displayName = "";
				// Get Type from Table
				var type = $('#' + sanitizeID(mediaFiles[i].name) + ' #type').val();
				// Get duration from table
				//var duration = duration.toFixed(0); // Need to un-hardcode this...
				// Get prices from table
				var priceSelector = '#' + sanitizeID(mediaFiles[i].name) + 'price';
				var minPlay = $(priceSelector + ' #minPlay').val();
				var sugPlay = $(priceSelector + ' #sugPlay').val();
				var minBuy = $(priceSelector + ' #minBuy').val();
				var sugBuy = $(priceSelector + ' #sugBuy').val();
				var scale = 1000;
				minPlay = parseInt(minPlay * scale);
				sugPlay = parseInt(sugPlay * scale);
				minBuy = parseInt(minBuy * scale);
				sugBuy = parseInt(sugBuy * scale);
				// Get checkboxes from pricing table
				var disallowPlay = $(priceSelector + ' #disPlay').is(':checked');
				var disallowBuy = $(priceSelector + ' #disBuy').is(':checked');

				var fileJSON = {
					"fname": mediaFiles[i].name,
					"duration": mediaFiles[i].duration,
					"type": mediaType.replace('#','')
				}

				// Set all optional fields
				if (!isBlank(displayName))
					fileJSON['dname'] = displayName

				if (!isBlank(minPlay)){
					fileJSON['minPlay'] = minPlay;
					totMinPlay += parseFloat(minPlay);
				}

				if (!isBlank(sugPlay))
					fileJSON['sugPlay'] = sugPlay;

				if (!isBlank(minBuy))
					fileJSON['minBuy'] = minBuy;

				if (!isBlank(sugBuy)){
					fileJSON['sugBuy'] = sugBuy;
					totSugBuy += parseFloat(sugBuy);
				}

				if (disallowPlay)
					fileJSON['disallowPlay'] = true;

				if (disallowBuy)
					fileJSON['disallowBuy'] = true;

				alexandriaMedia["storage"]["files"].push(fileJSON)
			}
		}

		if (!isBlank(poster)){
			var type = 'preview'
			if (mediaType == '#music'){
				type = 'coverArt';
//				alexandriaMedia["info"]["extraInfo"]["coverArt"] = hashes[0].Name;
			} else if (mediaType == '#video'){
				type = 'preview'
				alexandriaMedia["info"]["extraInfo"]["posterFrame"] = hashes[0].Name;
			} else {
				alexandriaMedia["info"]["extraInfo"]["preview"] = hashes[0].Name;
			}

			alexandriaMedia["storage"]["files"].push({
				"dname": 'Cover Art',
				"fname": hashes[0].Name,
				"type": type
			})
		}

		if (!isBlank(extraFiles)){
			for (var i = 0; i < extraFiles.length; i++) {
				// Get Display Name from Table
				var displayName = $('#' + sanitizeID(extraFiles[i].name) + ' #name').val();
				if (displayName == extraFiles[i].name)
					displayName = "";
				// Get Type from Table
				var type = $('#' + sanitizeID(extraFiles[i].name) + ' #type').val();
				// Get prices from table
				var priceSelector = '#' + sanitizeID(extraFiles[i].name) + 'price';
				var minPlay = $(priceSelector + ' #minPlay').val();
				var sugPlay = $(priceSelector + ' #sugPlay').val();
				var minBuy = $(priceSelector + ' #minBuy').val();
				var sugBuy = $(priceSelector + ' #sugBuy').val();
				// Get checkboxes from pricing table
				var disallowPlay = $(priceSelector + ' #disPlay').is(':checked');
				var disallowBuy = $(priceSelector + ' #disBuy').is(':checked');

				var fileJSON = {
					"fname": extraFiles[i].name,
					"type": type
				}

				// Set all optional fields
				if (!isBlank(displayName))
					fileJSON['dname'] = displayName

				if (!isBlank(minPlay)){
					fileJSON['minPlay'] = minPlay;
					totMinPlay += parseFloat(minPlay);
				}

				if (!isBlank(sugPlay))
					fileJSON['sugPlay'] = sugPlay;

				if (!isBlank(minBuy))
					fileJSON['minBuy'] = minBuy;

				if (!isBlank(sugBuy)){
					fileJSON['sugBuy'] = sugBuy;
					totSugBuy += parseFloat(sugBuy);
				}

				if (disallowPlay)
					fileJSON['disallowPlay'] = true;

				if (disallowBuy)
					fileJSON['disallowBuy'] = true;

				alexandriaMedia["storage"]["files"].push(fileJSON)
			}
		}

		function LibraryDCallback(err, data){
			if (err != null){
				swal("Error!", "There was an error publishing your artifact: " + err, "error");
			} else {
				document.getElementById('publishWell').innerHTML += "Successfully published artifact! <br>";
				console.info(data);
				window.onbeforeunload = function() {}
				swal({
				  title: "Success!",
				  text: "Your artifact was published successfully! It should take around two minutes to show up on the Media Browser depending on Florincoin block times.",
				  type: "success",
				  showCancelButton: false,
				  confirmButtonClass: "btn-success",
				  confirmButtonText: "Ok",
				  closeOnConfirm: true
				},
				function(){
					// Redirect to browser :)
				  	//window.location.replace("http://alexandria.io/browser/");
				  	resetPublisher();

				  	AppendOneArtifact([data], 0);
				  	$('#wizard').hide();
					$('#artifacts').show();
				});
			}
		}

		if (hashes[0].Hash == "ipfs-upload-failure"){
			PubLS.addArtifact(alexandriaMedia.timestamp, alexandriaMedia, "ipfs-upload-failure");
			swal("Error!", "There was an error uploading your files, please try again later...", "error");
			return false;
		}

		document.getElementById('publishWell').innerHTML += '<pre>' + JSON.stringify(alexandriaMedia, null, 4) + "</pre><br>";

		calculateArtifactCost(totMinPlay, totSugBuy, alexandriaMedia, function(data){
			document.getElementById('publishWell').innerHTML += JSON.stringify(data);
			var feeInSatoshi = parseInt(data.response["pubFeeFLO"] * Math.pow(10, 8));

			var walletAddress = '';
			for (var addr in wallet.addresses){
				if ($("#publisherSelect").val().includes(addr))
					walletAddress = addr;
			}
			console.log(walletAddress);
			console.log(wallet.balances[walletAddress]);

			var unspent = 0;

			for (var i = 0; i < wallet.known_unspent.length; i++){
				var unstx = wallet.known_unspent[i];
				unspent += unstx.value;
			}

			console.log(unspent);
			console.log(data.response["pubFeeFLO"]);

			if (wallet.balances[walletAddress] < (data.response["pubFeeFLO"] + 0.0001) && (unspent < (data.response["pubFeeFLO"] + 0.0001))){
				swal({
					title: "Not enough Florincoin",
					text: "You need " + ((data.response["pubFeeFLO"]) - (unspent + wallet.balances[walletAddress])) + " more FLO to publish this artifact.",
					type: "warning",
					showCancelButton: true,
					confirmButtonClass: "btn-success",
					confirmButtonText: "Buy some FLO!",
					closeOnConfirm: true
				},
				function(){
					tradebot(walletAddress, function(){
						// Publish once done!
						LibraryDJS.publishArtifact(wallet, hashes[hashes.length-1].Hash, walletAddress, alexandriaMedia, 100000, LibraryDCallback);
					});
					setTimeout(function(){
						var purchaseAmount = ((data.response["pubFeeFLO"]) - (unspent + wallet.balances[walletAddress])) * marketData.USD;
						console.log(purchaseAmount);
						if  (purchaseAmount < MIN_BUY) {
							purchaseAmount = MIN_BUY;
						}
						console.log(purchaseAmount);
						$("#usdValue").val(purchaseAmount);
						updateUSD();
					}, 1000);
				});
			} else {
				LibraryDJS.publishArtifact(wallet, hashes[hashes.length-1].Hash, walletAddress, alexandriaMedia, 100000, LibraryDCallback);
			}
		})

	}
}

function calculateArtifactCost(totMinPlay, totSugBuy, oipArtifact, callback){
	$.getJSON("https://api.alexandria.io/alexandria/v2/info", function(info){
		$.getJSON("https://api.alexandria.io/flo-market-data/v1/getAll", function(getAll){
			var artCost = (totMinPlay + totSugBuy) / 2;

			function s(x) {return x.charCodeAt(0);}
			var postData = {
				"artCost": artCost,
				"avgArtCost": info.avgArtCost,
				"artSize": JSON.stringify(oipArtifact).split('').map(s).length,
				"floPerKb": 0.01,
				"USDperFLO": parseFloat(getAll.USD)
			}
			console.log(postData);

			$.post('https://api.alexandria.io/alexandria/v2/calcpubfee', JSON.stringify(postData), function(res){
				callback(JSON.parse(res));
			})
		})
	})
}

function resetPublisher(){
	var forms = $('#form').context.forms;
	
	for (var form in forms){
		for (var f in forms[form])
			if (forms[form][f] && forms[form][f].value && forms[form][f].tagName != "SELECT")
				forms[form][f].value = "";
	}

	$('#pricingTable > tbody > tr').each(function(){
		if ($(this).attr('id') != '')
			$(this).remove();
	})

	$('#mediaTable > tr').each(function(){
		if ($(this).hasClass('mediaRow'))
			$(this).remove();
	})

	$('#extraTable > tbody > tr').each(function(){
		if ($(this).attr('id') != '')
			$(this).remove();
	})

	$('#pricing').hide();
	$('#mediaTable').hide();
	$('#extraTable').hide();

	$('#publishWell').html('');

	prevTab($('.wizard .nav-tabs li.active'));
	prevTab($('.wizard .nav-tabs li.active'));
	prevTab($('.wizard .nav-tabs li.active'));
	prevTab($('.wizard .nav-tabs li.active'));
}

function isBlank(str) {
	return (!str || /^\s*$/.test(str));
}

function formatRuntime(runtimeInt) {
	var sec_num = parseInt(runtimeInt, 10); // don't forget the second param
	var hours   = Math.floor(sec_num / 3600);
	var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
	var seconds = sec_num - (hours * 3600) - (minutes * 60);

	if (hours   < 10) {hours   = "0"+hours;}
	if (minutes < 10) {minutes = "0"+minutes;}
	if (seconds < 10) {seconds = "0"+seconds;}

	if (hours == '00')
		var time = minutes+':'+seconds;
	else
		var time = hours+':'+minutes+':'+seconds;

	return time;
}