ipfs.setProvider({host: '46.101.230.105', port: '5001', protocol: 'http'});

$('#previewButton').click(function(e){
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
	if (isBlank($('#releaseDate').val())){
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
	}
	// Optional: Minimum Price to Play
	if (isBlank($('#minPlay').val())){
        $("#minimumPricePer").addClass('has-warning');
	} else {
		$("#minimumPricePer").removeClass('has-warning');
	}
	// Optional: Suggested Price to Purchase
	if (isBlank($('#suggestedBuy').val())){
        $("#suggestedPriceBuy").addClass('has-warning');
	} else {
		$("#suggestedPriceBuy").removeClass('has-warning');
	}
	// Optional: Minimum Price to Purchase
	if (isBlank($('#minBuy').val())){
        $("#minimumPriceBuy").addClass('has-warning');
	} else {
		$("#minimumPriceBuy").removeClass('has-warning');
	}
	// Required: Bitcoin Address
	if (isBlank($('#bitcoinAddress').val())){
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
        var newURL = URL.createObjectURL($('#mediaFiles').prop('files')[0]);
        $('#previewVideo').attr('src', newURL);
    } catch(e) {
        swal('Error', 'You must select a video file.', 'error');
        return;
    }

    $('#previewModal').modal('show');
})

function submitArtifact(){
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
	var mediaFiles = document.getElementById("mediaFiles").files;
	var extraFiles = document.getElementById("extraFiles").files;

	// Get Video Runtime
	var duration = 0;
	window.URL = window.URL || window.webkitURL;
	var video = document.createElement('video');
	  video.preload = 'metadata';
	  video.onloadedmetadata = function() {
	    window.URL.revokeObjectURL(this.src)
	    duration = video.duration;
	    mediaFiles[0].duration = duration;
	    console.log(duration);
	}
	video.src = URL.createObjectURL(mediaFiles[0]);

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
		document.getElementById('publishWell').innerHTML += "[IPFS] Adding " + (count+1) + " files to IPFS...</br>";
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
		var bitcoinAddress = parseInt($('#bitcoinAddress').val());

		var videoHashIndex = 0;
		if (!isBlank($('#posterFile').val()))
			videoHashIndex = 1;

		var alexandriaMedia = {
            "torrent": hashes[hashes.length-1].Hash,
            "publisher": walletAddress,
            "timestamp": Date.now(),
            "type": "video",
            "payment": {
            	"fiat": "USD", // Hardcode USD, unknown if is needed yet.
                "paymentToken": "BTC", // Hardcode BTC, unknown if is needed yet
                "paymentAddress": bitcoinAddress
            },
            "info": {
                "title": title,
                "description": description,
                "year": year,
                "extra-info": {
                	"Bitcoin Address": bitcoinAddress,
                	"DHT Hash": hashes[hashes.length-1].Hash,
                    "filename": hashes[videoHashIndex].Name,
                    "runtime": duration.toFixed(0)
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
        if (!isBlank(director))
        	alexandriaMedia["info"]["extra-info"]["artist"] = director;

        if (!isBlank(distributor))
        	alexandriaMedia["info"]["extra-info"]["company"] = distributor;

        if (!isBlank(poster))
        	alexandriaMedia["info"]["extra-info"]["posterFrame"] = hashes[0].Name;
        /*
        if (!isBlank(suggPricePer))
        	alexandriaMedia["payment"]["suggPlayPrice"] = suggPricePer;

        if (!isBlank(minPricePer))
        	alexandriaMedia["info"].artist = director;
        */

        document.getElementById('publishWell').innerHTML += JSON.stringify(alexandriaMedia) + "<br>";

		LibraryDJS.publishArtifact(wallet, hashes[hashes.length-1].Hash, walletAddress, alexandriaMedia, function(err, data){
			if (err != null){
				swal("Error!", "There was an error publishing your artifact: " + err, "error");
			} else {
				document.getElementById('publishWell').innerHTML += "Successfully published artifact! <br>";
				swal({
				  title: "Success!",
				  text: "Your artifact was published successfully! It may take up to an hour to show up on the Media Browser.",
				  type: "success",
				  showCancelButton: false,
				  confirmButtonClass: "btn-success",
				  confirmButtonText: "Ok",
				  closeOnConfirm: true
				},
				function(){
				  window.location.replace("http://alexandria.io/browser/");
				});
			}
		});
	}
}

function isBlank(str) {
    return (!str || /^\s*$/.test(str));
}

function validatePricing(){
	$('#suggestedPlay').val(parseFloat($('#suggestedPlay').val()).toFixed(3));
	if($('#suggestedPlay').val() == "NaN")
		$('#suggestedPlay').val("");
	$('#minPlay').val(parseFloat($('#minPlay').val()).toFixed(3));
	if($('#minPlay').val() == "NaN")
		$('#minPlay').val("");
	$('#suggestedBuy').val(parseFloat($('#suggestedBuy').val()).toFixed(3));
	if($('#suggestedBuy').val() == "NaN")
		$('#suggestedBuy').val("");
	$('#minBuy').val(parseFloat($('#minBuy').val()).toFixed(3));
	if($('#minBuy').val() == "NaN")
		$('#minBuy').val("");
}