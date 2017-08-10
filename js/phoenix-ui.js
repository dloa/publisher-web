// At the top we define all of our variables used below that link to our UI. This uses regular html selectors currently, not jQuery selectors.
var x = document.getElementById('id');
var pubNameElement = document.getElementById('pub-name');
var nsfwToggle = document.getElementById('nsfwToggle');
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
var publishSlashElement = document.getElementById('publishSlash');
var publishFeeFLOElement = document.getElementById('publishFeeFLO');
var pubBalanceTooLowElement = document.getElementById('pubBalanceTooLow');
var publishSubmitSectionElement = document.getElementById('publishSubmitSection');
var paymentAddressesElement = document.getElementById('paymentAddresses');
var pricingElement = document.getElementById('pricing');
var subGenreSelectorElement = document.getElementById('subGenreSelector');

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
								<td><button onClick='Phoenix.artifactInfo(\"" + msg.results[i].txid + "\");' class='dev btn btn-info'>Info</button> <button onClick='PhoenixUI.EditArtifact(\"" + msg.results[i].txid + "\");' class='dev btn btn-warning'>Edit</button> <button onClick='Phoenix.deactivateArtifact(\"" + msg.results[i].txid + "\");' class='btn btn-danger'>Deactivate</button></td>\
							</tr>";
				$("#ArtifactsTable > tbody").append(markup);
			} else if (msg.results[i]['oip-041']){
				var markup = "<tr id='" + msg.results[i].txid + "'>\
								<th scope='row'>" + (1+parseInt(i)) + "</th>\
								<td><code>" + msg.results[i]['oip-041'].artifact.info.title + "</code></td>\
								<td>TXID: <code>.." + msg.results[i].txid.substr(msg.results[i].txid.length - 8) + "</code></td>\
								<td><button onClick='ArtifactInfo(\"" + msg.results[i].txid + "\");' class='dev btn btn-info'>Info</button> <button onClick='PhoenixUI.EditArtifact(\"" + msg.results[i].txid + "\");' class='btn btn-warning'>Edit</button> <button onClick='Phoenix.deactivateArtifact(\"" + msg.results[i].txid + "\");' class='btn btn-danger'>Deactivate</button></td>\
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
		"Western": ["Action", "Adventure", "Comedy"],
		 "Other": ["Other"]
	}

	// https://support.google.com/youtube/answer/4594615?hl=en
	PhoenixUX.musicGenres = [
		"Acoustic",
		"Adult",
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
		"World",
		 "Other"
	];

	// https://support.google.com/youtube/answer/4594615?hl=en
	PhoenixUX.tvGenres = [
		"Action & Adventure",
		"Adult",
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
		"Travel",
		 "Other"
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
		"Adult",
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
		"Trailers",
		 "Other"
	]

	// Image Genres similar to http://shutha.org/photo-genres
	PhoenixUX.imageGenres = [
		"Abstract", 
		"Adult", 
		"Animals/Wildlife", 
		"The Arts", 
		"Backgrounds/Textures", 
		"Beauty/Fashion", 
		"Buildings/Landmarks", 
		"Business/Finance", 
		"Celebrities", 
		"Editorial", 
		"Education", 
		"Food and Drink", 
		"Healthcare/Medical", 
		"Holidays", 
		"Illustrations/Clip-Art", 
		"Industrial", 
		"Interiors", 
		"Miscellaneous", 
		"Model Released Only", 
		"Nature", 
		"Objects", 
		"Parks/Outdoor", 
		"People", 
		"Religion", 
		"Science", 
		"Signs/Symbols", 
		"Sports/Recreation", 
		"Technology", 
		"Transportation", 
		"Vectors", 
		"Vintage",
		"Other"
	];
	/*[
		"Creative (Fiction)": [
			"Fashion Studio",
			"Fashion Catalogue",
			"Celebrity and Band",
			"Commercial",
			"Food and Decor",
			"Fine Art",
			"Erotic",
			"Propaganda",,
			"Other"
		],
		"Archival",
		"Architectural",
		"Nature": [
			"Aerial",
			"Landscape",
			"Wildlife",
			"Underwater",
			"Macro",
			"Flora",
			"Other"
		],
		"Life": [
			"Photojournalism",
			"War",
			"Political",
			"News",
			"Documentary",
			"Candid",
			"Travel",
			"Other"
		],
		"Sports": ["Action", "Portraiture", "Adventure", "Other"]
		"Scientific": [
			"Forensic",
			"Microscopic",
			"Telescopic",
			"Medical",
			"Fibreoptic",
			"Satellite",
			"Aerial",
			"Astrophotography",
			"Other"
		],
		"Military": [
			"Documentary",
			"Spy",
			"Satellite",
			"Other"
		],
		"Corporate": [
			"Industrial",
			"Portraiture",
			"Other"
		],
		"Stage and Set": ["Live Music", "Performance", "Other"],
		"Celebrity": ["Red Carpet", "Paparazzi", "Other"],
		"Fashion": ["Ramp", "Other"],
		"Commercial": ["Public Relations", "Other"],
		"Event": ["Wedding", "Graduation", "Funeral", "Cultural", "Right of Passage", "Civil", "Other"],
		"Other": ["Other"]
	]*/

	PhoenixUX.textGenres = {
		"Fiction": [
			"Classic",
			"Crime/Detective",
			"Fable",
			"Fairy Tale",
			"Fan Fiction",
			"Fantasy",
			"Folklore",
			"Historical Fiction",
			"Horror",
			"Humor",
			"Legend",
			"Magical Realism",
			"Meta Fiction",
			"Mystery",
			"Mythology",
			"Mythopoeia",
			"Picture Book",
			"Realistic Fiction",
			"Science Fiction",
			"Short Story",
			"Suspense/Thriller",
			"Tall Tale",
			"Western",
			"Adult",
			"Other"
		],
		"Non Fiction": [
			"Biography",
			"Essay",
			"Owners Manual",
			"Journalism",
			"Lab Report",
			"Memoir",
			"Personal Narrative",
			"Reference",
			"Self-help",
			"Speech",
			"Textbook",
			"Other"
		],
		"Other": ["Other"]
	};

	PhoenixUX.softwareGenres = [
		"Business",
		"Developer Tools",
		"Education",
		"Entertainment",
		"Finance",
		"Games",
		"Graphics & Design",
		"Health & Fitness",
		"Lifestyle",
		"Medical",
		"Music",
		"News",
		"Photography",
		"Productivity",
		"Reference",
		"Social Networking",
		"Sports",
		"Travel",
		"Utilities",
		"Video",
		"Weather",
		"Other"
	]

	PhoenixUX.types = [{
		"type": "Audio",
		"icon": "song-icon",
		"subtypes": [{
			"subtype": "Basic",
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
					"placeholder": "Genre",
					"genres": PhoenixUX.musicGenres
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
					"placeholder": "Genre",
					"genres": PhoenixUX.musicGenres
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
					"placeholder": "Genre",
					"genres": PhoenixUX.musicGenres
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
					"placeholder": "Podcast Name",
					"subtext": "This will be auto formatted with \"Podcast Name\": \"Episode Title\""
				},
				{
					"id": "extraInfo.episodeTitle",
					"width": 12,
					"placeholder": "Episode Title",
					"subtext": "This will be auto formatted with \"Podcast Name\": \"Episode Title\""
				},
				{
					"id": "extraInfo.seasonNum",
					"width": 4,
					"placeholder": "Season Number"
				},
				{
					"id": "extraInfo.episodeNum",
					"width": 4,
					"placeholder": "Episode Number"
				},
				{
					"id": "year",
					"width": 4,
					"placeholder": "Release Year"
				},
				{
					"id": "extraInfo.genre",
					"width": 6,
					"placeholder": "Genre",
					"genres": PhoenixUX.musicGenres
				},
				{
					"id": "extraInfo.tags",
					"width": 6,
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
			"subtype": "Basic",
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
					"placeholder": "Genre",
					"genres": PhoenixUX.webGenres
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
			"subtype": "Series",
			"forms": [{
					"id": "title",
					"width": 12,
					"placeholder": "Series Name",
					"subtext": "This will be auto formatted with \"Series Name\": \"Episode Title\""
				},
				{
					"id": "extraInfo.episodeTitle",
					"width": 12,
					"placeholder": "Episode Title",
					"subtext": "This will be auto formatted with \"Series Name\": \"Episode Title\""
				},
				{
					"id": "extraInfo.seasonNum",
					"width": 4,
					"placeholder": "Season Number"
				},
				{
					"id": "extraInfo.episodeNum",
					"width": 4,
					"placeholder": "Episode Number"
				},
				{
					"id": "year",
					"width": 4,
					"placeholder": "Release Year"
				},
				{
					"id": "extraInfo.genre",
					"width": 6,
					"placeholder": "Genre",
					"genres": PhoenixUX.movieGenres,
					"dualGenreSelector": true
				},
				{
					"id": "extraInfo.tags",
					"width": 6,
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
					"placeholder": "Genre",
					"genres": PhoenixUX.movieGenres,
					"dualGenreSelector": true
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
					"placeholder": "Genre",
					"genres": PhoenixUX.imageGenres
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
					"placeholder": "Genre",
					"genres": PhoenixUX.textGenres,
					"dualGenreSelector": true
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
			"subtype": "PDF",
			"forms": [{
					"id": "title",
					"width": 12,
					"placeholder": "PDF Title"
				},
				{
					"id": "extraInfo.artist",
					"width": 12,
					"placeholder": "Author Name"
				},
				{
					"id": "extraInfo.genre",
					"width": 6,
					"placeholder": "Genre",
					"genres": PhoenixUX.textGenres,
					"dualGenreSelector": true
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
					"placeholder": "PDF Description",
					"type": "textarea",
					"row": 3
				}
			],
			"coverArt": {
				"id": "cover-art",
				"class": "cover-art-poster"
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
					"placeholder": "Genre",
					"genres": PhoenixUX.textGenres,
					"dualGenreSelector": true
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
					"placeholder": "Genre",
					"genres": PhoenixUX.softwareGenres
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
			"Basic",
			"Single Track",
			"Album Track",
			"Album Notes",
			"Music Video",
			"Alternate Track"
		],
		'Video': [
			"Basic",
			"4K",
			{display: "HD 1080p", publish: "HD1080"},
			{display: "HD 720p", publish: "HD720"},
			{display: "SD 480p", publish: "SD480"},
			{display: "LOW 320p", publish: "LOW320"},
			{display: "Mobile 240p", publish: "MOB240"},
			{display: "Feature - 4k", publish: "F-4K"},
			{display: "Feature - HD 1080p", publish: "F-HD1080"},
			{display: "Feature - HD 720p", publish: "F-HD720"},
			{display: "Feature - SD 480p", publish: "F-SD480"},
			{display: "Feature - LOW 320p", publish: "F-LOW320"},
			{display: "Feature - Mobile 240p", publish: "F-MOB240"},
			{display: "Trailer A - 4k", publish: "TA-4K"},
			{display: "Trailer A - HD 1080p", publish: "TA-HD1080"},
			{display: "Trailer A - HD 720p", publish: "TA-HD720"},
			{display: "Trailer A - SD 480p", publish: "TA-SD480"},
			{display: "Trailer A - LOW 320p", publish: "TA-LOW320"},
			{display: "Trailer A - Mobile 240p", publish: "TA-MOB240"},
			{display: "Trailer B - 4k", publish: "TB-4K"},
			{display: "Trailer B - HD 1080p", publish: "TB-HD1080"},
			{display: "Trailer B - HD 720p", publish: "TB-HD720"},
			{display: "Trailer B - SD 480p", publish: "TB-SD480"},
			{display: "Trailer B - LOW 320p", publish: "TB-LOW320"},
			{display: "Trailer B - Mobile 240p", publish: "TB-MOB240"},
			{display: "Trailer C - 4k", publish: "TC-4K"},
			{display: "Trailer C - HD 1080p", publish: "TC-HD1080"},
			{display: "Trailer C - HD 720p", publish: "TC-HD720"},
			{display: "Trailer C - SD 480p", publish: "TC-SD480"},
			{display: "Trailer C - LOW 320p", publish: "TC-LOW320"},
			{display: "Trailer C - Mobile 240p", publish: "TC-MOB240"}
		],
		'Image': [
			"Basic",
			{display: "Cover Art", publish: "cover"},
			{display: "Album Artwork", publish: "album-art"},
			{display: "Artwork Thumbnail", publish: "art-thumb"},
			{display: "Theatrical Poster", publish: "theatrical-poster"},
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
		],
		'Other': [
			'Archive',
			'Other'
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
		],
		'Other': [
			'zip',
			'gz',
			'tar',
			'tgz',
			'rar'
		]
	};

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

		PhoenixUX.subtype = newType.subtype;

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

	PhoenixUX.EditArtifact = function(txid){
		for (var art in Phoenix.artifacts[publisherSelectElement.value]){
			if (Phoenix.artifacts[publisherSelectElement.value][art].txid == txid){
				PhoenixUX.loadIntoPublisher(Phoenix.artifacts[publisherSelectElement.value][art]['oip-041']);
				showWizardPage();
			}
		}
	}

	PhoenixUX.loadIntoPublisher = function(oip041){
		var mainType, subType;

		console.log(oip041);

		if (oip041.artifact.type){
			if (Array.isArray(oip041.artifact.type)){
				mainType = oip041.artifact.type[0];
				subType = oip041.artifact.type[1];
			} else {
				if (oip041.artifact.type == 'thing') {
					mainType = ('Image');
					subType = ('Generic');
				}
			}
		}
		

		console.log(mainType,subType);

		PhoenixUX.changeType(mainType);
		PhoenixUX.changeSubtype(mainType + ',' + subType);

		// Fill in the metadata fields
		for (var i = 0; i < PhoenixUX.types.length; i++) {
			if (PhoenixUX.types[i].type == mainType){
				for (var j = 0; j < PhoenixUX.types[i].subtypes.length; j++) {
					if (PhoenixUX.types[i].subtypes[j].subtype == subType){
						var forms = PhoenixUX.types[i].subtypes[j].forms;

						for (var k = 0; k < forms.length; k++) {
							var location = forms[k].id;
							var value;

							if (location.includes('extraInfo.')){
								location.replace('extraInfo.', '');
								value = oip041.artifact.info.extraInfo[location];
							} else {
								value = oip041.artifact.info[location];
							}

							if (value){
								if (forms[k].id.includes('tags')){
									// ToDo: Load tags
								} else {
									document.getElementById(forms[k].id).value = value;
								}
							}
						}
					}
				}
			}
		}

		// Load the payment info
		var togglePaid = false;
		if (oip041.artifact.payment){
			if (oip041.artifact.payment.addresses){
				togglePaid = true;

				while (paymentAddressesElement.children.length < oip041.artifact.payment.addresses.length){
					PhoenixUX.addPaymentAddress();
				}
				for (var i = 0; i < oip041.artifact.payment.addresses.length; i++) {
					for (var j = 0; j < paymentAddressesElement.children.length; j++) {
						paymentAddressesElement.children[j].children[0].children[1].value = oip041.artifact.payment.addresses[i].address;
					}
				}
			}

			if (oip041.artifact.payment.sugTip){
				togglePaid = true;

				if (Array.isArray(oip041.artifact.payment.sugTip)){
					for (var i = 0; i < oip041.artifact.payment.sugTip.length; i++) {
						document.getElementById('tip' + (i + 1)).value = oip041.artifact.payment.sugTip[i];
					}
				} else {
					// ToDo: Catch else
				}
			}
		}

		if (togglePaid){
			document.getElementById('freeRadioLabel').classList.remove('active');
			document.getElementById('paidRadioLabel').classList.add('active');

			$('#paymentInfo').show();
		} else {
			document.getElementById('freeRadioLabel').classList.add('active');
			document.getElementById('paidRadioLabel').classList.remove('active');

			$('#paymentInfo').hide();
		}

		// Load the file info
		// Disable the file inputs/show warning when editting
	}

	PhoenixUX.generateFormElement = function(formJSON){
		if (formJSON.type == 'textarea'){
			return '<div class="col-' + formJSON.width + ' form-group" id="' + formJSON.id + 'grp">\
				<textarea oninput="PhoenixUI.onMetadataChange(this)" rows="' + formJSON.rows + '" class="form-control" id="' + formJSON.id + '" placeholder="' + formJSON.placeholder + '"></textarea>\
			</div>';
		} else if (formJSON.id.includes('genre')){
			if (formJSON.genres){
				var selectInner = '';
				var first = true;
				var firstSubArray;
				for (var x in formJSON.genres){
					if (first){
						firstSubArray = formJSON.genres[x];
						first = false;
					} 
				}

				// If we are dealing with 2 level genres
				if (Array.isArray(firstSubArray)){
					for (var genre in formJSON.genres){
						selectInner += '<option>' + genre + '</option>';
					}

					var selectInner2 = '';
					for (var genre in firstSubArray){
						selectInner2 += '<option>' + firstSubArray[genre] + '</option>';
					}
					return '<div class="col-' + formJSON.width + ' form-group" id="' + formJSON.id + 'grp">\
						<div class="dual-selector">\
							<select class="form-control" style="width: 50%" id="mainGenreSelector" onchange="PhoenixUI.updateSubGenre(this);">\
								' + selectInner + '\
							</select>\
							<select class="form-control" style="width: 50%" id="subGenreSelector">\
								' + selectInner2 + '\
							</select>\
						</div>\
					</div>'
				} else {
					// else we are dealing with single level.
					for (var genre in formJSON.genres){
						selectInner += '<option>' + formJSON.genres[genre] + '</option>';
					}

					return '<div class="col-' + formJSON.width + ' form-group" id="' + formJSON.id + 'grp">\
						<select class="form-control" id="' + formJSON.id + '">' + selectInner + '</select>\
					</div>';
				}
			} else {
				return '<div class="col-' + formJSON.width + ' form-group" id="' + formJSON.id + 'grp">\
					<input oninput="PhoenixUI.onMetadataChange(this)" type="' + (formJSON.type ? formJSON.type : 'text') + '" class="form-control" id="' + formJSON.id + '" placeholder="' + formJSON.placeholder + '">\
						' + (formJSON.subtext ? '<small class="form-text text-muted text-left">' + formJSON.subtext + '</small>' : '') + '\
				</div>';
			}
			
		} else if (formJSON.id.includes('tags')){
			return '<div class="col-' + formJSON.width + ' form-group" id="' + formJSON.id + 'grp">\
				<input oninput="PhoenixUI.onMetadataChange(this)" style="float:left" type="' + (formJSON.type ? formJSON.type : 'text') + '" class="form-control" id="' + formJSON.id + '" placeholder="' + formJSON.placeholder + '" data-role="tagsinput">\
			</div>';
		} else {
			return '<div class="col-' + formJSON.width + ' form-group" id="' + formJSON.id + 'grp">\
				<input oninput="PhoenixUI.onMetadataChange(this)" type="' + (formJSON.type ? formJSON.type : 'text') + '" class="form-control" id="' + formJSON.id + '" placeholder="' + formJSON.placeholder + '">\
						' + (formJSON.subtext ? '<small class="form-text text-muted text-left">' + formJSON.subtext + '</small>' : '') + '\
			</div>';
		}	
	}

	PhoenixUX.updateSubGenre = function(elem){
		var mainGenre = elem.value;

		for (var i = 0; i < PhoenixUX.types.length; i++) {
			if (PhoenixUX.type == PhoenixUX.types[i].type){
				for (var j = 0; j < PhoenixUX.types[i].subtypes.length; j++) {
					if (PhoenixUX.subtype == PhoenixUX.types[i].subtypes[j].subtype){
						for (var k = 0; k < PhoenixUX.types[i].subtypes[j].forms.length; k++) {
							if (PhoenixUX.types[i].subtypes[j].forms[k].id.includes('genre')){
								if (PhoenixUX.types[i].subtypes[j].forms[k].genres){
									if (PhoenixUX.types[i].subtypes[j].forms[k].genres[mainGenre]){
										var innerHTMLVal = '';
										for (var l = 0; l < PhoenixUX.types[i].subtypes[j].forms[k].genres[mainGenre].length; l++) {
											innerHTMLVal += '<option>' + PhoenixUX.types[i].subtypes[j].forms[k].genres[mainGenre][l] + '</option>';
										}
										var subGenreSelectorElement = document.getElementById('subGenreSelector');
										subGenreSelectorElement.innerHTML = innerHTMLVal;
									}
								}	
							}
						}
					}
				}
			}
		}
	}

	PhoenixUX.loadArtifactIntoView = function(artifact){

	}

	PhoenixUX.publish = function(){
		var json = PhoenixUX.generateArtifactJSONFromView();
		document.getElementById('artJSON').innerHTML = JSON.stringify(json, null, 4);
	}

	PhoenixUX.generateArtifactJSONFromView = function(){
		//var timestamp = ((new Date).getTime() / 1000).toFixed(0);
		var type = PhoenixUX.type;
		var subtype = PhoenixUX.subtype;
		var paid = $('[name="free"]')[1].checked;

		var scale = 1000;

		var artifactJSON = { 
			"artifact":{  
				"type": PhoenixUX.type + "-" + PhoenixUX.subtype,
				"info": { 
					"extraInfo": {}
				},
				"storage": {
					"network": "IPFS",
					"files": []
				},
				"payment": {
					"fiat": "USD",
					"scale": scale + ":1",
					"sugTip": [ ],
					"tokens": { }
				}
			}
		};

		if (nsfwToggle.checked){
			artifactJSON.artifact.info.nsfw = true;
		}

		for (var i = 0; i < PhoenixUX.types.length; i++) {
			if (PhoenixUX.types[i].type == PhoenixUX.type){
				for (var j = 0; j < PhoenixUX.types[i].subtypes.length; j++) {
					if (PhoenixUX.types[i].subtypes[j].subtype == PhoenixUX.subtype){
						var forms = PhoenixUX.types[i].subtypes[j].forms;

						for (var k = 0; k < forms.length; k++) {
							var location = forms[k].id;

							if (forms[k].dualGenreSelector){
								var formValue = document.getElementById('mainGenreSelector').value + ',' + document.getElementById('subGenreSelector').value;
							} else {
								var formValue = document.getElementById(location).value;
							}
							

							if (formValue && formValue != ""){
								if (location.includes('extraInfo.')){
									var subLoc = location.replace('extraInfo.', '');
									
									if (subLoc == 'tags'){
										artifactJSON.artifact.info.extraInfo[subLoc] = formValue.split(',');
									} else {
										artifactJSON.artifact.info.extraInfo[subLoc] = formValue;
									}
								} else {
									artifactJSON.artifact.info[location] = formValue;
								}
							}
						}
					}
				}
			}
		}

		if (PhoenixUX.mediaFiles){
			for (var i = 0; i < PhoenixUX.mediaFiles.length; i++) {
				artifactJSON.artifact.storage.files[i] = {
					"fname": PhoenixUX.mediaFiles[i].name,
					"fsize": PhoenixUX.mediaFiles[i].size
				};

				if (PhoenixUX.mediaPricing){
					for (var pricing in PhoenixUX.mediaPricing){
						var compareStr = PhoenixUX.mediaFiles[i].id + 'price';

						if (compareStr == pricing){
							if (PhoenixUX.mediaPricing[pricing].displayName)
								artifactJSON.artifact.storage.files[i].dname = PhoenixUX.mediaPricing[pricing].displayName;

							if (paid){
								if (PhoenixUX.mediaPricing[pricing].minPlay)
									artifactJSON.artifact.storage.files[i].minPlay = PhoenixUX.mediaPricing[pricing].minPlay;
								
								if (PhoenixUX.mediaPricing[pricing].sugPlay)
									artifactJSON.artifact.storage.files[i].sugPlay = PhoenixUX.mediaPricing[pricing].sugPlay;
								
								if (PhoenixUX.mediaPricing[pricing].minBuy)
									artifactJSON.artifact.storage.files[i].minBuy = PhoenixUX.mediaPricing[pricing].minBuy;
								
								if (PhoenixUX.mediaPricing[pricing].sugBuy)
									artifactJSON.artifact.storage.files[i].sugBuy = PhoenixUX.mediaPricing[pricing].sugBuy;
							}
								

							if (PhoenixUX.mediaPricing[pricing].disBuy)
								artifactJSON.artifact.storage.files[i].disBuy = PhoenixUX.mediaPricing[pricing].disBuy;

							if (PhoenixUX.mediaPricing[pricing].disPlay)
								artifactJSON.artifact.storage.files[i].disPlay = PhoenixUX.mediaPricing[pricing].disPlay;

							if (PhoenixUX.mediaPricing[pricing].type)
								artifactJSON.artifact.storage.files[i].type = PhoenixUX.mediaPricing[pricing].type;

							if (PhoenixUX.mediaPricing[pricing].subtype){
								artifactJSON.artifact.storage.files[i].subtype = PhoenixUX.mediaPricing[pricing].subtype;
							}
						}
					}
				}
			}
		}

		if (PhoenixUX.posterFile){
			var i = artifactJSON.artifact.storage.files.length;

			artifactJSON.artifact.storage.files[i] = {
				"fname": PhoenixUX.posterFile.name,
				"fsize": PhoenixUX.posterFile.size
			};

			if (PhoenixUX.mediaPricing){
				for (var pricing in PhoenixUX.mediaPricing){
					var compareStr = PhoenixUX.posterFile.id + 'price';

					if (compareStr == pricing){
						if (PhoenixUX.mediaPricing[pricing].displayName)
							artifactJSON.artifact.storage.files[i].dname = PhoenixUX.mediaPricing[pricing].displayName;

						if (PhoenixUX.mediaPricing[pricing].type)
							artifactJSON.artifact.storage.files[i].type = "Image";

						if (PhoenixUX.mediaPricing[pricing].subtype){
							artifactJSON.artifact.storage.files[i].subtype = "cover";
						}
					}
				}
			}
		}
			
		if (PhoenixUX.paymentAddresses){
			for (var addr in PhoenixUX.paymentAddresses){
				artifactJSON.artifact.payment.tokens[PhoenixUX.paymentAddresses[addr].currency] = PhoenixUX.paymentAddresses[addr].address;
			}
		}

		if (PhoenixUX.tips){
			var tipArr = [];

			for (var tip in PhoenixUX.tips){
				tipArr.push(parseFloat(PhoenixUX.tips[tip]) * scale);
			}
		}


		return artifactJSON;
	}

	PhoenixUX.mediaFileSelectHandler = function(files, subtypefor) {
		if (!subtypefor){
			subtypefor = "";
		}

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

				if (type == '')
					type = "Other"

				if (subtypefor == "cover")
					type = "Image";

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
				} else if (type == 'Other'){
					iconURL = './assets/svg/bucket.svg';
				}

				var coverArt = (subtypefor == "cover");
				PhoenixUX.appendFileToMediaTable(files[i],iconURL, coverArt);

				PhoenixUX.changeMediaSelect(files[i].id, type, subtypefor);

				if (subtypefor != "cover")
					PhoenixUX.appendFileToPricingTable(files[i]);

				if (subtypefor != "cover")
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

			if (type === '')
				type = "Other"

			if (subtypefor == "cover")
					type = "Image";

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
			} else if (type == 'Other'){
				iconURL = './assets/svg/bucket.svg';
			}

			var coverArt = (subtypefor == "cover");

			PhoenixUX.appendFileToMediaTable(file, iconURL, coverArt);
			PhoenixUX.changeMediaSelect(file.id, type, subtypefor);

			if (subtypefor != "cover")
				PhoenixUX.appendFileToPricingTable(file);

			if (subtypefor != "cover")
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

			if (PhoenixUX.mediaFiles.length === 0){
				pricingElement.style.display = 'none';
			}
		}

		

		// Remove from table array
		document.getElementById(id).remove();
		// Remove from price array
		try {
			document.getElementById(id + 'price').remove();
		} catch (e) {

		}
	}

	PhoenixUX.appendFileToMediaTable = function(file, iconURL, coverart) {
		if (coverart){
			var coverArtFile = document.getElementById("coverArtFile");

			if (coverArtFile)
				coverArtFile.remove();

			file.id = "coverArtFile";
		}

		var htmlStr = '\
			<tr id="' + file.id + '">\
				<td><img class="table-icon" src="' + (iconURL ? iconURL : 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=') + '"></td>\
				<td class="text-left"> <input type="text" class="form-control" name="dispName" placeholder="' + file.name + '" oninput="PhoenixUI.onFileNameInput(this);"></td>\
				<td>' + PhoenixUX.humanFileSize(file.size, true) + '</td>\
				<td style="width: 100%">\
					<div class="row form-control dual-selector">\
						<select class="form-control col-6" id="typeSelect" onchange="PhoenixUI.onMediaSelectChange(this);">';

		var subtypes = "";
		for (var i in PhoenixUX.fileSelectTypes) {
			if (coverart && i === "Image"){
				subtypes = PhoenixUX.fileSelectTypes[i];
			} else if (subtypes == ""){
				subtypes = PhoenixUX.fileSelectTypes[i];
			}

		 	htmlStr += "<option>" + i + "</option>";
		} 

		htmlStr +=	'</select>\
					<select class="form-control col-6" id="subtypeSelect" onchange="PhoenixUI.onMediaSelectChange(this);">';

		for (var i = 0; i < subtypes.length; i++) {
			var value;
			var display;

			if (subtypes[i] !== null && typeof subtypes[i] === 'object'){
				value = subtypes[i].publish;
				display = subtypes[i].display;
			} else {
				value = subtypes[i];
				display = subtypes[i];
			}

		 	htmlStr += "<option value='" + value + "'>" + display + "</option>";
		} 

		htmlStr +=	'</select>\
					</div>\
				</td>\
				<td><button class="btn btn-sm btn-outline-danger" onclick="PhoenixUI.removeMediaFile(\'' + file.id + '\');"';

		if (coverart){
			htmlStr +=	' disabled';
		}

		htmlStr +=	'>x</button></td>\
		 </tr>';

		$('#mediaTable').append(htmlStr);

		if (coverart)
			$("#coverArtFile").find("input,button,textarea,select").attr("disabled", "disabled");
	}

	PhoenixUX.appendFileToPricingTable = function(file) {
		$('#pricingTable tr:last').after(
			'<tr id="' + file.id + 'price">' +
				'<td style="width:20%">' + file.name + '</td>' +
				'<td>' +
					'<div class="input-group">' +
						'<div class="input-group-addon">$</div>' +
						'<input type="text" class="price form-control" id="sugPlay" oninput="PhoenixUI.validatePricing(this)" onblur="PhoenixUI.validatePricing(this, true)" placeholder="0.000">' +
					'</div>' +
				'</td>' +
				'<td>' +
					'<div class="input-group">' +
						'<div class="input-group-addon">$</div>' +
						'<input type="text" class="price form-control" id="minPlay" oninput="PhoenixUI.validatePricing(this)" onblur="PhoenixUI.validatePricing(this, true)" placeholder="0.000">' +
					'</div>' +
			   '</td>' +
				'<td>' +
					'<div class="input-group">' +
						'<div class="input-group-addon">$</div>' +
						'<input type="text" class="price form-control" id="sugBuy" oninput="PhoenixUI.validatePricing(this)" onblur="PhoenixUI.validatePricing(this, true)" placeholder="0.000">' +
					'</div>' +
				'</td>' +
				'<td>' +
					'<div class="input-group">' +
						'<div class="input-group-addon">$</div>' +
						'<input type="text" class="price form-control" id="minBuy" oninput="PhoenixUI.validatePricing(this)" onblur="PhoenixUI.validatePricing(this, true)" placeholder="0.000">' +
					'</div>' +
				'</td>' +
				'<td style="width:15%"><input type="checkbox" id="disPlay" onclick="PhoenixUI.checkboxToggle(\'' + file.id + '\', \'play\')"> Disallow Play' +
				'<br><input type="checkbox" id="disBuy" onclick="PhoenixUI.checkboxToggle(\'' + file.id + '\', \'buy\')"> Disallow Buy</td>' +
			'</tr>');

		pricingElement.style.display = 'block';
	}

	PhoenixUX.posterFileSelectHandler = function(file) {
		if (!file.type.includes('image/')){
			return false;
		}

		PhoenixUX.posterFile = file;

		PhoenixUX.mediaFileSelectHandler(file, "cover");

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
		if (!PhoenixUX.mediaPricing){
			PhoenixUX.mediaPricing = {};
		}

		if (!PhoenixUX.mediaPricing[id + 'price']){
			PhoenixUX.mediaPricing[id + 'price'] = {};
		}

		// Check if the play button was just toggled, if it was check to make sure that it was toggled on.
		if (checkbox == 'play' && $('#' + id + 'price #disPlay').is(':checked')){
			PhoenixUX.mediaPricing[id + 'price'].disPlay = true
			
			if (PhoenixUX.mediaPricing[id + 'price'].disBuy){
				delete PhoenixUX.mediaPricing[id + 'price'].disBuy;
			}

			// Clear the play pricing, this shortens the publisher JSON
			$('#' + id + 'price #sugPlay').val("");
			$('#' + id + 'price #minPlay').val("");

			if (PhoenixUX.mediaPricing[id + 'price'].sugPlay){
				delete PhoenixUX.mediaPricing[id + 'price'].sugPlay;
			}

			if (PhoenixUX.mediaPricing[id + 'price'].minPlay){
				delete PhoenixUX.mediaPricing[id + 'price'].minPlay;
			}

			// Uncheck the buy if it is checked, one of them must be unchecked
			if ($('#' + id + 'price #disBuy').is(':checked'))
				$('#' + id + 'price #disBuy').prop("checked", false);
		}

		// Check if the buy button was just toggled, check to make sure that it was toggled on.
		if (checkbox == 'buy' && $('#' + id + 'price #disBuy').is(':checked')){
			PhoenixUX.mediaPricing[id + 'price'].disBuy = true

			if (PhoenixUX.mediaPricing[id + 'price'].disPlay){
				delete PhoenixUX.mediaPricing[id + 'price'].disPlay;
			}

			// Clear the buy pricing, this shortens the publisher JSON
			$('#' + id + 'price #sugBuy').val("");
			$('#' + id + 'price #minBuy').val("");

			if (PhoenixUX.mediaPricing[id + 'price'].sugBuy){
				delete PhoenixUX.mediaPricing[id + 'price'].sugBuy;
			}

			if (PhoenixUX.mediaPricing[id + 'price'].minBuy){
				delete PhoenixUX.mediaPricing[id + 'price'].minBuy;
			}

			// Uncheck the buy if it is checked, one of them must be unchecked
			if ($('#' + id + 'price #disPlay').is(':checked'))
				$('#' + id + 'price #disPlay').prop("checked", false);
		}
	}

	PhoenixUX.onMetadataChange = function(elem) {
		PhoenixUX.updatePubFee();
	}

	PhoenixUX.validatePricing = function(elem, ignoreTypingHelpers){
		PhoenixUX.pricingElem = elem;

		var checkboxDiv = elem.parentElement.parentElement.parentElement.children[5];

		if (!ignoreTypingHelpers){
			if (elem.value.substr(-1) == '.')
				return;

			if (elem.value.substr(-1) == 0)
				return;
		}

		elem.value = parseFloat(parseFloat(elem.value).toFixed(3));

		if (elem.value == 0 || elem.value == 'NaN'){
			elem.value = '';
		} else {
			var id = elem.parentNode.parentNode.parentNode.id;

			if (elem.id == 'sugPlay' || elem.id == 'minPlay'){
				checkboxDiv.children[0].checked = false;

				if (PhoenixUX.mediaPricing && PhoenixUX.mediaPricing[id] && PhoenixUX.mediaPricing[id].disPlay){
					delete PhoenixUX.mediaPricing[id].disPlay;
				}
			} else if (elem.id == 'sugBuy' || elem.id == 'minBuy'){
				checkboxDiv.children[1].checked = false;

				if (PhoenixUX.mediaPricing && PhoenixUX.mediaPricing[id] && PhoenixUX.mediaPricing[id].disBuy){
					delete PhoenixUX.mediaPricing[id].disBuy;
				}
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
		var minBuyArray = [];
		var sugPlayArray = [];
		var sugBuyArray = [];

		if (PhoenixUX.mediaPricing){
			for (var media in PhoenixUX.mediaPricing){
				if (PhoenixUX.mediaPricing[media].minPlay){
					minPlayArray.push(parseFloat(PhoenixUX.mediaPricing[media].minPlay));
				}
				if (PhoenixUX.mediaPricing[media].minBuy){
					minBuyArray.push(parseFloat(PhoenixUX.mediaPricing[media].minBuy));
				}
				if (PhoenixUX.mediaPricing[media].sugPlay){
					sugPlayArray.push(parseFloat(PhoenixUX.mediaPricing[media].sugPlay));
				}
				if (PhoenixUX.mediaPricing[media].sugBuy){
					sugBuyArray.push(parseFloat(PhoenixUX.mediaPricing[media].sugBuy));
				}
			}
		}

		var pubJSON = JSON.stringify(PhoenixUX.generateArtifactJSONFromView());

		Phoenix.calculatePublishFee(pubJSON.length, minPlayArray, minBuyArray, sugPlayArray, sugBuyArray, function(usd, flo){
			var usdDisplay = "";

			if (usd < 0.01){
				usdDisplay = "~" + parseFloat((usd * 100).toFixed(2)) + "¢"; 
			} else {
				usdDisplay = '~$' + usd.toFixed(2);
			}

			// round to 4 decimal places
			var floDisplay = parseFloat((Math.round(flo * 1000)/1000).toFixed(4)) + " FLO"

			if (!usd || usd == 0 || usd == 'Infinity'){
				publishSlashElement.style.display = "none";
				publishFeeFLOElement.style.display = "none";
				publishFeeElement.innerHTML = "Free!";
			} else {
				publishFeeElement.innerHTML = usdDisplay;
				publishSlashElement.style.display = "inline";
				publishFeeFLOElement.style.display = "inline";
				publishFeeFLOElement.innerHTML = floDisplay;

				if (flo > Phoenix.wallet.getTotalBalance()){
					publishSubmitSectionElement.style['background-color'] = "rgba(217,83,79,0.3)";
					publishSubmitSectionElement.style.border = "1px solid rgba(217,83,79,1)";
					pubBalanceTooLowElement.style.display = "inline";
				} else {
					publishSubmitSectionElement.style['background-color'] = "#ffffff";
					publishSubmitSectionElement.style.border = "1px solid #000";
					pubBalanceTooLowElement.style.display = "none";
				}
			}
		})
	}

	PhoenixUX.changeMediaSelect = function(id, newType, newSubtype){
		var typeSelect = document.getElementById(id).children[3].children[0].children[0];
		var subtypeSelect = document.getElementById(id).children[3].children[0].children[1];

		for (var i = 0; i < typeSelect.children.length; i++) {
			if (typeSelect.children[i].value == newType){
				typeSelect.value = newType;
				PhoenixUX.onMediaSelectChange(typeSelect);
			}
		}

		for (var i = 0; i < subtypeSelect.children.length; i++) {
			if (subtypeSelect.children[i].value == newSubtype){
				subtypeSelect.value = newSubtype;
				PhoenixUX.onMediaSelectChange(subtypeSelect);
			}
		}
	}

	PhoenixUX.onMediaSelectChange = function(elem){
		PhoenixUX.mediaChangeSelect = elem;

		var id = elem.parentNode.parentNode.parentNode.id;
		var type = elem.parentNode.children[0].value;
		var secondSelector = elem.parentNode.children[1];

		if (!PhoenixUX.mediaPricing){
			PhoenixUX.mediaPricing = {};
		}
		if (!PhoenixUX.mediaPricing[id + 'price']){
			PhoenixUX.mediaPricing[id + 'price'] = { }
		}

		if (elem.id === "typeSelect"){
			PhoenixUX.mediaPricing[id + 'price'].type = elem.value;

			for (var v in PhoenixUX.fileSelectTypes) {
				if (v == type){
					secondSelector.innerHTML = '';
					var tmpString = '';
					for (var i = 0; i < PhoenixUX.fileSelectTypes[v].length; i++) {
						var value = "";
						var display = "";

						if (PhoenixUX.fileSelectTypes[v][i] !== null && typeof PhoenixUX.fileSelectTypes[v][i] === 'object'){
							value = PhoenixUX.fileSelectTypes[v][i].publish;
							display = PhoenixUX.fileSelectTypes[v][i].display;
						} else {
							value = PhoenixUX.fileSelectTypes[v][i];
							display = PhoenixUX.fileSelectTypes[v][i];
						}

						tmpString += '<option value="' + value + '">' + display + '</option>';
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
			} else if (type == 'Other'){
				newIconURL = './assets/svg/bucket.svg';
			}

			var icon = parent.children[0].children[0].src = newIconURL;
		} else if (elem.id === "subtypeSelect") {
			PhoenixUX.mediaPricing[id + 'price'].subtype = elem.value;
		}
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

	PhoenixUX.onTipsInput = function(elem, ignoreTypingHelpers){
		var id = elem.id.replace('tip','');

		if (!PhoenixUX.tips)
			PhoenixUX.tips = {};

		if (elem.value == "")
			delete PhoenixUX.tips[id];
		else {
			// Stop the parser from removing periods or zeros that the user just typed.
			if (!ignoreTypingHelpers){
				if (elem.value.substr(-1) == '.')
					return;

				if (elem.value.substr(-1) == 0)
					return;
			}
			
			// Store the cursor position so that we do not lose our place
			var position = elem.selectionStart;

			// Remove any trailing zeros and truncate to just 3 decimal places
			elem.value = parseFloat(parseFloat(elem.value).toFixed(3));

			// Store the updated tip
			PhoenixUX.tips[id] = elem.value;

			// Restore cursor position
			elem.selectionEnd = position;
		}
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

		// Truncate zeros
		elem.value = parseInt(elem.value);

		if (!PhoenixUX.advancedPricing)
			PhoenixUX.advancedPricing = {};

		if (elem.value == "")
			delete PhoenixUX.advancedPricing[id];
		else
			PhoenixUX.advancedPricing[id] = elem.value;
	}

	PhoenixUX.onFileNameInput = function(elem){
		var id = elem.parentElement.parentElement.id + 'price';

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
PhoenixUI.updatePubFee();

// Handle all of the drag and drop setup
var posterDropzone = new Dropzone("div#poster", { 
	url: '/url',
	createImageThumbnails: false,
	previewTemplate: '<div></div>',
	acceptedFiles: "png,jpg",
	maxFiles: 1
});

posterDropzone.on("addedfile", PhoenixUI.posterFileSelectHandler);

var mediaDropzone = new Dropzone("div#mediaDrop", { 
	url: '/url',
	createImageThumbnails: false,
	previewTemplate: '<div></div>'
});

mediaDropzone.on("addedfile", PhoenixUI.mediaFileSelectHandler);

window.onbeforeunload = function() {
  return "Are you sure you want to navigate away?";
}
