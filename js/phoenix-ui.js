// At the top we define all of our variables used below that link to our UI. This uses regular html selectors currently, not jQuery selectors.
var x = document.getElementById('id');
var pubNameElement = document.getElementById('pub-name');
var walletBalanceElement = document.getElementById('walletBalance');
var walletBalanceUSDElement = document.getElementById('walletBalanceUSD');
var publisherSelectElement = document.getElementById('publisherSelect');
var walletIdentifierElement = document.getElementById('identifier');
var walletAccordianElement = document.getElementById('walletAccordian');
var metaTitleElement = document.getElementById('metaTitle');
var metaFormElement = document.getElementById('metaForm');
var posterElement = document.getElementById('poster');
var posterTitleElement = document.getElementById('posterTitle');
var posterFileSelectElement = document.getElementById('posterFile');
var typeCirclesElement = document.getElementById('typeCircles');
var subtypePillsElement = document.getElementById('subtypePills');
var posterElement = document.getElementById('poster');
var posterFileElement = document.getElementById('posterFile');
var publishFeeElement = document.getElementById('publishFee');
var paymentAddressesElement = document.getElementById('paymentAddresses');
var pleaseAddFileElement = document.getElementById('pleaseAddFile');

// Accepts a set of Selectors to load the artifact into view. Generates code for all of the different sections to fill it.
PhoenixEvents.on("onError", function(msg){ console.log(msg.message) });
PhoenixEvents.on("onLogin", function(msg){ console.log("Logging in"); })
PhoenixEvents.on("onLoginFail", function(msg){ console.log("Login Failed"); })
PhoenixEvents.on("onLoginSuccess", function(msg){ console.log("Login Success"); })
PhoenixEvents.on("onArtifactDeactivateSuccess", function(msg,txid){ 
	console.log("Artifact Deactivation Success",msg); 
	$('#' + txid).remove();
	swal("Success!", "Deactivation Successful!", "success")
})
PhoenixEvents.on("onArtifactDeactivateFail", function(msg){ 
	console.log("Artifact Deactivation Failure",msg); 
	swal("Error", "Deactivation not Successful!", "error");
})
PhoenixEvents.on("onPublisherLoadSuccess", function(publishers){ 
	console.log("Publishers loaded successfully", publishers); 

	// Clear out the element
	publisherSelectElement.innerHTML = '';

	// Set the publisher name
	if (publishers[0])
		pubNameElement.innerHTML = publishers[0].name;

	// Loop through publishers to add each one to the select list
	for (var pub in publishers) {
		var option = document.createElement("option");
		option.value = publishers[pub].address;
		option.text = publishers[pub].name + ' (' + publishers[pub].address + ')';
		publisherSelectElement.add(option);
	}

	// If we just have one or less publishers, then there is no reason to show the selector, if there is more then one, then we show it.
	if (publishers.length > 1){
		publisherSelectElement.style.display = 'inline-block';
	} else {
		publisherSelectElement.style.display = 'none';
	}
})
PhoenixEvents.on("onPublisherLoadFailure", function(msg){ console.log(msg); })
PhoenixEvents.on("onArtifactsLoad", function(msg){ 
	console.log("Successfully loaded Artifacts for " + msg.address + ".", msg.results);

	// If we are on the currently selected one, then load in the artifacts to the Artifact page.
	if (publisherSelectElement.value == msg.address){
		// Wipe the artifact table clean
		$("#ArtifactsTable > tbody").empty();

		// Load in all the artifacts to the Table
		for (var i in msg.results){
			if (msg.results[i]['media-data']) {
				var markup = "<tr id='" + msg.results[i].txid + "'>\
								<th scope='row'>" + (1+parseInt(i)) + "</th>\
								<td><code>" + msg.results[i]['media-data']['alexandria-media'].info.title + "</code></td>\
								<td>TXID: <code>.." + msg.results[i].txid.substr(msg.results[i].txid.length - 8) + "</code></td>\
								<td><button onClick='Phoenix.artifactInfo(\"" + msg.results[i].txid + "\");' class='dev btn btn-info'>Info</button> <button onClick='EditArtifact(\"" + msg.results[i].txid + "\");' class='dev btn btn-warning'>Edit</button> <button onClick='Phoenix.deactivateArtifact(\"" + msg.results[i].txid + "\");' class='btn btn-danger'>Deactivate</button></td>\
							</tr>";
				$("#ArtifactsTable > tbody").append(markup);
			} else if (msg.results[i]['oip-041']){
				var markup = "<tr id='" + msg.results[i].txid + "'>\
								<th scope='row'>" + (1+parseInt(i)) + "</th>\
								<td><code>" + msg.results[i]['oip-041'].artifact.info.title + "</code></td>\
								<td>TXID: <code>.." + msg.results[i].txid.substr(msg.results[i].txid.length - 8) + "</code></td>\
								<td><button onClick='ArtifactInfo(\"" + msg.results[i].txid + "\");' class='dev btn btn-info'>Info</button> <button onClick='EditArtifact(\"" + msg.results[i].txid + "\");' class='dev btn btn-warning'>Edit</button> <button onClick='Phoenix.deactivateArtifact(\"" + msg.results[i].txid + "\");' class='btn btn-danger'>Deactivate</button></td>\
							</tr>";
				$("#ArtifactsTable > tbody").append(markup);
			}
		}

		checkEnv();
	}

	doneLoading();
})
PhoenixEvents.on("onWalletLoad", function(wallet){ 
	var totalBalance = wallet.getTotalBalance() || 0;
	try {
		walletBalanceElement.value = totalBalance;
		if (totalBalance < 10000) {
			walletBalanceElement.innerHTML = totalBalance.toFixed(5);
		} else {
			walletBalanceElement.innerHTML = totalBalance.toFixed(3);
		}
	} catch (e) { 
		// Oh well, give up setting balance.
	}

	walletIdentifierElement.innerHTML = wallet.identifier;

	Phoenix.getMarketData(function(data){ 
		marketData = data; 
		perBTC = marketData.USD/marketData.weighted;
		var FLOUSD = marketData.USD;


		var totalWalletBalanceInUSD = (parseFloat(walletBalanceElement.value)*parseFloat(FLOUSD)).toFixed(2);
		walletBalanceUSDElement.innerHTML = '$' + totalWalletBalanceInUSD;
	
		// Wipe the div
		$('#walletAccordian').html("");

		var i = 0;
		for (var addr in Phoenix.wallet.addresses) {
			i = i + 1;
			var address = wallet.addresses[addr].addr;
			var priv = wallet.addresses[addr].priv;
			var balance = wallet.balances[addr];

			// Add the florincoin addresses and balance to the table.
			$('#walletAccordian').append('<div class="card">\
								<a role="button" data-toggle="collapse" data-parent="#walletAccordian" href="#collapse' + i + '" aria-expanded="true" aria-controls="collapse' + i + '">\
									<div class="card-header" role="tab" id="heading' + i + '">\
										<h4 class="card-title">\
											<div style="padding: 0px 30px; color: #000">\
												<span>' + address + '</span><span style="float: right"><span style="color: green">$' + (parseFloat(balance)*parseFloat(FLOUSD)).toFixed(2) + '</span> - ' + balance + ' FLO</span>\
											</div>\
										</h4>\
									</div>\
								</a>\
								<div id="collapse' + i + '" class="collapse" role="tabpanel" aria-labelledby="heading' + i + '">\
									<div class="card-body">\
										<!-- Some HTML design code comes from https://github.com/OutCast3k/coinbin/, you can view the license for this code here: https://github.com/OutCast3k/coinbin/blob/master/LICENSE -->\
										<div class="col-md-12" align="center" style="margin-top: 30px;">\
											<div id="walletQrCode' + i + '" title="florincoin:' + address + '"></div> <br>\
											<div>\
												<span class="walletAddress">' + address + '</span>\
											</div>\
											<br>\
											<div class="container" style="text-align:center; width: 450px;">\
												<ul class="nav nav-pills align-center" role="tablist">\
													<li role="presentation" class="active"><a href="javascript:;" id="walletBalance' + i + '" rel="' + balance + '" style="display: block;">' + balance + ' FLO</a></li>\
													<li role="presentation"><a href="#walletSpend' + i + '" id="walletShowSpend' + i + '"  aria-controls="walletSpend' + i + '" role="pill" data-toggle="pill">Spend</a></li>\
													<li role="presentation"><a id="walletHistory" href="http://florincoin.info/address/' + address + '" target="_blank" data-ytta-id="-">History</a></li>\
													<li role="presentation"><a href="#tradebot" target="" >Buy</a></li>\
													<li role="presentation"><a href="#walletKeys' + i + '" id="walletShowKeys' + i + '"  aria-controls="walletKeys' + i + '" role="pill" data-toggle="pill">Keys</a></li>\
												</ul>\
												<br>\
												<div class="tab-content" style="margin-top: -40px;">\
													<div role="tabpanel" id="walletKeys' + i + '" class="tab-pane">\
														<label>Public Key</label>\
														<input class="form-control pubkey" type="text" readonly="" data-original-title="" title="" value="' + address + '">\
														<label>Private key</label>\
														<div class="input-group">\
															<input id="priv' + i + '" class="form-control privkey" type="password" readonly="" data-original-title="" title="" value="' + priv + '">\
															<span class="input-group-btn">\
																<button class="showKey btn btn-default" onclick="$(\'#priv' + i + '\').clone().attr(\'type\',\'text\').insertAfter(\'#priv' + i + '\').prev().remove();" type="button">Show</button>\
															</span>\
														</div>\
													</div>\
													<div id="walletSpend' + i + '" class="tab-pane active">\
														<div class="row">\
															<div class="form-inline output col-12">\
																<div class="col-8">\
																	<label>Address</label>\
																</div>\
																<div class="col-3">\
																	<label>Amount</label>\
																</div>\
															</div>\
														</div>\
														<div class="row" id="walletSpendTo">\
															<div class="form-horizontal output col-12">\
																<div class="row">\
																	<div class="col-8">\
																		<input type="text" class="form-control addressTo" data-original-title="" title="">\
																	</div>\
																	<div class="col-3">\
																		<input type="text" class="form-control amount" data-original-title="" title="" placeholder="0.00">\
																	</div>\
																	<a href="javascript:;" class="addressAdd" data-ytta-id="-"><span class="glyphicon glyphicon-plus"></span></a>\
																	<br><br>\
																</div>\
															</div>\
														</div>\
														<div class="row">\
															<!--<div class="col-6">\
																<label><abbr title="" data-original-title="the amount to pay in network miner fees - 0.0004 or more recommended for a faster processing time">Transaction Fee</abbr>&nbsp;&nbsp;<a href="https://bitcoinfees.21.co/" target="_blank" data-ytta-id="-"><span class="glyphicon glyphicon-question-sign"></span></a></label>\
																<input type="text" class="form-control txFee" value="0.0004" id="txFee" data-original-title="" title="">\
															</div>-->\
															<!--<div class="col-5">\
																<label><abbr title="" data-original-title="the amount to donate to coinb.in">Donation</abbr></label>\
																<input type="text" class="form-control" value="0.003" id="developerDonation" data-original-title="" title="">\
															</div>-->\
														</div>\
														<br>\
														<div id="walletSendStatus" class="alert alert-danger hidden"></div>\
														<button class="btn btn-primary" type="button" id="walletSendBtn" onclick="sendFromInterface(\'collapse' + i + '\')">Send</button>\
														<button class="btn btn-default" type="button">Reset</button>\
													</div>\
												</div>\
											</div>\
										</div>\
									</div>\
								</div>\
							</div>');

			var walQR = new QRCode("walletQrCode" + i + "");
			var qrStr = 'florincoin:' + address;
			walQR.makeCode(qrStr);
		}
	});
})
PhoenixEvents.on("onWalletUpdate", function(wallet){ console.log("Wallet Updated" + wallet); })

var PhoenixUI = (function(){
	var PhoenixUX = {};

	PhoenixUX.types = [{
		"type": "Audio",
		"icon": "song-icon",
		"subtypes": [{
			"subtype": "Generic",
			"forms": [{
					"id": "title",
					"width": 12,
					"placeholder": "Title"
				},
				{
					"id": "extraInfo.artist",
					"width": 12,
					"placeholder": "Creator Name"
				},
				{
					"id": "extraInfo.genre",
					"width": 6,
					"placeholder": "Genre"
				},
				{
					"id": "year",
					"width": 6,
					"placeholder": "Year"
				},
				{
					"id": "extraInfo.tags",
					"width": 12,
					"placeholder": "Tags"
				},
				{
					"id": "extraInfo.company",
					"width": 12,
					"placeholder": "Company"
				},
				{
					"id": "description",
					"width": 12,
					"placeholder": "Song Description",
					"type": "textarea",
					"row": 3
				}
			],
			"coverArt": {
				"id": "cover-art",
				"class": "cover-art-square"
			}
		},{
			"subtype": "Song",
			"forms": [{
					"id": "title",
					"width": 12,
					"placeholder": "Song Title"
				},
				{
					"id": "extraInfo.artist",
					"width": 12,
					"placeholder": "Song Name"
				},
				{
					"id": "extraInfo.genre",
					"width": 6,
					"placeholder": "Genre"
				},
				{
					"id": "year",
					"width": 6,
					"placeholder": "Year"
				},
				{
					"id": "extraInfo.tags",
					"width": 12,
					"placeholder": "Tags"
				},
				{
					"id": "extraInfo.company",
					"width": 12,
					"placeholder": "Record Label"
				},
				{
					"id": "description",
					"width": 12,
					"placeholder": "Song Description",
					"type": "textarea",
					"row": 3
				}
			],
			"coverArt": {
				"id": "cover-art",
				"class": "cover-art-square"
			}
		},{
			"subtype": "Album",
			"forms": [{
					"id": "title",
					"width": 12,
					"placeholder": "Album Title"
				},
				{
					"id": "extraInfo.artist",
					"width": 12,
					"placeholder": "Artist Name"
				},
				{
					"id": "extraInfo.genre",
					"width": 6,
					"placeholder": "Genre"
				},
				{
					"id": "year",
					"width": 6,
					"placeholder": "Release Year"
				},
				{
					"id": "extraInfo.tags",
					"width": 12,
					"placeholder": "Tags"
				},
				{
					"id": "extraInfo.company",
					"width": 12,
					"placeholder": "Record Label"
				},
				{
					"id": "description",
					"width": 12,
					"placeholder": "Album Description",
					"type": "textarea",
					"row": 3
				}
			],
			"coverArt": {
				"id": "cover-art",
				"class": "cover-art-square"
			}
		},{
			"subtype": "Podcast",
			"forms": [{
					"id": "title",
					"width": 12,
					"placeholder": "Podcast Title",
					"subtext": "This will be auto formatted with \"Podcast Title\": \"Episode Title\""
				},
				{
					"id": "extraInfo.episodeTitle",
					"width": 12,
					"placeholder": "Episode Title",
					"subtext": "This will be auto formatted with \"Podcast Title\": \"Episode Title\""
				},
				{
					"id": "extraInfo.seasonNum",
					"width": 3,
					"placeholder": "Season Number"
				},
				{
					"id": "extraInfo.episodeNum",
					"width": 3,
					"placeholder": "Episode Number"
				},
				{
					"id": "year",
					"width": 3,
					"placeholder": "Release Year"
				},
				{
					"id": "extraInfo.tags",
					"width": 3,
					"placeholder": "Tags"
				},
				{
					"id": "description",
					"width": 12,
					"placeholder": "Episode Description",
					"type": "textarea",
					"row": 3
				}
			],
			"coverArt": {
				"id": "cover-art",
				"class": "cover-art-square"
			}
		}]
	},{
		"type": "Video",
		"icon": "video-icon",
		"subtypes": [{
			"subtype": "Generic",
			"forms": [{
					"id": "title",
					"width": 12,
					"placeholder": "Title"
				},
				{
					"id": "extraInfo.artist",
					"width": 12,
					"placeholder": "Creator"
				},
				{
					"id": "extraInfo.genre",
					"width": 6,
					"placeholder": "Genre"
				},
				{
					"id": "year",
					"width": 6,
					"placeholder": "Release Year"
				},
				{
					"id": "extraInfo.tags",
					"width": 12,
					"placeholder": "Tags"
				},
				{
					"id": "description",
					"width": 12,
					"placeholder": "Description",
					"type": "textarea",
					"row": 3
				}
			],
			"coverArt": {
				"id": "cover-art",
				"class": "cover-art"
			}
		},{
			"subtype": "Video",
			"forms": [{
					"id": "title",
					"width": 12,
					"placeholder": "Video Title"
				},
				{
					"id": "extraInfo.artist",
					"width": 12,
					"placeholder": "Director Name"
				},
				{
					"id": "extraInfo.company",
					"width": 12,
					"placeholder": "Distributor"
				},
				{
					"id": "year",
					"width": 2,
					"placeholder": "Release Year"
				},
				{
					"id": "extraInfo.genre",
					"width": 5,
					"placeholder": "Genre"
				},
				{
					"id": "extraInfo.tags",
					"width": 5,
					"placeholder": "Tags"
				},
				{
					"id": "description",
					"width": 12,
					"placeholder": "Video Description",
					"type": "textarea",
					"row": 3
				}
			],
			"coverArt": {
				"id": "cover-art",
				"text": "Preview Image",
				"class": "cover-art"
			}
		},{
			"subtype": "Movie",
			"forms": [{
					"id": "title",
					"width": 12,
					"placeholder": "Movie Title"
				},
				{
					"id": "extraInfo.artist",
					"width": 12,
					"placeholder": "Director Name"
				},
				{
					"id": "extraInfo.genre",
					"width": 6,
					"placeholder": "Genre"
				},
				{
					"id": "year",
					"width": 6,
					"placeholder": "Release Year"
				},
				{
					"id": "extraInfo.tags",
					"width": 12,
					"placeholder": "Tags"
				},
				{
					"id": "extraInfo.company",
					"width": 12,
					"placeholder": "Distributor"
				},
				{
					"id": "description",
					"width": 12,
					"placeholder": "Movie Description",
					"type": "textarea",
					"row": 3
				}
			],
			"coverArt": {
				"id": "cover-art",
				"text": "Poster",
				"class": "cover-art-poster"
			}
		}]
	},{
		"type": "Image",
		"icon": "image-icon",
		"subtypes": [{
			"subtype": "Generic",
			"forms": [{
					"id": "title",
					"width": 12,
					"placeholder": "Title"
				},
				{
					"id": "extraInfo.artist",
					"width": 12,
					"placeholder": "Creator"
				},
				{
					"id": "extraInfo.genre",
					"width": 6,
					"placeholder": "Genre"
				},
				{
					"id": "year",
					"width": 6,
					"placeholder": "Release Year"
				},
				{
					"id": "extraInfo.tags",
					"width": 12,
					"placeholder": "Tags"
				},
				{
					"id": "description",
					"width": 12,
					"placeholder": "Description",
					"type": "textarea",
					"row": 3
				}
			],
			"coverArt": {
				"id": "cover-art",
				"class": "cover-art"
			}
		}]
	},{
		"type": "Text",
		"icon": "text-icon",
		"subtypes": [{
			"subtype": "Generic",
			"forms": [{
					"id": "title",
					"width": 12,
					"placeholder": "Title"
				},
				{
					"id": "extraInfo.artist",
					"width": 12,
					"placeholder": "Creator"
				},
				{
					"id": "extraInfo.genre",
					"width": 6,
					"placeholder": "Genre"
				},
				{
					"id": "year",
					"width": 6,
					"placeholder": "Release Year"
				},
				{
					"id": "extraInfo.tags",
					"width": 12,
					"placeholder": "Tags"
				},
				{
					"id": "description",
					"width": 12,
					"placeholder": "Description",
					"type": "textarea",
					"row": 3
				}
			],
			"coverArt": {
				"id": "cover-art",
				"class": "cover-art"
			}
		},{
			"subtype": "Book",
			"forms": [{
					"id": "title",
					"width": 12,
					"placeholder": "Book Title"
				},
				{
					"id": "extraInfo.artist",
					"width": 12,
					"placeholder": "Author Name"
				},
				{
					"id": "extraInfo.genre",
					"width": 6,
					"placeholder": "Genre"
				},
				{
					"id": "year",
					"width": 6,
					"placeholder": "Release Year"
				},
				{
					"id": "extraInfo.tags",
					"width": 12,
					"placeholder": "Tags"
				},
				{
					"id": "description",
					"width": 12,
					"placeholder": "Book Description",
					"type": "textarea",
					"row": 3
				}
			],
			"coverArt": {
				"id": "cover-art",
				"class": "cover-art-poster"
			}
		}]
	},{
		"type": "Software",
		"icon": "software-icon",
		"subtypes": [{
			"subtype": "Generic",
			"forms": [{
					"id": "title",
					"width": 12,
					"placeholder": "Title"
				},
				{
					"id": "extraInfo.artist",
					"width": 12,
					"placeholder": "Creator"
				},
				{
					"id": "extraInfo.genre",
					"width": 6,
					"placeholder": "Genre"
				},
				{
					"id": "extraInfo.year",
					"width": 6,
					"placeholder": "Release Year"
				},
				{
					"id": "extraInfo.tags",
					"width": 12,
					"placeholder": "Tags"
				},
				{
					"id": "description",
					"width": 12,
					"placeholder": "Description",
					"type": "textarea",
					"row": 3
				}
			],
			"coverArt": {
				"id": "cover-art",
				"class": "cover-art"
			}
		},{
			"subtype": "3D Thing",
			"forms": [{
					"id": "title",
					"width": 12,
					"placeholder": "Title"
				},
				{
					"id": "extraInfo.artist",
					"width": 12,
					"placeholder": "Creator"
				},
				{
					"id": "extraInfo.genre",
					"width": 6,
					"placeholder": "Genre"
				},
				{
					"id": "year",
					"width": 6,
					"placeholder": "Release Year"
				},
				{
					"id": "extraInfo.tags",
					"width": 12,
					"placeholder": "Tags"
				},
				{
					"id": "description",
					"width": 12,
					"placeholder": "Description",
					"type": "textarea",
					"row": 3
				}
			],
			"coverArt": {
				"id": "cover-art",
				"class": "cover-art"
			}
		}]
	},{
		"type": "Web",
		"icon": "web-icon",
		"subtypes": [{
			"subtype": "HTML",
			"forms": [{
					"id": "title",
					"width": 12,
					"placeholder": "Title"
				},
				{
					"id": "extraInfo.artist",
					"width": 12,
					"placeholder": "Creator"
				},
				{
					"id": "year",
					"width": 3,
					"placeholder": "Release Year"
				},
				{
					"id": "extraInfo.tags",
					"width": 9,
					"placeholder": "Tags"
				},
				{
					"id": "description",
					"width": 12,
					"placeholder": "Description",
					"type": "textarea",
					"row": 3
				}
			],
			"coverArt": {
				"id": "cover-art",
				"text": "Preview Image",
				"class": "cover-art"
			}
		}]
	}];

	PhoenixUX.fileSelectTypes = {
		'Audio': [
			"Song",
			"Album",
			"Single"
		],
		'Video': [
			"Video",
			"Trailer",
			"Movie",
			"TV Show",
			"Episode",
			"Season"
		],
		'Image': [
			"Image",
			"Cover Art",
			"Poster",
			"Preview Image"
		],
		'Text': [
			'Plaintext',
			'PDF',
			'RTF',
			'Document',
			'Book',
			'File'
		],
		'Software': [
			'Source Code',
			'Windows App',
			'Mac App',
			'Linux App',
			'iOS App',
			'Andriod App',
			'Windows Phone App'
		],
		'Web': [
			'HTML',
			'CSS',
			'Javascript',
			'PHP',
			'Python'
		]
	}

	PhoenixUX.fileExtensions = {
		'Audio': [
			"aac",
			"aaif",
			"flac",
			"m4a",
			"m4b",
			"mp3",
			"oog",
			"wav",
			"wma"
		],
		'Video': [
			"webm",
			"mkv",
			"flv",
			"vob",
			"avi",
			"mov",
			"mp4",
			"mpg",
			"mp2",
			"mpeg",
			"m2v",
			"m4v",
			"3gp",
			"flv"
		],
		'Image': [
			"jpeg",
			"jpg",
			"exif",
			"tif",
			"png",
			"gif",
			"bmp"
		],
		'Text': [
			'txt',
			'rtf',
			'pdf'
		],
		'Software': [
			'app',
			'exe',
			'jar'
		],
		'Web': [
			'css',
			'html',
			'js',
			'php',
			'py'
		]
	};

	// IMDB genres
	PhoenixUX.movieGenres = {
		"Action": ["Comedy", "Crime", "Thriller"],
		"Adventure": ["Biography", "Thriller", "War"],
		"Animation": ["Adventure", "Comedy", "Family", "Fantasy"],
		"Biography": ["Crime", "Mystery", "Sport"],
		"Comedy": ["Action", "Horror", "Romance"],
		"Crime": ["Drama", "Mystery", "Romance"],
		"Documentary": ["Biography", "Comedy", "Crime", "History"],
		"Drama": ["Romance", "Film-Noir", "Musical", "War"],
		"Family": ["Adventure", "Comedy", "Fantasy", "Romance"],
		"Fantasy": ["Adventure", "Comedy", "Drama", "Romance"],
		"Film-Noir": ["Crime", "Mystery", "Romance", "Thriller"],
		"History": ["Adventure", "Biography", "Drama", "War"],
		"Horror": ["Comedy", "Drama", "Sci-Fi"],
		"Music": ["Biography", "Documentary", "Drama"],
		"Musical": ["Comedy", "History", "Romance"],
		"Mystery": ["Adventure", "Comedy", "Thriller"],
		"Romance": ["Comedy", "Crime", "History", "Thriller"],
		"Sci-Fi": ["Animation", "Comedy", "Family", "Horror"],
		"Sport": ["Biography", "Comedy", "Documentary"],
		"Thriller": ["Comedy", "Crime", "Horror", "Mystery"],
		"War": ["Action", "Biography", "Comedy", "Documentary"],
		"Western": ["Action", "Adventure", "Comedy"]
	}

	// https://support.google.com/youtube/answer/4594615?hl=en
	PhoenixUX.musicGenres = [
		"Acoustic",
		"Alternative & Punk",
		"Blues",
		"Classical",
		"Country & Folk",
		"Dance & Electronic",
		"Easy Listening",
		"Gospel & Religious",
		"Hip Hop & Rap",
		"Holiday",
		"Instrumental",
		"Jazz",
		"Latin",
		"Metal",
		"Moods",
		"Other",
		"Pop",
		"R&B",
		"Rock",
		"Soundtrack",
		"World"
	];

	// https://support.google.com/youtube/answer/4594615?hl=en
	PhoenixUX.tvGenres = [
		"Action & Adventure",
		"Animation",
		"Beauty & Fashion",
		"Classic TV",
		"Comedy",
		"Documentary",
		"Drama",
		"Entertainment",
		"Family",
		"Food",
		"Gaming",
		"Health & Fitness",
		"Home & Garden",
		"Learning & Education",
		"Nature",
		"News",
		"Reality & Game Shows",
		"Science & Tech",
		"Science Fiction",
		"Soaps",
		"Sports",
		"Travel"
	]

	// Youtube category list
	PhoenixUX.webGenres = [
		"Autos & Vehicles",
		"Film & Animation",
		"Music",
		"Pets & Animals",
		"Sports",
		"Short Movies",
		"Travel & Events",
		"Gaming",
		"Videoblogging",
		"People & Blogs",
		"Comedy",
		"Entertainment",
		"News & Politics",
		"Howto & Style",
		"Education",
		"Science & Technology",
		"Nonprofits & Activism",
		"Movies",
		"Anime/Animation",
		"Action/Adventure",
		"Classics",
		"Comedy",
		"Documentary",
		"Drama",
		"Family",
		"Foreign",
		"Horror",
		"Sci-Fi/Fantasy",
		"Thriller",
		"Shorts",
		"Shows",
		"Trailers"
	]

	PhoenixUX.loadIntoMeta = function(oip041){
		for (var i = 0; i < PhoenixUX.types.length; i++) {
			if (PhoenixUX.types[i].type == type){
				if (PhoenixUX.types[i].subtypes[0]){
					PhoenixUX.updateMetadata(PhoenixUX.types[i].subtypes[0]);
				}
				var typesPillsHTML = '';
				for (var j = 0; j < PhoenixUX.types[i].subtypes.length; j++) {
					typesPillsHTML += '<li id="' + PhoenixUX.types[i].subtypes[j].subtype + '" ' + ( j==0 ? 'class="active"' : '') + ' onclick="PhoenixUI.changeSubtype(\'' + PhoenixUX.types[i].type + ',' + PhoenixUX.types[i].subtypes[j].subtype + '\')"><a href="#' + PhoenixUX.types[i].subtypes[j].subtype + '" data-toggle="tab">' + PhoenixUX.types[i].subtypes[j].subtype + '</a></li>';
				}
				subtypePillsElement.innerHTML = typesPillsHTML;
			}
		}
	}

	PhoenixUX.onPublisherSelectChange = function(elem){
		// Update the publisher name
		for (var i = 0; i < Phoenix.publishers.length; i++) {
			if (Phoenix.publishers[i].address == elem.value)
				pubNameElement.innerHTML = Phoenix.publishers[i].name;
		}
		
		// Redraw the artifacts when the publisher selection changes
		PhoenixEvents.trigger('onArtifactsLoad', {address: elem.value, results: Phoenix.artifacts[elem.value]});
	}

	// This loads the top circles and sub-pills.
	PhoenixUX.loadTypes = function(){
		var typesCircleHTML = '';
		var width = parseInt(12/PhoenixUX.types.length);
		for (var i = 0; i < PhoenixUX.types.length; i++) {
			typesCircleHTML += '<div id="' + PhoenixUX.types[i].type + '" onclick="PhoenixUI.changeType(\'' + PhoenixUX.types[i].type + '\')" class="col-' + width + '"><div id="' + PhoenixUX.types[i].type + '" class="type-circle ' + PhoenixUX.types[i].icon + ( i == 0 ? ' type-circle-active' : '') + '"></div>' + PhoenixUX.types[i].type + '</div>';
		}
		typeCirclesElement.innerHTML = typesCircleHTML;


		if (PhoenixUX.types[0]){
			PhoenixUX.changeType(PhoenixUX.types[0].type);
			if (PhoenixUX.types[0].subtypes[0]){
				PhoenixUX.changeSubtype(PhoenixUX.types[0].type + ',' + PhoenixUX.types[0].subtypes[0].subtype);
			}
		}
			
		// var typesPillsHTML = '';
		// for (var i = 0; i < PhoenixUX.types[0].subtypes.length; i++) {
		// 	typesPillsHTML += '<li id="' + PhoenixUX.types[0].subtypes[i].subtype + '" ' + ( i==0 ? 'class="active"' : '') + ' onclick="PhoenixUI.changeSubtype(\'' + PhoenixUX.types[0].type + ',' + PhoenixUX.types[0].subtypes[i].subtype + '\')"><a href="#' + PhoenixUX.types[0].subtypes[i].subtype + '" data-toggle="tab">' + PhoenixUX.types[0].subtypes[i].subtype + '</a></li>';
		// }
		// subtypePillsElement.innerHTML = typesPillsHTML;
	}

	PhoenixUX.changeType = function(type){
		PhoenixUX.type = type;

		for (var i = 0; i < typeCirclesElement.children.length; i++) {
			typeCirclesElement.children[i].children[0].classList.remove('type-circle-active');

			 if (typeCirclesElement.children[i].id == type)
			 	typeCirclesElement.children[i].children[0].className += ' type-circle-active';
		}

		for (var i = 0; i < PhoenixUX.types.length; i++) {
			if (PhoenixUX.types[i].type == type){
				if (PhoenixUX.types[i].subtypes[0]){
					PhoenixUX.updateMetadata(PhoenixUX.types[i].subtypes[0]);
				}
				var typesPillsHTML = '';
				for (var j = 0; j < PhoenixUX.types[i].subtypes.length; j++) {
					typesPillsHTML += '<li id="' + PhoenixUX.types[i].subtypes[j].subtype + '" ' + ( j==0 ? 'class="active"' : '') + ' onclick="PhoenixUI.changeSubtype(\'' + PhoenixUX.types[i].type + ',' + PhoenixUX.types[i].subtypes[j].subtype + '\')"><a href="#' + PhoenixUX.types[i].subtypes[j].subtype + '" data-toggle="tab">' + PhoenixUX.types[i].subtypes[j].subtype + '</a></li>';
				}
				subtypePillsElement.innerHTML = typesPillsHTML;
			}
		}

		
	}

	PhoenixUX.changeSubtype = function(str){
		var type = str.split(',')[0];
		var subtype = str.split(',')[1];

		PhoenixUX.subtype = subtype;

		for (var i = 0; i < subtypePillsElement.children.length; i++) {
			subtypePillsElement.children[i].classList.remove('active');

			if (subtypePillsElement.children[i].id == subtype){
				subtypePillsElement.children[i].className += ' active';
			}
		}

		for (var i = 0; i < PhoenixUX.types.length; i++) {
			if (type == PhoenixUX.types[i].type){
				for (var j = 0; j < PhoenixUX.types[i].subtypes.length; j++) {
					if (subtype == PhoenixUX.types[i].subtypes[j].subtype){
						PhoenixUX.updateMetadata(PhoenixUX.types[i].subtypes[j]);
					}
				}
			}
				
		}
	}

	PhoenixUX.updateMetadata = function(newType){
		metaTitleElement.innerHTML = newType.subtype + ' Information';

		var formHTML = '';
		for (var i = 0; i < newType.forms.length; i++) {
			formHTML += PhoenixUX.generateFormElement(newType.forms[i]);
		}

		metaFormElement.innerHTML = formHTML;

		// This next line is for `bootstrap-tagsinput.js`
		// Search for and implement any taginputs since we just purged the old stuff.
		$("input[data-role=tagsinput], select[multiple][data-role=tagsinput]").tagsinput();

		posterElement.className = newType.coverArt.class;
		posterTitleElement.innerHTML = newType.coverArt.text ? newType.coverArt.text : 'Cover Art';
	}

	PhoenixUX.generateFormElement = function(formJSON){
		if (formJSON.type == 'textarea'){
			return '<div class="col-' + formJSON.width + ' form-group" id="' + formJSON.id + 'grp">\
				<textarea rows="' + formJSON.rows + '" class="form-control" id="' + formJSON.id + '" placeholder="' + formJSON.placeholder + '"></textarea>\
			</div>';
		} else if (formJSON.id.includes('tags')){
			return '<div class="col-' + formJSON.width + ' form-group" id="' + formJSON.id + 'grp">\
				<input style="float:left" type="' + (formJSON.type ? formJSON.type : 'text') + '" class="form-control" id="' + formJSON.id + '" placeholder="' + formJSON.placeholder + '" data-role="tagsinput">\
			</div>';
		} else {
			return '<div class="col-' + formJSON.width + ' form-group" id="' + formJSON.id + 'grp">\
				<input type="' + (formJSON.type ? formJSON.type : 'text') + '" class="form-control" id="' + formJSON.id + '" placeholder="' + formJSON.placeholder + '">\
			</div>';
		}
		
	}

	PhoenixUX.loadArtifactIntoView = function(artifact){

	}

	PhoenixUX.generateArtifactJSONFromView = function(){

	}

	PhoenixUX.mediaFileSelectHandler = function(files) {
		if (!PhoenixUX.mediaFiles)
			PhoenixUX.mediaFiles = [];

		if (Array.isArray(files)){
			for (var i = 0; i < files.length; i++) {
				files[i].id = PhoenixUX.sanitizeID(files[i].name);

				var ext = files[i].name.split('.').pop();

				var iconURL = '';

				var type = '';
				for (var x in PhoenixUX.fileExtensions){
					for (var i = 0; i < PhoenixUX.fileExtensions[x].length; i++) {
						if (ext == PhoenixUX.fileExtensions[x][i]){
							type = x;
						}
					}
				}

				if (type == 'Audio'){
					iconURL = './assets/svg/beamed-note.svg';
				} else if (type == 'Video'){
					iconURL = './assets/svg/video-camera.svg';
				} else if (type == 'Image'){
					iconURL = './assets/svg/image.svg';
				} else if (type == 'Text'){
					iconURL = './assets/svg/text-document.svg';
				} else if (type == 'Software'){
					iconURL = './assets/svg/code.svg';
				} else if (type == 'Web'){
					iconURL = './assets/svg/browser.svg';
				}

				console.log(ext,type,iconURL);

				PhoenixUX.appendFileToMediaTable(files[i],iconURL);
				PhoenixUX.appendFileToPricingTable(files[i]);

				PhoenixUX.mediaFiles.push(files[i]);
			}
		} else {
			var file = files;

			file.id = PhoenixUX.sanitizeID(file.name);

			var ext = file.name.split('.').pop();

			var iconURL = '';

			var type = '';
			for (var x in PhoenixUX.fileExtensions){
				for (var i = 0; i < PhoenixUX.fileExtensions[x].length; i++) {
					if (ext == PhoenixUX.fileExtensions[x][i]){
						type = x;
					}
				}
			}

			if (type == 'Audio'){
				iconURL = './assets/svg/beamed-note.svg';
			} else if (type == 'Video'){
				iconURL = './assets/svg/video-camera.svg';
			} else if (type == 'Image'){
				iconURL = './assets/svg/image.svg';
			} else if (type == 'Text'){
				iconURL = './assets/svg/text-document.svg';
			} else if (type == 'Software'){
				iconURL = './assets/svg/code.svg';
			} else if (type == 'Web'){
				iconURL = './assets/svg/browser.svg';
			}

			console.log(ext,type,iconURL);

			PhoenixUX.appendFileToMediaTable(file,iconURL);
			PhoenixUX.appendFileToPricingTable(file);

			PhoenixUX.mediaFiles.push(file);
		}
	}

	PhoenixUX.removeMediaFile = function(id){
		if (PhoenixUX.mediaFiles){
			for (var i = 0; i < PhoenixUX.mediaFiles.length; i++){
				if (PhoenixUX.mediaFiles[i].id == id){
					PhoenixUX.mediaFiles.splice(i, 1);
				}
			}
		}

		// Remove from table array
		document.getElementById(id).remove();
		// Remove from price array
		document.getElementById(id + 'price').remove();
	}

	PhoenixUX.appendFileToMediaTable = function(file,iconURL) {
		$('#mediaTable').append('\
			<tr id="' + file.id + '">\
				<td><img class="table-icon" src="' + (iconURL ? iconURL : 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=') + '"></td>\
				<td class="text-left"> <input type="text" class="form-control" name="dispName" placeholder="' + file.name + '" oninput="PhoenixUI.onFileNameInput(this);"></td>\
				<td>' + PhoenixUX.humanFileSize(file.size, true) + '</td>\
				<td style="width: 100%">\
					<div class="row form-control dual-selector">\
						<select class="form-control col-6" id="typeSelect" onchange="PhoenixUI.onMediaSelectChange(this);">\
							<option>Audio</option>\
							<option>Video</option>\
							<option>Image</option>\
							<option>Software</option>\
							<option>Web</option>\
							<option>Text</option>\
						</select>\
						<select class="form-control col-6" id="subtypeSelect" onchange="">\
							<option>Song</option>\
							<option>Album</option>\
							<option>Single</option>\
						</select>\
					</div>\
				</td>\
				<td><button class="btn btn-sm btn-outline-danger" onclick="PhoenixUI.removeMediaFile(\'' + file.id + '\');">x</button></td>\
			</tr>');
	}

	PhoenixUX.appendFileToPricingTable = function(file) {
		$('#pricingTable tr:last').after(
			'<tr id="' + file.id + 'price">' +
				'<td style="width:20%">' + file.name + '</td>' +
				'<td>' +
					'<div class="input-group">' +
						'<div class="input-group-addon">$</div>' +
						'<input type="text" class="price form-control" id="sugPlay" onblur="PhoenixUI.validatePricing(this)" placeholder="0.000">' +
					'</div>' +
				'</td>' +
				'<td>' +
					'<div class="input-group">' +
						'<div class="input-group-addon">$</div>' +
						'<input type="text" class="price form-control" id="minPlay" onblur="PhoenixUI.validatePricing(this)" placeholder="0.000">' +
					'</div>' +
			   '</td>' +
				'<td>' +
					'<div class="input-group">' +
						'<div class="input-group-addon">$</div>' +
						'<input type="text" class="price form-control" id="sugBuy" onblur="PhoenixUI.validatePricing(this)" placeholder="0.000">' +
					'</div>' +
				'</td>' +
				'<td>' +
					'<div class="input-group">' +
						'<div class="input-group-addon">$</div>' +
						'<input type="text" class="price form-control" id="minBuy" onblur="PhoenixUI.validatePricing(this)" placeholder="0.000">' +
					'</div>' +
				'</td>' +
				'<td style="width:15%"><input type="checkbox" id="disPlay" onclick="checkboxToggle(\'' + file.id + '\', \'play\')"> Disallow Play' +
				'<br><input type="checkbox" id="disBuy" onclick="checkboxToggle(\'' + file.id + '\', \'buy\')"> Disallow Buy</td>' +
			'</tr>');

		pleaseAddFileElement.style.display = 'none';
	}

	PhoenixUX.posterFileSelectHandler = function(file) {
		PhoenixUX.posterFile = file;

		if (file){
			var reader = new FileReader();

			reader.onload = function (e) {
				$('#poster').css("background-image", "url('" + e.target.result + "')");
			}

			reader.readAsDataURL(file);
		}
	}

	PhoenixUX.posterFileDragHoverHandler = function(e){
		PhoenixUX.dragSrcEl = this;

		e.preventDefault();
		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.setData('text/html', this.innerHTML);


		return false;
	}

	PhoenixUX.humanFileSize = function(bytes, si) {
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

	PhoenixUX.sanitizeID = function (name){
		return name.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/\s]/gi, '');
	}

	PhoenixUX.checkboxToggle = function(id, checkbox){
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

	PhoenixUX.validatePricing = function(elem){
		elem.value = parseFloat(elem.value).toFixed(3);

		PhoenixUX.pricingElem = elem;

		var checkboxDiv = elem.parentElement.parentElement.parentElement.children[5];

		if (elem.value == 0 || elem.value == 'NaN'){
			elem.value = '';
		} else {
			if (elem.id == 'sugPlay' || elem.id == 'minPlay'){
				checkboxDiv.children[0].checked = false;
			} else if (elem.id == 'sugBuy' || elem.id == 'minBuy'){
				checkboxDiv.children[1].checked = false;
			}
		}

		// Save the pricing that was updated to the mediaPricing element of PhoenixUX
		var mainDivID = elem.parentElement.parentElement.parentElement.id;

		if (!PhoenixUX.mediaPricing){
			PhoenixUX.mediaPricing = {};
		}

		if (!PhoenixUX.mediaPricing[mainDivID]){
			PhoenixUX.mediaPricing[mainDivID] = {};
		}

		PhoenixUX.mediaPricing[mainDivID][elem.id] = elem.value ? elem.value : 0;

		// Update the publish fee
		PhoenixUX.updatePubFee();
	}

	PhoenixUX.updatePubFee = function(){
		var artSize = 528;
		var minPlayArray = [];
		var sugBuyArray = [];

		if (PhoenixUX.mediaPricing){
			for (var media in PhoenixUX.mediaPricing){
				if (PhoenixUX.mediaPricing[media].minPlay){
					minPlayArray.push(parseFloat(PhoenixUX.mediaPricing[media].minPlay));
				}
				if (PhoenixUX.mediaPricing[media].sugBuy){
					sugBuyArray.push(parseFloat(PhoenixUX.mediaPricing[media].sugBuy));
				}
			}
		}

		Phoenix.calculatePublishFee(artSize, minPlayArray, sugBuyArray, function(usd, flo){
			console.log(usd.toFixed(2),flo.toFixed(8));

			publishFeeElement.innerHTML = usd ? '$' + usd.toFixed(2) : "Free!";

			if (usd == 'Infinity'){
				publishFeeElement.innerHTML = "Free!";
			}
		})
	}

	PhoenixUX.onMediaSelectChange = function(elem){
		PhoenixUX.mediaChangeSelect = elem;

		var type = elem.value;
		var secondSelector = elem.parentElement.children[1];

		for (var v in PhoenixUX.fileSelectTypes) {
			if (v == type){
				secondSelector.innerHTML = '';
				var tmpString = '';
				for (var i = 0; i < PhoenixUX.fileSelectTypes[v].length; i++) {
					tmpString += '<option>' + PhoenixUX.fileSelectTypes[v][i] + '</option>';
				}
				secondSelector.innerHTML = tmpString;
			}
		}

		var parent = elem.parentElement.parentElement.parentElement;

		var newIconURL = '';
		if (type == 'Audio'){
			newIconURL = './assets/svg/beamed-note.svg';
		} else if (type == 'Video'){
			newIconURL = './assets/svg/video-camera.svg';
		} else if (type == 'Image'){
			newIconURL = './assets/svg/image.svg';
		} else if (type == 'Text'){
			newIconURL = './assets/svg/text-document.svg';
		} else if (type == 'Software'){
			newIconURL = './assets/svg/code.svg';
		} else if (type == 'Web'){
			newIconURL = './assets/svg/browser.svg';
		}

		var icon = parent.children[0].children[0].src = newIconURL;
	}

	PhoenixUX.addPaymentAddress = function(elem){
		elem.remove();

		var numOfPaymentAddresses = paymentAddressesElement.children.length;

		var content = document.createElement("div");
		content.innerHTML = '\
		<div class="row" id="' + (numOfPaymentAddresses + 1) + '">\
			<div class="input-group col-11" style="margin-bottom: 5px;">\
				<div class="input-group-btn">\
					<button type="button" class="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">\
						<img style="height: 30px" src="./img/Bitcoin.svg">\
					</button>\
					<div class="dropdown-menu">\
						<a style="padding-left:-10px" class="dropdown-item" href="" onclick="PhoenixUI.changePaymentAddressType(this);return false;"><img style="height: 30px" src="./img/Bitcoin.svg"> <span> Bitcoin</span></a>\
						<a style="padding-left:-10px" class="dropdown-item" href="" onclick="PhoenixUI.changePaymentAddressType(this);return false;"><img style="height: 30px" src="./img/FLOflat2.png"> <span> Florincoin</span></a>\
						<a style="padding-left:-10px" class="dropdown-item" href="" onclick="PhoenixUI.changePaymentAddressType(this);return false;"><img style="height: 30px" src="./img/Litecoin.svg"> <span> Litecoin</span></a>\
					</div>\
				</div>\
				<input type="text" class="form-control" oninput="PhoenixUI.onPaymentAddressChange(this);">\
				<span class="input-group-addon">\
					<input type="radio" name="mainAddressRadio">\
				</span>\
			</div>\
			<div class="col-1">\
				<button class="btn btn-outline-success" style="height: 80%; margin-left: -20px; margin-top: 3px;" onclick="PhoenixUI.addPaymentAddress(this);">+</button>\
			</div>\
		</div>';

		paymentAddressesElement.appendChild(content);
	}

	PhoenixUX.changePaymentAddressType = function(elem){
		// Save the changed type into the payment array
		var dropdownImgSrc = elem.children[0].src;

		if (dropdownImgSrc.includes('Bitcoin'))
			dropdownImgSrc = "./img/Bitcoin.svg";
		else if (dropdownImgSrc.includes('FLO'))
			dropdownImgSrc = "./img/FLOflat2.png";
		else if (dropdownImgSrc.includes('Litecoin'))
			dropdownImgSrc = "./img/Litecoin.svg";

		elem.parentElement.parentElement.children[0].children[0].src = dropdownImgSrc;

		// Update the validation state of the input for this element
		PhoenixUX.onPaymentAddressChange(elem.parentElement.parentElement.parentElement.children[1]);

		// Return false to prevent page reload
		return false;
	}

	PhoenixUX.onPaymentAddressChange = function(elem){
		try {
			// Validate the address based on the type of cryptocurrency currently selected
			var typeSelected = elem.parentElement.children[0].children[0].children[0].src;

			if (typeSelected.includes('Bitcoin'))
				typeSelected = 'BTC';
			else if (typeSelected.includes('FLO'))
				typeSelected = 'FLO';
			else if (typeSelected.includes('Litecoin'))
				typeSelected = 'LTC';

			var id = elem.parentElement.parentElement.id;

			var valid = WAValidator.validate(elem.value, typeSelected);
			if(valid){
			    elem.style['border-color'] = '#5cb85c'; // Green outline

			    if (!PhoenixUX.paymentAddresses)
			    	PhoenixUX.paymentAddresses = {};

			    PhoenixUX.paymentAddresses[id] = {currency: typeSelected, address: elem.value};
			} else {
			    elem.style['border-color'] = '#d9534f'; // Red outline

			    if (!PhoenixUX.paymentAddresses)
			    	PhoenixUX.paymentAddresses = {};

			    PhoenixUX.paymentAddresses[id] = {};
			}
		} catch (e) {
			elem.style['border-color'] = '#d9534f';
			return false;
		}
	}

	PhoenixUX.onTipsInput = function(elem){
		var id = elem.id.replace('tip','');

		if (!PhoenixUX.tips)
			PhoenixUX.tips = {};

		if (elem.value == "")
			delete PhoenixUX.tips[id];
		else
			PhoenixUX.tips[id] = elem.value;
	}

	PhoenixUX.onAdvancedInput = function(elem){
		var id = elem.id;

		if (isNaN(elem.value)){
			elem.value = '';
		}

		if (elem.value < 0){
			elem.value = 0;
		}

		if (elem.value > 100){
			elem.value = 100;
		}

		if (!PhoenixUX.advancedPricing)
			PhoenixUX.advancedPricing = {};

		if (elem.value == "")
			delete PhoenixUX.advancedPricing[id];
		else
			PhoenixUX.advancedPricing[id] = elem.value;
	}

	PhoenixUX.onFileNameInput = function(elem){
		var id = elem.parentElement.parentElement.id;

		if (!PhoenixUX.mediaPricing){
			PhoenixUX.mediaPricing = {};
		}

		if (!PhoenixUX.mediaPricing[id]){
			PhoenixUX.mediaPricing[id] = {};
		}

		PhoenixUX.mediaPricing[id].displayName = elem.value;
	}

	return PhoenixUX;
})();

// Initialize
PhoenixUI.loadTypes();

// Handle all of the drag and drop setup
var posterDropzone = new Dropzone("div#poster", { 
	url: '/url',
	createImageThumbnails: false,
	previewTemplate: '<div></div>'
});

posterDropzone.on("addedfile", PhoenixUI.posterFileSelectHandler);

var mediaDropzone = new Dropzone("div#mediaDrop", { 
	url: '/url',
	createImageThumbnails: false,
	previewTemplate: '<div></div>'
});

mediaDropzone.on("addedfile", PhoenixUI.mediaFileSelectHandler);
