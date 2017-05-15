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
		url: librarianHost +'/alexandria/v2/search',
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
	if (results[i]['media-data']) {
		var markup = "<tr id='" + results[i].txid + "'>\
						<th scope='row'>" + (1+parseInt(i)) + "</th>\
						<td><code>" + results[i]['media-data']['alexandria-media'].info.title + "</code></td>\
						<td>TXID: <code>.." + results[i].txid.substr(results[i].txid.length - 8) + "</code></td>\
						<td><button onClick='ArtifactInfo(\"" + results[i].txid + "\");' class='dev btn btn-info'>Info</button> <button onClick='EditArtifact(\"" + results[i].txid + "\");' class='dev btn btn-warning'>Edit</button> <button onClick='DeactivateArtifact(\"" + results[i].txid + "\");' class='btn btn-danger'>Deactivate</button></td>\
					</tr>";
		$("#ArtifactsTable > tbody").append(markup);
	}
	checkEnv();
}

function DeactivateArtifact(artifactTxid){
	swal({   
		animation: true,
		title: "Are you sure?",   
		text: "This will remove it from all OIP Libraries!",   
		type: "warning",
		showCancelButton: true,   
		confirmButtonColor: "#f44336",
		confirmButtonText: "Yes, deactivate it!",   
		closeOnConfirm: false 
	}, function(){   
		var results = searchAPI('media', 'txid', artifactTxid);

		if (!results){
			console.error("ERR: No results from API when trying to Deactivate TXID: " + artifactTxid);
			swal("Error", "Deactivation not Successful!", "error");
			return;
		}

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
	});
}

function EditArtifact(artifactTxid){
	$('#wizard').hide();
	$('#artifacts').hide();
	$('#editArtifact').show();
	$('#WalletPage').hide();

	var artifact = searchAPI('media', 'txid', artifactTxid)[0];

	// Test if Alexandria Artifact
	if (artifact['media-data']){
		if (artifact['media-data']['alexandria-media']){
			if (artifact['media-data']['alexandria-media']){
				var type = artifact['media-data']['alexandria-media'].type;
				
				function changeArtifactType(mediaType){
					// Remove all media files when artifact type is changed.
					$('#metainfo-edit .mediaRow').each(function(){
						$(this).find('.btn-danger').click();
					});
					// Change supported files to be uploaded
					// Get type in order to validate files
					if (mediaType == 'evideo'){
						mediaType = 'video/*';
					}
					else if (mediaType == 'emusic'){
						mediaType = 'audio/*';
					}
					else if (mediaType == 'epodcast'){
						mediaType = 'audio/*';
					}
					else if (mediaType == 'ebook'){
						mediaType = 'application/pdf,text/*';
					}
					else if (mediaType == 'emovie'){
						mediaType = 'video/*';
					}
					else if (mediaType == 'ething'){
						mediaType = '*/*';
					}
					else if (mediaType == 'ehtml'){
						mediaType = '*/*';
					}

					$('#metainfo-edit #mediaFiles').attr('accept', mediaType);
				}

				// Set file restrictions
				changeArtifactType(type);

				// Change to tab
				document.getElementById('e' + type + 'btn').click();
				//window.location.href = '#e' + type;

				// Select media type based off of pill nav
				var mediaType = "#e" + type;

				console.log(mediaType);

				// Load the selected and only keep the address that is inside the parens.
				var title = artifact['media-data']['alexandria-media'].info.title;
				$(mediaType + ' #title').val(title);
				var description = artifact['media-data']['alexandria-media'].info.description;
				$(mediaType + ' #description').val(description);
				var year = artifact['media-data']['alexandria-media'].info.year;
				$(mediaType + ' #releaseDate').val(year);
				var bitcoinAddress = $('#ebitcoinAddress').val();

				// Optional Fields
				var poster = $(mediaType + 'PosterFile').val();
				var genre = $(mediaType + ' #genre').val();
				var tags = $(mediaType + ' #tags').val();

				// Metadata per artifact type
				if (mediaType == '#music'){
					//################################
					//            MUSIC
					//################################
					var artistName = $(mediaType + ' #artistName').val();
					var recordLabel = $(mediaType + ' #recordLabel').val();

					if (!isBlank(artistName))
						alexandriaMedia["info"]["extra-info"]["artist"] = artistName;

					if (!isBlank(recordLabel))
						alexandriaMedia["info"]["extra-info"]["company"] = recordLabel;
				} else if (mediaType == '#video'){
					//################################
					//            VIDEO
					//################################
					var director = $(mediaType + ' #directorName').val();
					var distributor = $(mediaType + ' #distributor').val();	

					if (!isBlank(director))
						alexandriaMedia["info"]["extra-info"]["artist"] = director;

					if (!isBlank(distributor))
						alexandriaMedia["info"]["extra-info"]["company"] = distributor;
				} else if (mediaType == '#podcast'){
					//################################
					//            PODCAST
					//################################
					var episodeTitle = $(mediaType + ' #directorName').val();
					var seasonNum = $(mediaType + ' #distributor').val();	
					var episodeNum = $(mediaType + ' #distributor').val();	

					if (!isBlank(episodeTitle))
						alexandriaMedia["info"]["extra-info"]["epTitle"] = episodeTitle;

					if (!isBlank(seasonNum))
						alexandriaMedia["info"]["extra-info"]["season"] = seasonNum;

					if (!isBlank(episodeNum))
						alexandriaMedia["info"]["extra-info"]["episode"] = episodeNum;

				} else if (mediaType == '#pdf'){
					//################################
					//              PDF
					//################################
					var authorName = $(mediaType + ' #authorName').val();

					if (!isBlank(authorName))
						alexandriaMedia["info"]["extra-info"]["author"] = director;
				} else if (mediaType == '#movie'){
					//################################
					//            MOVIE
					//################################
					var director = $(mediaType + ' #directorName').val();
					var distributor = $(mediaType + ' #distributor').val();	

					if (!isBlank(director))
						alexandriaMedia["info"]["extra-info"]["artist"] = director;

					if (!isBlank(distributor))
						alexandriaMedia["info"]["extra-info"]["company"] = distributor;
				} else if (mediaType == '#thing'){
					//################################
					//            THING
					//################################
					var creatorName = $(mediaType + ' #creatorName').val();

					if (!isBlank(creatorName))
						alexandriaMedia["info"]["extra-info"]["creator"] = creatorName;
				} else if (mediaType == '#html'){
					//################################
					//             HTML
					//################################
					var creatorName = $(mediaType + ' #creatorName').val();

					if (!isBlank(creatorName))
						alexandriaMedia["info"]["extra-info"]["creator"] = creatorName;
				}

				console.log(artifact);
			}
		}
	}
}