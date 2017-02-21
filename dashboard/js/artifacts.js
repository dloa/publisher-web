var librarianHost = "https://api.alexandria.io";


window.searchAPI = function(module, searchOn, searchFor) {
	if ( (searchOn == 'type') && (searchFor.length > 1) ) {
		searchFor = '['+searchFor+']';
	} else {
		searchFor = '"'+searchFor+'"';
	}
	queryString = '{"protocol":"'+ module +'","search-on":"'+ searchOn +'","search-for":'+searchFor+',"search-like": true}';
	var mediaData;
	$.ajax({
		type: "POST",
		//url: librarianHost +'/alexandria/v2/search',
		url: librarianHost +'/alexandria/v1/search',
		data: queryString.toString(),
		success: function (e) {
			mediaData = $.parseJSON(e).response;
		},
		async:   false
	});

	return mediaData;
}

function loadArtifacts(pubAddress){
	var results = searchAPI('media', 'publisher', pubAddress);

	console.log(results);
	
	for (var i in results){
		console.log(results[i]);
	}
}