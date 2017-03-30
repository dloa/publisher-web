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

window.loadArtifacts = function(pubAddress){
	var results = searchAPI('media', 'publisher', pubAddress);

	$("#ArtifactsTable > tbody > tr").remove();

	console.log(results);
	
	for (var i in results){
		AppendOneArtifact(results, i);
	}
}

function newArtifact(){
	$('#wizard').show();
	$('#artifacts').hide();
	$('#editArtifact').hide();
	$('#WalletPage').hide();
}

function AppendOneArtifact(results, i){
	var markup = "<tr id='" + results[i].txid + "'>\
					<th scope='row'>" + (1+parseInt(i)) + "</th>\
					<td><code>" + results[i]['media-data']['alexandria-media'].info.title + "</code></td>\
					<td>TXID: <code>.." + results[i].txid.substr(results[i].txid.length - 8) + "</code></td>\
					<td><button onClick='ArtifactInfo(\"" + results[i].txid + "\");' class='btn btn-info'>Info</button> <button onClick='EditArtifact(\"" + results[i].txid + "\");' class='btn btn-warning'>Edit</button> <button onClick='DeactivateArtifact(\"" + results[i].txid + "\");' class='btn btn-danger'>Deactivate</button></td>\
				</tr>";
	$("#ArtifactsTable > tbody").append(markup);
}

function DeactivateArtifact(artifactTxid){
	var results = searchAPI('media', 'txid', artifactTxid);

	if (!results)
		return;

	LibraryDJS.sendDeactivationMessage(wallet, results[0]["media-data"]["alexandria-media"].publisher, artifactTxid, function(error, response){
		if (error) {
			console.log(error);
			swal("Error", "Deactivation not Successful!", "error");
			return;
		}

		console.log(response);

		$('#' + artifactTxid).remove();

		swal("Success!", "Deactivation Successful!", "success")
	});
}