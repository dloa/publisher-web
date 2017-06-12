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

// Accepts a set of Selectors to load the artifact into view. Generates code for all of the different sections to fill it.
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
					"id": "artistName",
					"width": 12,
					"placeholder": "Creator Name"
				},
				{
					"id": "genre",
					"width": 6,
					"placeholder": "Genre"
				},
				{
					"id": "releaseDate",
					"width": 6,
					"placeholder": "Year"
				},
				{
					"id": "tags",
					"width": 12,
					"placeholder": "Tags"
				},
				{
					"id": "recordLabel",
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
			"subtype": "Song",
			"forms": [{
					"id": "title",
					"width": 12,
					"placeholder": "Song Title"
				},
				{
					"id": "artistName",
					"width": 12,
					"placeholder": "Song Name"
				},
				{
					"id": "genre",
					"width": 6,
					"placeholder": "Genre"
				},
				{
					"id": "releaseDate",
					"width": 6,
					"placeholder": "Year"
				},
				{
					"id": "tags",
					"width": 12,
					"placeholder": "Tags"
				},
				{
					"id": "recordLabel",
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
					"id": "artistName",
					"width": 12,
					"placeholder": "Artist Name"
				},
				{
					"id": "genre",
					"width": 6,
					"placeholder": "Genre"
				},
				{
					"id": "releaseDate",
					"width": 6,
					"placeholder": "Release Year"
				},
				{
					"id": "tags",
					"width": 12,
					"placeholder": "Tags"
				},
				{
					"id": "recordLabel",
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
					"id": "episodeTitle",
					"width": 12,
					"placeholder": "Episode Title",
					"subtext": "This will be auto formatted with \"Podcast Title\": \"Episode Title\""
				},
				{
					"id": "seasonNum",
					"width": 3,
					"placeholder": "Season Number"
				},
				{
					"id": "episodeNum",
					"width": 3,
					"placeholder": "Episode Number"
				},
				{
					"id": "releaseDate",
					"width": 3,
					"placeholder": "Release Year"
				},
				{
					"id": "tags",
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
					"id": "creatorName",
					"width": 12,
					"placeholder": "Creator"
				},
				{
					"id": "genre",
					"width": 6,
					"placeholder": "Genre"
				},
				{
					"id": "releaseDate",
					"width": 6,
					"placeholder": "Release Year"
				},
				{
					"id": "tags",
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
					"id": "directorName",
					"width": 12,
					"placeholder": "Director Name"
				},
				{
					"id": "distributor",
					"width": 12,
					"placeholder": "Distributor"
				},
				{
					"id": "releaseDate",
					"width": 2,
					"placeholder": "Release Year"
				},
				{
					"id": "genre",
					"width": 5,
					"placeholder": "Genre"
				},
				{
					"id": "tags",
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
					"id": "artistName",
					"width": 12,
					"placeholder": "Director Name"
				},
				{
					"id": "genre",
					"width": 6,
					"placeholder": "Genre"
				},
				{
					"id": "releaseDate",
					"width": 6,
					"placeholder": "Release Year"
				},
				{
					"id": "tags",
					"width": 12,
					"placeholder": "Tags"
				},
				{
					"id": "distributor",
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
					"id": "creatorName",
					"width": 12,
					"placeholder": "Creator"
				},
				{
					"id": "genre",
					"width": 6,
					"placeholder": "Genre"
				},
				{
					"id": "releaseDate",
					"width": 6,
					"placeholder": "Release Year"
				},
				{
					"id": "tags",
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
					"id": "creatorName",
					"width": 12,
					"placeholder": "Creator"
				},
				{
					"id": "genre",
					"width": 6,
					"placeholder": "Genre"
				},
				{
					"id": "releaseDate",
					"width": 6,
					"placeholder": "Release Year"
				},
				{
					"id": "tags",
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
					"id": "authorName",
					"width": 12,
					"placeholder": "Author Name"
				},
				{
					"id": "genre",
					"width": 6,
					"placeholder": "Genre"
				},
				{
					"id": "releaseDate",
					"width": 6,
					"placeholder": "Release Year"
				},
				{
					"id": "tags",
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
					"id": "creatorName",
					"width": 12,
					"placeholder": "Creator"
				},
				{
					"id": "genre",
					"width": 6,
					"placeholder": "Genre"
				},
				{
					"id": "releaseDate",
					"width": 6,
					"placeholder": "Release Year"
				},
				{
					"id": "tags",
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
					"id": "creatorName",
					"width": 12,
					"placeholder": "Creator"
				},
				{
					"id": "genre",
					"width": 6,
					"placeholder": "Genre"
				},
				{
					"id": "releaseDate",
					"width": 6,
					"placeholder": "Release Year"
				},
				{
					"id": "tags",
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
					"id": "creatorName",
					"width": 12,
					"placeholder": "Creator"
				},
				{
					"id": "releaseDate",
					"width": 3,
					"placeholder": "Release Year"
				},
				{
					"id": "tags",
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

		posterElement.className = newType.coverArt.class;
		posterTitleElement.innerHTML = newType.coverArt.text ? newType.coverArt.text : 'Cover Art';
	}

	PhoenixUX.generateFormElement = function(formJSON){
		if (formJSON.type == 'textarea'){
			return '<div class="col-' + formJSON.width + ' form-group" id="' + formJSON.id + 'grp">\
				<textarea rows="' + formJSON.rows + '" class="form-control" id="' + formJSON.id + '" placeholder="' + formJSON.placeholder + '"></textarea>\
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

	return PhoenixUX;
})();

// Initialize
PhoenixUI.loadTypes();
//PhoenixUI.updateMetadata(PhoenixUI.types[1].subtypes[0]);