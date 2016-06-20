ipfs.setProvider({host: '163.172.10.4', port: '5001', protocol: 'http'});

// Set up here so that it is accessable in other methods.
var duration = 0;

$('#previewButton').click(function(e){
	var hasPaymentInfo = false;
	// Validate form.
	// Required: Video Title
	if (isBlank($('#videoTitle').val())){
		swal("Error!", "You must provide a title", "error");
        $("#artifactTitleGroup").addClass('has-error');
        return;
	} else {
		$("#artifactTitleGroup").removeClass('has-error');
	}
	// Optional: Director Name
	if (isBlank($('#directorName').val())){
        $("#artifactDirectorGroup").addClass('has-warning');
	} else {
		$("#artifactDirectorGroup").removeClass('has-warning');
	}
	// Optional: Distributor
	if (isBlank($('#distributor').val())){
        $("#artifactDistributorGroup").addClass('has-warning');
	} else {
		$("#artifactDistributorGroup").removeClass('has-warning');
	}
	// Required: Date
	if (isBlank($('#releaseDate').val()) || isNaN(parseInt($('#releaseDate').val())) || parseInt($('#releaseDate').val()) <= 0){
		swal("Error!", "You must provide a release year", "error");
        $("#artifactDateGroup").addClass('has-error');
        return;
	} else {
		$("#artifactDateGroup").removeClass('has-error');
	}
	// Required: Description
	if (isBlank($('#description').val())){
		swal("Error!", "You must provide a description", "error");
        $("#artifactDescriptionGroup").addClass('has-error');
        return;
	} else {
		$("#artifactDescriptionGroup").removeClass('has-error');
	}
	// Optional: Suggested Price to Play
	if (isBlank($('#suggestedPlay').val())){
        $("#suggestedPricePer").addClass('has-warning');
	} else {
		$("#suggestedPricePer").removeClass('has-warning');
		hasPaymentInfo = true;
	}
	// Optional: Minimum Price to Play
	if (isBlank($('#minPlay').val())){
        $("#minimumPricePer").addClass('has-warning');
	} else {
		$("#minimumPricePer").removeClass('has-warning');
		hasPaymentInfo = true;
	}
	// Optional: Suggested Price to Purchase
	if (isBlank($('#suggestedBuy').val())){
        $("#suggestedPriceBuy").addClass('has-warning');
	} else {
		$("#suggestedPriceBuy").removeClass('has-warning');
		hasPaymentInfo = true;
	}
	// Optional: Minimum Price to Purchase
	if (isBlank($('#minBuy').val())){
        $("#minimumPriceBuy").addClass('has-warning');
	} else {
		$("#minimumPriceBuy").removeClass('has-warning');
		hasPaymentInfo = true;
	}
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
    $('#previewTitle').text($('#videoTitle').val());
    // Set Publisher
    $('#previewArtist').text($('#directorName').val());
    // Set Description
    $('#previewDescription').text($('#description').val());
    // Set Video
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
	    reader.readAsDataURL($('#posterFile').prop('files')[0]);
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
        text: "You will not be able to change this later without deleting it completely!",
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
    	var walletAddress = $("#publisherSelect").val().replace(/[^()](?=([^()]*\([^()]*\))*[^()]*$)/g, '').replace('(', '').replace(')', '');
    	console.log(wallet.balances[walletAddress]);
    	if (wallet.balances[walletAddress] < 1){
    		tradebot(walletAddress);
    		setTimeout(function(){
    			swal("Error!", "You must have at least 1 FLO in your wallet to publish an artifact.", "error");
    		}, 1000);
        	return;
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
        	callback("ERROR: " + err, count);
        	return;
        }
        console.log(hash);
        callback(hash, count);
        return;
    });
}

function publishArtifact(){
	var poster = document.getElementById("posterFile").files;
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
  		addFilesToIPFS(file, index, function(hash, callIndex){ 
  			var hashes = "";
  			for (var i = 0; i < hash.length-1; i++) {
  				hashes += "\"" + hash[i].Name + "\", ";
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

		// Load the selected and only keep the address that is inside the parens.
		var walletAddress = $("#publisherSelect").val().replace(/[^()](?=([^()]*\([^()]*\))*[^()]*$)/g, '').replace('(', '').replace(')', '');
		var title = $('#videoTitle').val();
		var description = $('#description').val();
		var year = parseInt($('#releaseDate').val());
		var bitcoinAddress = $('#bitcoinAddress').val();

		var videoHashIndex = 0;
		if (!isBlank($('#posterFile').val()))
			videoHashIndex = 1;

		var alexandriaMedia = {
            "torrent": hashes[hashes.length-1].Hash,
            "publisher": walletAddress,
            "timestamp": Date.now(),
            "type": "video",
            "payment": {
            	// Commented out because Libraryd hates me :c
            	//"fiat": "USD", // Hardcode USD, unknown if is needed yet.
                //"paymentToken": "BTC", // Hardcode BTC, unknown if is needed yet
                //"paymentAddress": bitcoinAddress
            },
            "info": {
                "title": title,
                "description": description,
                "year": year,
                "extra-info": {
                	"DHT Hash": hashes[hashes.length-1].Hash,
                    "filename": hashes[videoHashIndex].Name,
                    //"runtime": duration.toFixed(0),
                    "files": []
                }
            }
        };

        // Optional Fields
        var director = $('#directorName').val();
        var distributor = $('#distributor').val();
        var poster = $('#posterFile').val();
        var suggPricePer = $('#suggestedPlay').val();
        var minPricePer = $('#minPlay').val();
        var suggPriceBuy = $('#suggestedBuy').val();
        var minPriceBuy = $('#minBuy').val();

        // If item is not blank, then add it, otherwise just continue as these are all optional.
        if (!isBlank(bitcoinAddress))
        	alexandriaMedia["info"]["extra-info"]["Bitcoin Address"] = bitcoinAddress;

        if (!isBlank(director))
        	alexandriaMedia["info"]["extra-info"]["artist"] = director;

        if (!isBlank(distributor))
        	alexandriaMedia["info"]["extra-info"]["company"] = distributor;

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
        		// Get checkboxes from pricing table
        		var disallowPlay = $(priceSelector + ' #disPlay').is(':checked');
        		var disallowBuy = $(priceSelector + ' #disBuy').is(':checked');

        		var fileJSON = {
	        		"fname": mediaFiles[i].name,
	        		//"duration": duration,
	        		"type": 'video'
	        	}

	        	// Set all optional fields
	        	if (!isBlank(displayName))
	        		fileJSON['dname'] = displayName

	        	if (!isBlank(minPlay))
	        		fileJSON['minPlay'] = minPlay;

	        	if (!isBlank(sugPlay))
	        		fileJSON['sugPlay'] = sugPlay;

	        	if (!isBlank(minBuy))
	        		fileJSON['minBuy'] = minBuy;

	        	if (!isBlank(sugBuy))
	        		fileJSON['sugBuy'] = sugBuy;

	        	if (disallowPlay)
	        		fileJSON['disallowPlay'] = true;

	        	if (disallowBuy)
	        		fileJSON['disallowBuy'] = true;

        		alexandriaMedia["info"]["extra-info"]["files"].push(fileJSON)
        	}
        }

        if (!isBlank(poster)){
        	alexandriaMedia["info"]["extra-info"]["posterFrame"] = hashes[0].Name;
        	alexandriaMedia["info"]["extra-info"]["files"].push({
        		"fname": hashes[0].Name,
        		"type": "preview"
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

	        	if (!isBlank(minPlay))
	        		fileJSON['minPlay'] = minPlay;

	        	if (!isBlank(sugPlay))
	        		fileJSON['sugPlay'] = sugPlay;

	        	if (!isBlank(minBuy))
	        		fileJSON['minBuy'] = minBuy;

	        	if (!isBlank(sugBuy))
	        		fileJSON['sugBuy'] = sugBuy;

	        	if (disallowPlay)
	        		fileJSON['disallowPlay'] = true;

	        	if (disallowBuy)
	        		fileJSON['disallowBuy'] = true;

        		alexandriaMedia["info"]["extra-info"]["files"].push(fileJSON)
        	}
        }


        document.getElementById('publishWell').innerHTML += '<pre>' + JSON.stringify(alexandriaMedia, null, 4) + "</pre><br>";

		LibraryDJS.publishArtifact(wallet, hashes[hashes.length-1].Hash, walletAddress, alexandriaMedia, function(err, data){
			if (err != null){
				swal("Error!", "There was an error publishing your artifact: " + err, "error");
			} else {
				document.getElementById('publishWell').innerHTML += "Successfully published artifact! <br>";
				window.onbeforeunload = function() {
					return "You are currently publishing, are you sure you want to navigate away?";
				}
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
				  	window.location.replace("http://alexandria.io/browser/");
				});
			}
		});
	}
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
    var time    = hours+':'+minutes+':'+seconds;

    return time;
}