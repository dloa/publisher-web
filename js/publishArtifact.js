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
        console.log(newURL);
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
        var $active = $('.wizard .nav-tabs li.active');
        $active.next().removeClass('disabled');
        nextTab($active);
        publishArtifact();
    });
}

function addFileToIPFS(file, count, callback){
	// Check if file is null.
	if (!file)
		return;

	// Since we are not null, add the file to IPFS
	ipfs.add(file, function (err, hash) {
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

	// count will store the current readable index, total the total amount of files.
	var count = 1;
	var total = 0;

	// This will hold all the hashes.
	var ipfsFiles = [];

	if (poster.length > 0)
		total += poster.length;
	if (mediaFiles.length > 0)
		total += mediaFiles.length;
	if (extraFiles.length > 0)
		total += extraFiles.length;

	function addFile(file, index){
		document.getElementById('publishWell').innerHTML += "[IPFS] Adding file " + index + "/" + total + " to IPFS...</br>";
  		addFileToIPFS(file, index, function(hash, callIndex){ 
  			document.getElementById('publishWell').innerHTML += "[IPFS] Added file " + callIndex + " to IPFS: " + hash + "</br>";

  			// Save the hash to the array
  			ipfsFiles[callIndex-1] = hash;

  			// Check if all indexes are filled and call a method if it is.
  			if (ipfsFiles.length == total){
  				var allAdded = true;
  				for (var i = 0; i < ipfsFiles.length; i++) {
  					// If an index is not set then set it to false.
  					if (!ipfsFiles[i])
  						allAdded = false;
  					// TODO: Check if there was an error.
  				}
  				// If no indexes were false then add all the files to IPFS.
  				if (allAdded)
  					allFilesAddedToIPFS();
  			}
    	});
	}

	// Add the poster file. We are safe to assume 0 as there is only one index.
	if (poster.length > 0){
  		addFile(poster[0], count);
  		count++;
	}

	// Add all media files.
	if (mediaFiles.length > 0){
		for (var i = 0; i < mediaFiles.length; i++) {
	  		addFile(mediaFiles[i], count);
			count++;
		}
	}

	// Add all extra files.
	if (extraFiles.length > 0){
		for (var i = 0; i < extraFiles.length; i++) {
	  		addFile(extraFiles[i], count);
			count++;
		}
	}

	// This function will be called once all files have been added
	function allFilesAddedToIPFS(){
		document.getElementById('publishWell').innerHTML += "All files added to IPFS, publishing artifact...</br>";

		// TODO: Publish using libraryd-js
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