var mediaFiles = [];
var extraFiles = [];

// getElementById
function $id(id) {
	return document.getElementById(id);
}

//
// output information
function Output(msg) {
	console.log(msg)
}
// call initialization file
if (window.File && window.FileList && window.FileReader) {
	Init();
}

//
// initialize
function Init() {

	var mediaSelect = $id("mediaFiles"),
		musicPosterSelect = $id("musicPosterFile"),
		videoPosterSelect = $id("videoPosterFile"),
		podcastPosterSelect = $id("podcastPosterFile"),
		bookPosterSelect = $id("bookPosterFile"),
		moviePosterSelect = $id("moviePosterFile"),
		thingPosterSelect = $id("thingPosterFile"),
		htmlPosterSelect = $id("htmlPosterFile"),
		extraSelect = $id("extraFiles"),
		mediaDrag = $id("mediaDrop"),
		musicPosterDrag = $id("musicPoster"),
		videoPosterDrag = $id("videoPoster"),
		podcastPosterDrag = $id("podcastPoster"),
		bookPosterDrag = $id("bookPoster"),
		moviePosterDrag = $id("moviePoster"),
		thingPosterDrag = $id("thingPoster"),
		htmlPosterDrag = $id("htmlPoster"),
		extraDrag = $id("extraDrop");

	// file select
	mediaSelect.addEventListener("change", FileSelectHandler, false);
	musicPosterSelect.addEventListener("change", FileSelectHandler, false);
	videoPosterSelect.addEventListener("change", FileSelectHandler, false);
	podcastPosterSelect.addEventListener("change", FileSelectHandler, false);
	bookPosterSelect.addEventListener("change", FileSelectHandler, false);
	moviePosterSelect.addEventListener("change", FileSelectHandler, false);
	thingPosterSelect.addEventListener("change", FileSelectHandler, false);
	htmlPosterSelect.addEventListener("change", FileSelectHandler, false);
	extraSelect.addEventListener("change", FileSelectHandler, false);

	// is XHR2 available?
	var xhr = new XMLHttpRequest();
	if (xhr.upload) {
	
		// media drop
		mediaDrag.addEventListener("dragover", FileDragHover, false);
		mediaDrag.addEventListener("dragleave", FileDragHover, false);
		mediaDrag.addEventListener("drop", FileSelectHandler, false);
		mediaDrag.style.display = "block";

		// extra drop
		extraDrag.addEventListener("dragover", FileDragHover, false);
		extraDrag.addEventListener("dragleave", FileDragHover, false);
		extraDrag.addEventListener("drop", FileSelectHandler, false);
		extraDrag.style.display = "block";

		// music poster drop
		musicPosterDrag.addEventListener("dragover", FileDragHover, false);
		musicPosterDrag.addEventListener("dragleave", FileDragHover, false);
		musicPosterDrag.addEventListener("drop", FileSelectHandler, false);
		musicPosterDrag.style.display = "block";

		// video poster drop
		videoPosterDrag.addEventListener("dragover", FileDragHover, false);
		videoPosterDrag.addEventListener("dragleave", FileDragHover, false);
		videoPosterDrag.addEventListener("drop", FileSelectHandler, false);
		videoPosterDrag.style.display = "block";

		// podcast poster drop
		podcastPosterDrag.addEventListener("dragover", FileDragHover, false);
		podcastPosterDrag.addEventListener("dragleave", FileDragHover, false);
		podcastPosterDrag.addEventListener("drop", FileSelectHandler, false);
		podcastPosterDrag.style.display = "block";

		// book poster drop
		bookPosterDrag.addEventListener("dragover", FileDragHover, false);
		bookPosterDrag.addEventListener("dragleave", FileDragHover, false);
		bookPosterDrag.addEventListener("drop", FileSelectHandler, false);
		bookPosterDrag.style.display = "block";

		// movie poster drop
		moviePosterDrag.addEventListener("dragover", FileDragHover, false);
		moviePosterDrag.addEventListener("dragleave", FileDragHover, false);
		moviePosterDrag.addEventListener("drop", FileSelectHandler, false);
		moviePosterDrag.style.display = "block";

		// thing poster drop
		thingPosterDrag.addEventListener("dragover", FileDragHover, false);
		thingPosterDrag.addEventListener("dragleave", FileDragHover, false);
		thingPosterDrag.addEventListener("drop", FileSelectHandler, false);
		thingPosterDrag.style.display = "block";

		// html poster drop
		htmlPosterDrag.addEventListener("dragover", FileDragHover, false);
		htmlPosterDrag.addEventListener("dragleave", FileDragHover, false);
		htmlPosterDrag.addEventListener("drop", FileSelectHandler, false);
		htmlPosterDrag.style.display = "block";
	} else {
		console.log('XHR2 Unsupported! Unable to function.');
	}

}

// file selection
function FileSelectHandler(e) {
	console.log(e);

	// cancel event and hover styling
	FileDragHover(e);

	// fetch FileList object
	var files = e.target.files || e.dataTransfer.files;

	// Get type in order to validate files
	var mediaType = $("#metainfo div.active").attr('id');

	var mimeType = [mediaType];

	if (mediaType == 'music' || mediaType == 'podcast'){
		mimeType[0] = 'audio';
	}
	else if (mediaType == 'book'){
		mimeType = ['pdf', 'text'];
	}
	else if (mediaType == 'movie'){
		mimeType[0] = 'video';
	}
	else if (mediaType == 'thing' || mediaType == 'html'){
		mimeType[0] = 'any';
	}

	// process all File objects
	for (var i = 0; i < files.length; i++) {
		var f = files[i];
		if (e.target.id == "mediaDrop" || e.target.id == "mediaFiles"){
			// Check if it contains that mime type of files.
			var validFileType = false;
			for (var j = 0; j < mimeType.length; j++) {
				if (mimeType[0] == 'any' || f.type.indexOf(mimeType[j]) > -1)
					validFileType = true;
			}
			if (validFileType)
				ParseMedia(f);
			else
				swal('Error', 'You can only select ' + mediaType + ' files.', 'error');
		} else if (e.target.id == "extraDrop" || e.target.id == "extraFiles"){
			ParseExtra(f);
		} else if (e.target.id.includes('Poster')){
			ParsePoster(f);
		}
	}

}


// file drag hover
function FileDragHover(e) {
	e.stopPropagation();
	e.preventDefault();
	if (e.target.id == 'mediaDrop')
		e.target.className = (e.type == "dragover" ? "upload-area hover" : "upload-area");
	else if (e.target.id == 'extraDrop')
		e.target.className = (e.type == "dragover" ? "upload-area hover" : "upload-area");
	else if (e.target.id == 'musicPoster'){
		e.target.className = (e.type == "dragover" ? "cover-art-square hover" : "cover-art-square");
		console.log(e.target.className);
	} else if (e.target.id == 'videoPoester' || e.target.id == 'podcastPoster' || e.target.id == 'bookPoster' || e.target.id == 'moviePoster' || e.target.id == 'thingPoster' || e.target.id == 'htmlPoster'){
		e.target.className = (e.type == "dragover" ? "cover-art hover" : "cover-art");
		console.log(e.target.className);
	}
}

function ParsePoster(file){
	if (file) {
		var reader = new FileReader();

		var mediaType = $("#metainfo div.active").attr('id');

		reader.onload = function (e) {
			$('#' + mediaType + 'Poster').css("background-image", "url('" + e.target.result + "')");
		}

		reader.readAsDataURL(file);
	}
}

function ParseExtra(file) {
	// Show the two tables by default now that we have a file.
	$('#pricing').show();
	$('#extraTable').show();

	// Add file to array
	extraFiles.push(file);

	console.log(file);
	var tableLength = $('#extraTable tr').length-1;

	$('#extraTable tr:last').after(
		'<tr id="' + file.name.split('.').join('') + '">' +
			'<td>' + tableLength + '</td>' +
			'<td>' + file.name + '</td>' +
			'<td>' +
				'<select class="form-control" id="type">' +
					'<option>Artwork</option>' +
					'<option>Music Video</option>' +
					'<option>Trailer</option>' +
					'<option>Featurette</option>' +
					'<option>Zip File</option>' +
					'<option>License Notes</option>' +
				'</select>' +
			'</td>' +
			'<td><input type="text" class="form-control" id="name" value="' + file.name + '"></td>' +
			'<td><button type="button" class="btn btn-danger btn-sm" onclick="removeRow(\'' + sanitizeID(file.name) + '\')">x</button></td>' +
	   '</tr>');
	AddPricingRow(file);
}

function ParseMedia(file) {
	// Show the two tables by default now that we have some media.
	$('#pricing').show();
	$('#mediaFilesTable').show();

	// Add file to array
	mediaFiles.push(file);

	console.log(file);
	var tableLength = $('#mediaFilesTable tr').length-1;

	$('#mediaFilesTable tr:last').after(
		'<tr class="mediaRow" id="' + sanitizeID(file.name) + '">' +
			'<td>' + tableLength + '</td>' +
			'<td>' + file.name + '</td>' +
			'<td>' + humanFileSize(file.size, true) + '</td>' +
			'<td id="duration">...</td>' +
			'<td><input type="text" class="form-control" id="name" value="' + file.name + '"></td>' +
			'<td><button type="button" class="btn btn-danger btn-sm" onclick="removeRow(\'' + sanitizeID(file.name) + '\')">x</button></td>' +
		'</tr>');

	calculateLength(file);
	AddPricingRow(file);
}

function AddPricingRow(file){
	$('#pricingTable tr:last').after(
	'<tr id="' + sanitizeID(file.name) + 'price">' +
		'<td style="width:20%">' + file.name + '</td>' +
		'<td>' +
			'<div class="input-group">' +
				'<div class="input-group-addon">$</div>' +
				'<input type="text" class="price form-control" id="sugPlay" onblur="validatePricing(\'' + sanitizeID(file.name) + '\')" placeholder="0.000">' +
			'</div>' +
		'</td>' +
		'<td>' +
			'<div class="input-group">' +
				'<div class="input-group-addon">$</div>' +
				'<input type="text" class="price form-control" id="minPlay" onblur="validatePricing(\'' + sanitizeID(file.name) + '\')" placeholder="0.000">' +
			'</div>' +
	   '</td>' +
		'<td>' +
			'<div class="input-group">' +
				'<div class="input-group-addon">$</div>' +
				'<input type="text" class="price form-control" id="sugBuy" onblur="validatePricing(\'' + sanitizeID(file.name) + '\')" placeholder="0.000">' +
			'</div>' +
		'</td>' +
		'<td>' +
			'<div class="input-group">' +
				'<div class="input-group-addon">$</div>' +
				'<input type="text" class="price form-control" id="minBuy" onblur="validatePricing(\'' + sanitizeID(file.name) + '\')" placeholder="0.000">' +
			'</div>' +
		'</td>' +
		'<td style="width:15%"><input type="checkbox" id="disPlay" onclick="checkboxToggle(\'' + sanitizeID(file.name) + '\', \'play\')"> Disallow Play' +
		'<br><input type="checkbox" id="disBuy" onclick="checkboxToggle(\'' + sanitizeID(file.name) + '\', \'buy\')"> Disallow Buy</td>' +
	'</tr>');
}

function humanFileSize(bytes, si) {
	var thresh = si ? 1000 : 1024;
	if(Math.abs(bytes) < thresh) {
		return bytes + ' B';
	}
	var units = si
		? ['kB','MB','GB','TB','PB','EB','ZB','YB']
		: ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];
	var u = -1;
	do {
		bytes /= thresh;
		++u;
	} while(Math.abs(bytes) >= thresh && u < units.length - 1);
	return bytes.toFixed(1)+' '+units[u];
}

function removeRow(name){
	$('#' + name).remove();
	$('#' + name + 'price').remove();

	for (var i = 0; i < mediaFiles.length; i++) {
		if (sanitizeID(mediaFiles[i].name) == name)
			mediaFiles.splice(i, 1);
	}

	for (var i = 0; i < extraFiles.length; i++) {
		if (sanitizeID(extraFiles[i].name) == name)
			extraFiles.splice(i, 1);
	}

	if (mediaFiles.length == 0)
		$('#mediaFilesTable').hide();

	if (extraFiles.length == 0)
		$('#extraTable').hide();

	if (extraFiles.length == 0 && mediaFiles.length == 0)
		$('#pricing').hide();
}

function validatePricing(id){
	// Round to 3 digits
	$('#' + id + 'price #sugPlay').val(parseFloat($('#' + id + 'price #sugPlay').val()).toFixed(3));
	// If it was empty, just replace it to be empty again
	if($('#' + id + 'price #sugPlay').val() == "NaN" || $('#' + id + 'price #sugPlay').val() == 0)
		$('#' + id + 'price #sugPlay').val("");
	// If it was just filled, uncheck the checkbox
	else
		$('#' + id + 'price #disPlay').prop("checked", false);

	$('#' + id + 'price #minPlay').val(parseFloat($('#' + id + 'price #minPlay').val()).toFixed(3));
	if($('#' + id + 'price #minPlay').val() == "NaN" || $('#' + id + 'price #minPlay').val() == 0)
		$('#' + id + 'price #minPlay').val("");
	else
		$('#' + id + 'price #disPlay').prop("checked", false);

	$('#' + id + 'price #sugBuy').val(parseFloat($('#' + id + 'price #sugBuy').val()).toFixed(3));
	if($('#' + id + 'price #sugBuy').val() == "NaN" || $('#' + id + 'price #sugBuy').val() == 0)
		$('#' + id + 'price #sugBuy').val("");
	else
		$('#' + id + 'price #disBuy').prop("checked", false);

	$('#' + id + 'price #minBuy').val(parseFloat($('#' + id + 'price #minBuy').val()).toFixed(3));
	if($('#' + id + 'price #minBuy').val() == "NaN" || $('#' + id + 'price #minBuy').val() == 0)
		$('#' + id + 'price #minBuy').val("");
	else
		$('#' + id + 'price #disBuy').prop("checked", false);
}

function checkboxToggle(id, checkbox){
	// Check if the play button was just toggled, if it was check to make sure that it was toggled on.
	if (checkbox == 'play' && $('#' + id + 'price #disPlay').is(':checked')){
		// Clear the play pricing, this shortens the publisher JSON
		$('#' + id + 'price #sugPlay').val("");
		$('#' + id + 'price #minPlay').val("");
		// Uncheck the buy if it is checked, one of them must be unchecked
		if ($('#' + id + 'price #disBuy').is(':checked'))
			$('#' + id + 'price #disBuy').prop("checked", false);
	}

	// Check if the buy button was just toggled, check to make sure that it was toggled on.
	if (checkbox == 'buy' && $('#' + id + 'price #disBuy').is(':checked')){
		// Clear the play pricing, this shortens the publisher JSON
		$('#' + id + 'price #sugBuy').val("");
		$('#' + id + 'price #minBuy').val("");
		// Uncheck the buy if it is checked, one of them must be unchecked
		if ($('#' + id + 'price #disPlay').is(':checked'))
			$('#' + id + 'price #disPlay').prop("checked", false);
	}
}

function calculateLength(file){
	// Use a timeout of 0 to simulate async
	setTimeout(function(){
		window.URL = window.URL || window.webkitURL;
		var video = document.createElement('video');
		video.preload = 'metadata';
		video.onloadedmetadata = function() {
			window.URL.revokeObjectURL(this.src)
			duration = video.duration;
			console.log(duration);
			mediaFiles[mediaFiles.indexOf(file)].duration = duration;
			$('#' + sanitizeID(file.name) + " #duration").text(formatRuntime(duration.toFixed(0).toString()));
		}
		video.src = window.URL.createObjectURL(file);
	}, 0)
}

function sanitizeID(name){
	return name.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/\s]/gi, '');
}