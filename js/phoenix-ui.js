// At the top we define all of our variables used below that link to our UI. This uses regular html selectors currently, not jQuery selectors.
var pubNameElement = document.getElementById('pub-name');
var nsfwToggle = document.getElementById('nsfwToggle');
var walletBalanceElement = document.getElementById('walletBalance');
var walletBalanceUSDElement = document.getElementById('walletBalanceUSD');
var publisherSelectElement = document.getElementById('publisherSelect');
var currentPublisherAddressElement = document.getElementById('currentPublisherAddress');
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
var mediaTableElement = document.getElementById('mediaTable');
var mediaFilesTableElement = document.getElementById('mediaFilesTable');
var posterFileElement = document.getElementById('posterFile');
var publishFeeElement = document.getElementById('publishFee');
var publishSlashElement = document.getElementById('publishSlash');
var publishFeeFLOElement = document.getElementById('publishFeeFLO');
var pubBalanceTooLowElement = document.getElementById('pubBalanceTooLow');
var publishSubmitSectionElement = document.getElementById('publishSubmitSection');
var paymentAddressesElement = document.getElementById('paymentAddresses');
var pricingElement = document.getElementById('pricing');
var subGenreSelectorElement = document.getElementById('subGenreSelector');
var discountPercentageElement = document.getElementById('discountPercentage');
var colIdSelectorElement = document.getElementById('colIdSelector');
var colFilesSelectorElement = document.getElementById('colFilesSelector');
var bulkColDetailsElement = document.getElementById('bulkColDetails');
var selIdColElement = document.getElementById('selIdCol');
var selFilesColElement = document.getElementById('selFilesCol');
var bulkProgressBarElement = document.getElementById('bulkProgressBar');
var bulkProgressBarInfoElement = document.getElementById('bulkProgressBarInfo');
var pubStatusTableElement = document.getElementById('pubStatusTable');
var uploadStatusTableElement = document.getElementById('uploadStatusTable');
var advancedSettingsElement = document.getElementById('advancedSettings');
var mainPubStatusDiv = document.getElementById('mainPubStatusDiv');
var mainUploadStatusDiv = document.getElementById('mainUploadStatusDiv');
var mediaDrop = document.getElementById('mediaDrop');
var draftTBodyElement = document.getElementById('draftTbody');
var draftTableElement = document.getElementById('draftTable');
var draftOrElement = document.getElementById('draftOr');
var proccessingArtifactsTableElement = document.getElementById('proccessingArtifactsTable');
var proccessingArtifactsTitleElement = document.getElementById('proccessingArtifactsTitle');
var artifactsTBodyElement = document.getElementById('artifactsTBody');
var thumbTextElement = document.getElementById('thumbText');

// Basic JSON to manage page
var showWizardPage = function(){
	hideAll();
	$('#wizard').show();
	localStorage.lastPage = "draftSelect";
}

var showArtifactPage = function(){
	hideAll();
	$('#artifacts').show();
	localStorage.lastPage = "artifacts";
}

var showWalletPage = function(){
	hideAll();
	$('#WalletPage').show();
	localStorage.lastPage = "WalletPage";
}

var showToolsPage = function(){
	hideAll();
	$('#tools').show();
	localStorage.lastPage = "tools";
}

var showDraftsPage = function(){
	hideAll();
	PhoenixUI.generateDraftRows();
	$('#draftSelect').show();
	localStorage.lastPage = "draftSelect";
}

var hideAll = function(){
	$('#wizard').hide();
	$('#artifacts').hide();
	$('#editArtifact').hide();
	$('#WalletPage').hide();
	$('#tools').hide();
	$('#draftSelect').hide();
	document.body.scrollTop = document.documentElement.scrollTop = 0;
}

// Accepts a set of Selectors to load the artifact into view. Generates code for all of the different sections to fill it.
PhoenixEvents.on("onError", function(msg){ console.log(msg.message) });
PhoenixEvents.on("onLogin", function(msg){ console.log("Logging in"); })
PhoenixEvents.on("onLoginFail", function(msg){ 
	document.location.href = "login.html"
})
PhoenixEvents.on("onLoginSuccess", function(msg){ console.log("Login Success");PhoenixUI.updateBalanceDisplay();PhoenixUI.updatePubFee(); })
PhoenixEvents.on("onPublishStart", function(msg){ 
	PhoenixUI.drawArtifacts();
	PhoenixUI.updateBalanceDisplay();
	PhoenixUI.notify("Publishing Artifact", 'warning');
	console.log(msg);
})
PhoenixEvents.on("onPublishTXSuccess", function(msg){ 
	PhoenixUI.drawArtifacts();
	PhoenixUI.updateBalanceDisplay();
	console.log(msg);
})
PhoenixEvents.on("onPublishEnd", function(msg){ 
	PhoenixUI.drawArtifacts();
	PhoenixUI.updateBalanceDisplay();
	//PhoenixUI.drawProcessingArtifacts();
	PhoenixUI.notify("Artifact Publish Successful!", 'success'); 
	console.log(msg); 
})
PhoenixEvents.on("onTusUploadProgress", function(msg){ 
	PhoenixUI.drawArtifacts();
})
PhoenixEvents.on("onTusUploadSuccess", function(msg){ 
	PhoenixUI.drawArtifacts();
})
PhoenixEvents.on("onTusUploadError", function(msg){ 
	PhoenixUI.drawArtifacts();
})
PhoenixEvents.on("onIPFSStart", function(msg){ 
	PhoenixUI.drawArtifacts();
})
PhoenixEvents.on("onArtifactDeactivateSuccess", function(msg,txid){ 
	console.log("Artifact Deactivation Success",msg); 
	PhoenixUI.drawArtifacts();
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
	if (publishers[0]){
		pubNameElement.innerHTML = publishers[0].name;
		currentPublisherAddressElement.value = publishers[0].address;
		Phoenix.currentPublisher = publishers[0];
	}

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

	PhoenixUI.curArtifacts = msg.results;

	// If we are on the currently selected one, then load in the artifacts to the Artifact page.
	if (publisherSelectElement.value == msg.address){
		// Wipe the artifact table clean
		// $("#ArtifactsTable > tbody").empty();

		if (!PhoenixUI.successfulTXIDs)
			PhoenixUI.successfulTXIDs = [];

		// Load in all the artifacts to the Table
		// for (var i in msg.results){
		// 	if (msg.results[i]['media-data']) {
		// 		var markup = "<tr id='" + msg.results[i].txid + "'>\
		// 						<th scope='row'>" + (1+parseInt(i)) + "</th>\
		// 						<td><code>" + msg.results[i]['media-data']['alexandria-media'].info.title + "</code></td>\
		// 						<td>TXID: <a href='https://florincoin.info/tx/" + msg.results[i].txid + "'><code>" + msg.results[i].txid.substring(0,10) + "...</code></a></td>\
		// 						<td><button onClick='Phoenix.artifactInfo(\"" + msg.results[i].txid + "\");' class='dev btn btn-info'>Info</button> <button onClick='PhoenixUI.EditArtifact(\"" + msg.results[i].txid + "\");' class='dev btn btn-outline-warning'>Edit</button> <button onClick='Phoenix.deactivateArtifact(\"" + msg.results[i].txid + "\");' class='btn btn-outline-danger'>Deactivate</button></td>\
		// 					</tr>";
		// 		$("#ArtifactsTable > tbody").append(markup);
		// 	} else if (msg.results[i]['oip-041']){
		// 		PhoenixUI.successfulTXIDs.push(msg.results[i].txid);
		// 		var markup = "<tr id='" + msg.results[i].txid + "'>\
		// 						<th scope='row'>" + (1+parseInt(i)) + "</th>\
		// 						<td><code>" + msg.results[i]['oip-041'].artifact.info.title + "</code></td>\
		// 						<td>TXID: <a href='https://florincoin.info/tx/" + msg.results[i].txid + "'><code>" + msg.results[i].txid.substring(0,10) + "...</code></td>\
		// 						<td><button onClick='ArtifactInfo(\"" + msg.results[i].txid + "\");' class='dev btn btn-info'>Info</button> <button onClick='PhoenixUI.EditArtifact(\"" + msg.results[i].txid + "\");' class='btn btn-outline-warning'>Edit</button> <button onClick='Phoenix.deactivateArtifact(\"" + msg.results[i].txid + "\");' class='btn btn-outline-danger'>Deactivate</button></td>\
		// 					</tr>";
		// 		$("#ArtifactsTable > tbody").append(markup);
		// 	}
		// }

		if (!PhoenixUI.processingArtifacts)
			PhoenixUI.processingArtifacts = [];

		PhoenixUI.drawArtifacts();

		checkEnv();
	}

	doneLoading();
})
PhoenixEvents.on("onWalletLoad", function(wallet){ 
	PhoenixUI.updateBalanceDisplay();

	walletIdentifierElement.innerHTML = wallet.identifier;

	Phoenix.getMarketData(function(data){ 
		marketData = data; 
		perBTC = marketData.USD/marketData.weighted;
		var FLOUSD = marketData.USD;
	
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

	// Variables
	PhoenixUX.paymentAddresses = {};
	PhoenixUX.mediaFiles = [];
	PhoenixUX.mediaPricing = {};
	PhoenixUX.tips = {};
	PhoenixUX.advancedPricing = {};
	PhoenixUX.bulkFiles = [];
	PhoenixUX.bulkFilesComplete = [];

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

	PhoenixUX.websiteGenres = [
		"Anatomy",
		"Animal",
		"Animation",
		"Architecture",
		"Art",
		"Automotive",
		"Avation",
		"Adult",
		"Chat",
		"Comic",
		"Commerce",
		"Community",
		"Dance",
		"Dating",
		"Digital Media",
		"Disability",
		"Economics",
		"Educational",
		"Employment",
		"Entertainment",
		"Environmental",
		"Fashion",
		"Food & Drink",
		"Fundraising",
		"Genealogy",
		"Health",
		"History",
		"Humor",
		"Image Hosting",
		"Law Enforcement",
		"Law/Legal",
		"LGBTQ",
		"Library",
		"Lifestyle",
		"Linguistics",
		"Literature",
		"Marine",
		"Media",
		"Men",
		"Military",
		"Music",
		"News",
		"Nostalgia",
		"Parenting",
		"Philosophy",
		"Photography",
		"Political",
		"Religious",
		"Review",
		"Route Planning",
		"Satirical",
		"Science Fiction",
		"Science",
		"Social Networking",
		"Social Planning",
		"Speculative Fiction",
		"Sports",
		"Technology",
		"Translation",
		"Transportation",
		"Travel",
		"Vegetarian",
		"Video Games",
		"Video Hosting",
		"Virtual Museum",
		"Webmail",
		"Women",
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
					"placeholder": "Title*"
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
				"id": "thumbnail",
				"class": "thumbnail"
			}
		},{
			"subtype": "Song",
			"forms": [{
					"id": "title",
					"width": 12,
					"placeholder": "Song Title*"
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
				"id": "thumbnail",
				"class": "thumbnail"
			}
		},{
			"subtype": "Album",
			"forms": [{
					"id": "title",
					"width": 12,
					"placeholder": "Album Title*"
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
				"id": "thumbnail",
				"class": "thumbnail"
			}
		},{
			"subtype": "Podcast",
			"forms": [{
					"id": "title",
					"width": 12,
					"placeholder": "Podcast Name*",
					"subtext": "This will be auto formatted with \"Podcast Name\": \"Episode Title\""
				},
				{
					"id": "extraInfo.episodeTitle",
					"width": 12,
					"placeholder": "Episode Title*",
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
					"genres": PhoenixUX.webGenres
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
				"id": "thumbnail",
				"class": "thumbnail"
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
					"placeholder": "Title*"
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
				"id": "thumbnail",
				"class": "thumbnail"
			}
		},{
			"subtype": "Series",
			"forms": [{
					"id": "title",
					"width": 12,
					"placeholder": "Series Name*",
					"subtext": "This will be auto formatted with \"Series Name\": \"Episode Title\""
				},
				{
					"id": "extraInfo.episodeTitle",
					"width": 12,
					"placeholder": "Episode Title*",
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
				"id": "thumbnail",
				"class": "thumbnail"
			}
		},{
			"subtype": "Movie",
			"forms": [{
					"id": "title",
					"width": 12,
					"placeholder": "Movie Title*"
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
				"id": "thumbnail",
				"text": "Thumbnail",
				"class": "thumbnail"
			}
		}]
	},{
		"type": "Image",
		"icon": "image-icon",
		"subtypes": [{
			"subtype": "Basic",
			"forms": [{
					"id": "title",
					"width": 12,
					"placeholder": "Title*"
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
				"id": "thumbnail",
				"class": "thumbnail"
			}
		}]
	},{
		"type": "Text",
		"icon": "text-icon",
		"subtypes": [{
			"subtype": "Basic",
			"forms": [{
					"id": "title",
					"width": 12,
					"placeholder": "Title*"
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
				"id": "thumbnail",
				"class": "thumbnail"
			}
		},{
			"subtype": "PDF",
			"forms": [{
					"id": "title",
					"width": 12,
					"placeholder": "PDF Title*"
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
				"id": "thumbnail",
				"class": "thumbnail"
			}
		},{
			"subtype": "Book",
			"forms": [{
					"id": "title",
					"width": 12,
					"placeholder": "Book Title*"
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
				"id": "thumbnail",
				"class": "thumbnail"
			}
		}]
	},{
		"type": "Software",
		"icon": "software-icon",
		"subtypes": [{
			"subtype": "Basic",
			"forms": [{
					"id": "title",
					"width": 12,
					"placeholder": "Title*"
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
				"id": "thumbnail",
				"class": "thumbnail"
			}
		},{
			"subtype": "3D Thing",
			"forms": [{
					"id": "title",
					"width": 12,
					"placeholder": "Title*"
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
				"id": "thumbnail",
				"class": "thumbnail"
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
					"placeholder": "Title*"
				},
				{
					"id": "extraInfo.artist",
					"width": 12,
					"placeholder": "Creator"
				},
				{
					"id": "extraInfo.genre",
					"width": 9,
					"placeholder": "Genre",
					"genres": PhoenixUX.websiteGenres
				},
				{
					"id": "year",
					"width": 3,
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
				"id": "thumbnail",
				"text": "Thumbnail",
				"class": "thumbnail"
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
			{subtype: "Movie", display: "Feature - 4k", publish: "F-4K"},
			{subtype: "Movie", display: "Feature - HD 1080p", publish: "F-HD1080"},
			{subtype: "Movie", display: "Feature - HD 720p", publish: "F-HD720"},
			{subtype: "Movie", display: "Feature - SD 480p", publish: "F-SD480"},
			{subtype: "Movie", display: "Feature - LOW 320p", publish: "F-LOW320"},
			{subtype: "Movie", display: "Feature - Mobile 240p", publish: "F-MOB240"},
			{subtype: "Movie", display: "Trailer A - 4k", publish: "TA-4K"},
			{subtype: "Movie", display: "Trailer A - HD 1080p", publish: "TA-HD1080"},
			{subtype: "Movie", display: "Trailer A - HD 720p", publish: "TA-HD720"},
			{subtype: "Movie", display: "Trailer A - SD 480p", publish: "TA-SD480"},
			{subtype: "Movie", display: "Trailer A - LOW 320p", publish: "TA-LOW320"},
			{subtype: "Movie", display: "Trailer A - Mobile 240p", publish: "TA-MOB240"},
			{subtype: "Movie", display: "Trailer B - 4k", publish: "TB-4K"},
			{subtype: "Movie", display: "Trailer B - HD 1080p", publish: "TB-HD1080"},
			{subtype: "Movie", display: "Trailer B - HD 720p", publish: "TB-HD720"},
			{subtype: "Movie", display: "Trailer B - SD 480p", publish: "TB-SD480"},
			{subtype: "Movie", display: "Trailer B - LOW 320p", publish: "TB-LOW320"},
			{subtype: "Movie", display: "Trailer B - Mobile 240p", publish: "TB-MOB240"},
			{subtype: "Movie", display: "Trailer C - 4k", publish: "TC-4K"},
			{subtype: "Movie", display: "Trailer C - HD 1080p", publish: "TC-HD1080"},
			{subtype: "Movie", display: "Trailer C - HD 720p", publish: "TC-HD720"},
			{subtype: "Movie", display: "Trailer C - SD 480p", publish: "TC-SD480"},
			{subtype: "Movie", display: "Trailer C - LOW 320p", publish: "TC-LOW320"},
			{subtype: "Movie", display: "Trailer C - Mobile 240p", publish: "TC-MOB240"}
		],
		'Image': [
			"Basic",
			{display: "Thumbnail", publish: "cover"},
			{display: "Album Artwork", publish: "album-art"},
			{display: "Artwork Thumbnail", publish: "art-thumb"},
			{display: "Theatrical Thumbnail", publish: "theatrical-poster"},
			"Thumbnail",
			"Thumbnail"
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

	PhoenixUX.resetPublisher = function(){
		PhoenixUX.mediaFiles = [];

		PhoenixUX.loadTypes();

		mediaTableElement.innerHTML = "";
		pricingTable.innerHTML = "";

		pricingElement.style.display = 'none';
		mediaFilesTableElement.style.display = 'none';
		mediaDrop.style.height="250px";
	}

	PhoenixUX.loadIntoMeta = function(oip041){
		for (var i = 0; i < PhoenixUX.types.length; i++) {
			if (PhoenixUX.types[i].type == type){
				if (PhoenixUX.types[i].subtypes[0]){
					PhoenixUX.updateMetadata(type, PhoenixUX.types[i].subtypes[0]);
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
			if (Phoenix.publishers[i].address == elem.value){
				pubNameElement.innerHTML = Phoenix.publishers[i].name;
				currentPublisherAddressElement.value = Phoenix.publishers[i].address;
				Phoenix.currentPublisher = Phoenix.publishers[i];
			}
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

		var fillState = {};

		for (var i = 0; i < PhoenixUX.types.length; i++) {
			if (PhoenixUX.types[i].type == PhoenixUX.type){
				for (var j = 0; j < PhoenixUX.types[i].subtypes.length; j++) {
					if (PhoenixUX.types[i].subtypes[j].subtype == PhoenixUX.subtype){
						var forms = PhoenixUX.types[i].subtypes[j].forms;

						for (var k = 0; k < forms.length; k++) {
							var location = forms[k].id;

							var formValue = "";

							if (document.getElementById(location))
								formValue = document.getElementById(location).value;
							

							if (formValue && formValue != ""){
								if (location == 'extraInfo.tags'){
									fillState[location] = formValue.split(',');
								} else {
									fillState[location] = formValue;
								}
							}
						}
					}
				}
			}
		}

		for (var i = 0; i < typeCirclesElement.children.length; i++) {
			typeCirclesElement.children[i].children[0].classList.remove('type-circle-active');

			 if (typeCirclesElement.children[i].id == type)
			 	typeCirclesElement.children[i].children[0].className += ' type-circle-active';
		}

		for (var i = 0; i < PhoenixUX.types.length; i++) {
			if (PhoenixUX.types[i].type == type){
				if (PhoenixUX.types[i].subtypes[0]){
					PhoenixUX.updateMetadata(type, PhoenixUX.types[i].subtypes[0]);
				}
				var typesPillsHTML = '';
				for (var j = 0; j < PhoenixUX.types[i].subtypes.length; j++) {
					typesPillsHTML += '<li id="' + PhoenixUX.types[i].subtypes[j].subtype + '" ' + ( j==0 ? 'class="active"' : '') + ' onclick="PhoenixUI.changeSubtype(\'' + PhoenixUX.types[i].type + ',' + PhoenixUX.types[i].subtypes[j].subtype + '\')"><a href="#' + PhoenixUX.types[i].subtypes[j].subtype + '" data-toggle="tab">' + PhoenixUX.types[i].subtypes[j].subtype + '</a></li>';
				}
				subtypePillsElement.innerHTML = typesPillsHTML;
			}
		}

		for (var id in fillState){
			console.log(id);
			if (id != "extraInfo.genre"){
				document.getElementById(id).value = fillState[id];
			}
		}
	}

	PhoenixUX.changeSubtype = function(str){
		var type = str.split(',')[0];
		var subtype = str.split(',')[1];

		PhoenixUX.subtype = subtype;

		var fillState = {};

		for (var i = 0; i < PhoenixUX.types.length; i++) {
			if (PhoenixUX.types[i].type == PhoenixUX.type){
				for (var j = 0; j < PhoenixUX.types[i].subtypes.length; j++) {
					if (PhoenixUX.types[i].subtypes[j].subtype == PhoenixUX.subtype){
						var forms = PhoenixUX.types[i].subtypes[j].forms;

						for (var k = 0; k < forms.length; k++) {
							var location = forms[k].id;

							var formValue = "";

							if (document.getElementById(location))
								formValue = document.getElementById(location).value;

							if (formValue && formValue != ""){
								if (location == 'extraInfo.tags'){
									fillState[location] = formValue.split(',');
								} else {
									fillState[location] = formValue;
								}
							}
						}
					}
				}
			}
		}

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
						PhoenixUX.updateMetadata(type, PhoenixUX.types[i].subtypes[j]);
					}
				}
			}
		}

		PhoenixUI.updateAllSubtypeSelects();

		for (var id in fillState){
			console.log(id);
			if (id != "extraInfo.genre"){
				document.getElementById(id).value = fillState[id];
			}
		}
	}

	PhoenixUX.updateMetadata = function(type, newType){
		if (newType.subtype == "Basic"){
			metaTitleElement.innerHTML = newType.subtype + " " + type + ' Information';
		} else {
			metaTitleElement.innerHTML = newType.subtype + ' Information';
		}
		

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
		posterTitleElement.innerHTML = newType.coverArt.text ? newType.coverArt.text : 'Thumbnail';
	}

	PhoenixUX.EditArtifact = function(txid){
		for (var art in Phoenix.artifacts[publisherSelectElement.value]){
			if (Phoenix.artifacts[publisherSelectElement.value][art].txid == txid){
				PhoenixUX.loadIntoPublisher(Phoenix.artifacts[publisherSelectElement.value][art]['oip-041']);
				showWizardPage();
			}
		}
	}

	PhoenixUX.loadWIPIntoPublisher = function(wipArtifact){
		if (wipArtifact && wipArtifact.artifactJSON)
			PhoenixUX.loadIntoPublisher(wipArtifact.artifactJSON);
	}

	PhoenixUX.loadIntoPublisher = function(oip041){
		var mainType, subType;

		if (!oip041.artifact || !oip041.artifact.type)
			return;

		if (oip041.artifact.type){
			if (Array.isArray(oip041.artifact.type.split('-'))){
				mainType = oip041.artifact.type.split('-')[0];
				subType = oip041.artifact.type.split('-')[1];
			} else {
				if (oip041.artifact.type == 'thing') {
					mainType = ('Image');
					subType = ('Basic');
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
								var newLoc = location.replace('extraInfo.', '');
								value = oip041.artifact.info.extraInfo[newLoc];
							} else {
								value = oip041.artifact.info[location];
							}

							if (value) {
								if (forms[k].id.includes('tags')){
									// ToDo: Load tags
									for (var z = 0; z < value.length; z++) {
										$("input[data-role=tagsinput], select[multiple][data-role=tagsinput]").tagsinput('add', value[z]);
									}
								} else if (forms[k].id.includes('genre')) {
									var splitVal = value.split(',');
									if (splitVal.length > 1){
										console.log(splitVal[0]);
										$('.genreOne option[value="' + splitVal[0] + '"]').attr('selected','selected');
										$('.genreTwo option[value="' + splitVal[1] + '"]').attr('selected','selected');
									} else {
										$('.genreSelectr option[value="' + value + '"]').attr('selected','selected');
									}
									
								} else {
									document.getElementById(forms[k].id).value = value;
								}
							}
						}
					}
				}
			}
		}

		var fileDatas = {};
		for (var i = 0; i < oip041.artifact.storage.files.length; i++) {
			var file = {};
			file.id = PhoenixUX.sanitizeID(oip041.artifact.storage.files[i].fname);
			file.name = oip041.artifact.storage.files[i].fname;
			file.size = oip041.artifact.storage.files[i].size;

			file.type = oip041.artifact.storage.files[i].type;
			file.subtype = oip041.artifact.storage.files[i].subtype;

			var iconURL = "";

			if (file.type == '')
				type = "Other"

			if (file.type == 'Audio'){
				iconURL = './assets/svg/beamed-note.svg';
			} else if (file.type == 'Video'){
				iconURL = './assets/svg/video-camera.svg';
			} else if (file.type == 'Image'){
				iconURL = './assets/svg/image.svg';
			} else if (file.type == 'Text'){
				iconURL = './assets/svg/text-document.svg';
			} else if (file.type == 'Software'){
				iconURL = './assets/svg/code.svg';
			} else if (file.type == 'Web'){
				iconURL = './assets/svg/browser.svg';
			} else if (file.type == 'Other'){
				iconURL = './assets/svg/bucket.svg';
			}

			var continueUpload = true;
			var percent = 0;

			if (Phoenix.wipArtifacts && Phoenix.currentWIPID && Phoenix.wipArtifacts[Phoenix.currentWIPID] && Phoenix.wipArtifacts[Phoenix.currentWIPID].tusFiles){
				for (var j = 0; j < Phoenix.wipArtifacts[Phoenix.currentWIPID].tusFiles.length; j++) {
					if (Phoenix.wipArtifacts[Phoenix.currentWIPID].tusFiles[j]){
						if (Phoenix.wipArtifacts[Phoenix.currentWIPID].tusFiles[j].name === file.name){
							percent = parseFloat(Phoenix.wipArtifacts[Phoenix.currentWIPID].tusFiles[j].progress);
							file.size = Phoenix.wipArtifacts[Phoenix.currentWIPID].tusFiles[j].size;

							if (percent === 100){
								continueUpload = false;
								PhoenixUX.mediaFiles.push(file);
							}
						}
					}
				}
			}
				

			PhoenixUX.appendFileToMediaTable(file, iconURL, null, continueUpload);
			PhoenixUX.appendFileToPricingTable(file);
			PhoenixUX.changeMediaSelect(file.id, file.type, file.subtype);

			fileDatas[i] = {id: file.id, type: file.type, subtype: file.subtype, percent: percent};

			var updateProg = function(){
				for (var i in fileDatas) {
					PhoenixUX.setProgress(fileDatas[i].percent, fileDatas[i].id);
					PhoenixUX.updateProgress(fileDatas[i].id);
				}
			}
			setTimeout(updateProg, 100);
			
		}

		// Load the payment info
		var togglePaid = false;
		if (oip041.artifact.payment){
			if (oip041.artifact.payment.tokens){

				var arr = [{address: "pub", currency: "FLO"}];
				for (var z in oip041.artifact.payment.tokens) {
					PhoenixUX.addPaymentAddress();
					arr.push({address: oip041.artifact.payment.tokens[z], currency: z})
				}
				console.log(paymentAddressesElement);

				for (var j = 1; j < paymentAddressesElement.children.length - 1; j++) {
					console.log(paymentAddressesElement.children[j]);
					paymentAddressesElement.children[j].children[0].children[1].value = arr[j].address;
					console.log(paymentAddressesElement.children[j]);
					PhoenixUX.setPaymentAddressType(paymentAddressesElement.children[j], arr[j].currency);
				}

				if (oip041.artifact.payment.tokens.length > 1){
					togglePaid = true;
				}
			}

			if (oip041.artifact.payment.sugTip){
				//togglePaid = true;

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
		} else if (formJSON.id && formJSON.id.includes('genre')){
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
						selectInner += '<option value="' + genre + '">' + genre + '</option>';
					}

					var selectInner2 = '';
					for (var genre in firstSubArray){
						selectInner2 += '<option value="' + firstSubArray[genre] + '">' + firstSubArray[genre] + '</option>';
					}
					return '<div class="col-' + formJSON.width + ' form-group" id="' + formJSON.id + 'grp">\
						<div class="dual-selector">\
							<select class="form-control genreOne" style="width: 50%" id="mainGenreSelector" onchange="PhoenixUI.updateSubGenre(this);PhoenixUI.generateArtifactJSONFromView(function(){});">\
								' + selectInner + '\
							</select>\
							<select class="form-control genreTwo" style="width: 50%" id="subGenreSelector" onChange="PhoenixUI.generateArtifactJSONFromView(function(){})">\
								' + selectInner2 + '\
							</select>\
						</div>\
					</div>'
				} else {
					// else we are dealing with single level.
					for (var genre in formJSON.genres){
						selectInner += '<option value="' + formJSON.genres[genre] + '">' + formJSON.genres[genre] + '</option>';
					}

					return '<div class="col-' + formJSON.width + ' form-group" id="' + formJSON.id + 'grp">\
						<select class="form-control genreSelectr" id="' + formJSON.id + '" onChange="PhoenixUI.generateArtifactJSONFromView(function(){})">' + selectInner + '</select>\
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

	PhoenixUX.publish = function(){
		Phoenix.publishCurrentWIP();

		showArtifactPage();
		PhoenixUX.resetPublisher();
	}

	PhoenixUX.generateArtifactJSONFromView = function(){
		//var timestamp = ((new Date).getTime() / 1000).toFixed(0);
		var type = PhoenixUX.type;
		var subtype = PhoenixUX.subtype;
		var paid = $('[name="free"]')[1].checked;

		var discountPercentage = discountPercentageElement.value;

		if (discountPercentage === ""){
			discountPercentage = 0.3; // Default of 30%
		} else {
			// parse to percent
			discountPercentage = discountPercentageElement.value / 100;
		}

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
					//"scale": scale + ":1",
					"disPer": discountPercentage,
					"sugTip": [],
					"addresses": []
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

		if (artifactJSON.artifact.info.year && typeof artifactJSON.artifact.info.year === "string"){
			artifactJSON.artifact.info.year = parseInt(artifactJSON.artifact.info.year);
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
								if (!artifactJSON.artifact.payment)
									artifactJSON.artifact.payment = {}

								if (artifactJSON.artifact && artifactJSON.artifact.payment && !artifactJSON.artifact.payment.disPer)
									artifactJSON.artifact.payment.disPer == 0.30;

								if (PhoenixUX.mediaPricing[pricing].sugBuy){
									// disPer stands for discount percentage
									artifactJSON.artifact.storage.files[i].minBuy = parseFloat(PhoenixUX.mediaPricing[pricing].sugBuy) * (1-artifactJSON.artifact.payment.disPer)
									artifactJSON.artifact.storage.files[i].sugBuy = parseFloat(PhoenixUX.mediaPricing[pricing].sugBuy)
								}
								if (PhoenixUX.mediaPricing[pricing].sugPlay){
									artifactJSON.artifact.storage.files[i].minPlay = parseFloat(PhoenixUX.mediaPricing[pricing].sugPlay) * (1-artifactJSON.artifact.payment.disPer)
									artifactJSON.artifact.storage.files[i].sugPlay = parseFloat(PhoenixUX.mediaPricing[pricing].sugPlay)
								}
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
				if (addr && PhoenixUX.paymentAddresses[addr] && PhoenixUX.paymentAddresses[addr].address)
					artifactJSON.artifact.payment.addresses.push({"token": PhoenixUX.paymentAddresses[addr].currency, "address": PhoenixUX.paymentAddresses[addr].address});
			}
		}

		if (PhoenixUX.tips){
			var tipArr = [];

			for (var tip in PhoenixUX.tips){
				tipArr.push(parseFloat(PhoenixUX.tips[tip]) * scale);
			}
		}

		Phoenix.updateWIPArtifactJSON(artifactJSON);

		return artifactJSON;
	}

	PhoenixUX.mediaFileSelectHandler = function(files, subtypefor) {
		if (!subtypefor){
			subtypefor = "";
		}

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

				PhoenixUX.trySetTitleAndType(file.name, type);

				if (subtypefor != "cover")
					PhoenixUX.appendFileToPricingTable(files[i]);

				if (subtypefor != "cover")
					PhoenixUX.mediaFiles.push(files[i]);

				PhoenixUX.generateArtifactJSONFromView();

				Phoenix.uploadFileToTus(files[i]);
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

			PhoenixUX.trySetTitleAndType(file.name, type)

			if (subtypefor != "cover")
				PhoenixUX.appendFileToPricingTable(file);

			if (subtypefor != "cover")
				PhoenixUX.mediaFiles.push(file);

			PhoenixUX.generateArtifactJSONFromView();

			Phoenix.uploadFileToTus(file, function(id){ /*console.log(id)*/ }, function(err){console.log(err)}, function(percent){

				PhoenixUX.setProgress(percent, file.id)
				PhoenixUX.updateProgress(file.id)
			});
		}
	}

	PhoenixUX.updateProgress = function (id) {
		try {
			var tr = document.getElementById(id);
			var pr = tr.querySelector('.progress-so');
			pr.style.left = (parseFloat(tr.dataset.progress) - 100)+'%';
			pr.style.height = tr.clientHeight + 'px';
		} catch (e) {

		}
	}

	PhoenixUX.setProgress = function(percent, id, err) {
		try {
			var tr = document.getElementById(id);

			if (!tr){
				return;
			}

		    var pr = tr.querySelector('.progress-so');

		    if (err){
		    	pr.classList.remove('uploading');
		    	pr.classList.add('upload-error');
		    	return;
		    }

		    if (parseFloat(percent) == 100){
		    	pr.classList.remove('uploading');
		    	pr.classList.add('upload-done');
		    }

		    tr.dataset.progress = Math.round(parseFloat(percent));
		} catch (e) {
			console.log(e)
		} 
	}

	PhoenixUX.onFileResumeAdd = function(elem){
		console.log(elem);
		var file = elem.files[0];

		PhoenixUX.mediaFiles.push(file);

		file.id = PhoenixUX.sanitizeID(file.name);

		Phoenix.uploadFileToTus(file, function(id){ /*console.log(id)*/ }, function(err){console.log(err)}, function(percent){
			PhoenixUX.setProgress(percent, file.id)
			PhoenixUX.updateProgress(file.id)
		});

		var child = elem.parentNode.parentNode.parentNode;
		child.parentNode.removeChild(child);
	}

	PhoenixUX.removeMediaFile = function(id){
		if (PhoenixUX.mediaFiles){
			for (var i = 0; i < PhoenixUX.mediaFiles.length; i++){
				if (PhoenixUX.mediaFiles[i].id == id){
					Phoenix.removeTusInfo(PhoenixUX.mediaFiles[i].name);
					PhoenixUX.mediaFiles.splice(i, 1);
				}
			}

			if (PhoenixUX.mediaFiles.length === 0){
				pricingElement.style.display = 'none';
				mediaFilesTableElement.style.display = 'none';
				mediaDrop.style.height="250px";
			} else {
				mediaDrop.style.height="100px";
			}
		}

		if (PhoenixUX.mediaPricing && PhoenixUX.mediaPricing[id + 'price']){
			delete PhoenixUX.mediaPricing[id + 'price'];
		}

		

		// Remove from table array
		document.getElementById(id).remove();
		// Remove from price array
		try {
			document.getElementById(id + 'price').remove();
		} catch (e) {

		}
	}

	PhoenixUX.trySetTitleAndType = function(title, type){
		if (PhoenixUX.mediaFiles.length === 0){
			PhoenixUX.changeType(type);
		}

		try {
			var parts = title.split(".");

			if (parts.length > 1){
				title = title.replace("." + parts[parts.length -1], '');
			} 

			if (document.getElementById('title').value === "")
				document.getElementById('title').value = title;
		} catch (e){}
	}

	PhoenixUX.appendFileToMediaTable = function(file, iconURL, coverart, continueUpload) {
		// Set uploader to be smaller since we have a file:
		mediaDrop.style.height="100px";

		if (coverart){
			var coverArtFile = document.getElementById("coverArtFile");

			if (coverArtFile)
				coverArtFile.remove();

			file.id = "coverArtFile";
		}

		var htmlStr = '\
			<tr id="' + file.id + '">\
				<td><div class="progress-so uploading"></div><img class="table-icon" src="' + (iconURL ? iconURL : 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=') + '"></td>\
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
			var subtype;

			if (subtypes[i] !== null && typeof subtypes[i] === 'object'){
				value = subtypes[i].publish;
				display = subtypes[i].display;
				subtype = subtypes[i].subtype;
			} else {
				value = subtypes[i];
				display = subtypes[i];
			}

			if (subtype){
				if (PhoenixUX.subtype != subtype)
					continue;
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

		if (continueUpload){
			$('#mediaTable').append('<tr style="background-color: rgba(0,0,0,0.8); margin-top: -43px; position: absolute; height: 43px; width: 100%;">\
				<td style="padding-top: 4px;margin-top:3px;color:#fff;width: 100%;position: absolute;" colspan="5"><center>Please select file to resume upload <div style="width:20px;display: -webkit-inline-box;"></div> <input type="file" onchange="PhoenixUI.onFileResumeAdd(this);" /></center></td>\
			</tr>');
		}

		if (coverart)
			$("#coverArtFile").find("input,button,textarea,select").attr("disabled", "disabled");

		mediaFilesTableElement.style.display = "block";
	}

	PhoenixUX.appendFileToPricingTable = function(file) {
		$('#pricingTable tr:last').after(
			'<tr id="' + file.id + 'price">' +
				'<td style="width:40%"><span style="word-break: break-all;">' + file.name + '</span></td>' +
				'<td style="width:15%">\
					<div class="btn-group" data-toggle="buttons">\
						<label class="btn btn-outline-success active">\
							<input id="disPlay-check" type="radio" autocomplete="off" onchange="PhoenixUI.checkboxToggle(this)"> <span class="icon icon-check"> \
						</label>\
						<label class="btn btn-outline-danger">\
							<input id="disPlay-block" type="radio" autocomplete="off" onchange="PhoenixUI.checkboxToggle(this)"> <span class="icon icon-block"> \
						</label>\
					</div>' +
				'<td style="width:15%">' +
					'<div class="input-group">' +
						'<div class="input-group-addon">$</div>' +
						'<input type="text" class="price form-control" id="sugPlay" oninput="PhoenixUI.validatePricing(this)" onblur="PhoenixUI.validatePricing(this, true)" placeholder="0.000">' +
					'</div>' +
				'</td>\
				<td style="width:15%">\
					<div class="btn-group" data-toggle="buttons">\
						<label class="btn btn-outline-success active">\
							<input id="disBuy-check" type="radio" autocomplete="off" onchange="PhoenixUI.checkboxToggle(this)"> <span class="icon icon-check"> \
						</label>\
						<label class="btn btn-outline-danger">\
							<input id="disBuy-block" type="radio" autocomplete="off" onchange="PhoenixUI.checkboxToggle(this)"> <span class="icon icon-block"> \
						</label>\
					</div>\
				</td>\
				<td style="width:15%">' +
					'<div class="input-group">' +
						'<div class="input-group-addon">$</div>' +
						'<input type="text" class="price form-control" id="sugBuy" oninput="PhoenixUI.validatePricing(this)" onblur="PhoenixUI.validatePricing(this, true)" placeholder="0.000">' +
					'</div>' +
				'</td>' +
			'</tr>');

		// Activate the popovers
		$('[data-toggle="popover"]').popover()

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

			thumbTextElement.style.display = "none";

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

	PhoenixUX.checkboxToggle = function(elem){
		//console.log(elem.id);

		var parent = elem.parentNode.parentNode.parentNode.parentNode;
		//console.log(parent);

		var id = parent.id;
		//console.log(id);

		var disPlayCheck = parent.children[1].children[0].children[0].children[0];
		var disPlayBlock = parent.children[1].children[0].children[1].children[0];

		var sugPlay = parent.children[2].children[0].children[1];

		var disBuyCheck = parent.children[3].children[0].children[0].children[0];
		var disBuyBlock = parent.children[3].children[0].children[1].children[0];

		var sugBuy = parent.children[4].children[0].children[1];

		if (!PhoenixUX.mediaPricing[id]){
			PhoenixUX.mediaPricing[id] = {};
		}

		// Check if the play button was just toggled, if it was check to make sure that it was toggled on.
		if (elem.id === 'disPlay-block' && elem.checked){
			PhoenixUX.mediaPricing[id].disPlay = true;
			
			if (PhoenixUX.mediaPricing[id].disBuy){
				delete PhoenixUX.mediaPricing[id].disBuy;
			}

			// Clear the play pricing, this shortens the publisher JSON
			sugPlay.value = "";

			if (PhoenixUX.mediaPricing[id].sugPlay){
				delete PhoenixUX.mediaPricing[id].sugPlay;
			}

			// Uncheck the buy if it is checked, one of them must be unchecked
			disBuyCheck.checked = true;
			disBuyCheck.parentNode.classList.add("active");
			disBuyBlock.checked = false;
			disBuyBlock.parentNode.classList.remove("active");
		}

		// Check if the buy button was just toggled, check to make sure that it was toggled on.
		if (elem.id === 'disBuy-block' && elem.checked){
			PhoenixUX.mediaPricing[id].disBuy = true;
			
			if (PhoenixUX.mediaPricing[id].disPlay){
				delete PhoenixUX.mediaPricing[id].disPlay;
			}

			// Clear the play pricing, this shortens the publisher JSON
			sugBuy.value = "";

			if (PhoenixUX.mediaPricing[id].sugBuy){
				delete PhoenixUX.mediaPricing[id].sugBuy;
			}

			// Uncheck the buy if it is checked, one of them must be unchecked
			disPlayCheck.checked = true;
			disPlayCheck.parentNode.classList.add("active");
			disPlayBlock.checked = false;
			disPlayBlock.parentNode.classList.remove("active");
		}
	}

	PhoenixUX.onMetadataChange = function(elem) {
		PhoenixUX.updatePubFee();
	}

	PhoenixUX.validatePricing = function(elem, ignoreTypingHelpers){
		PhoenixUX.pricingElem = elem;

		var checkboxDiv = elem.parentElement.parentElement.parentElement.children[5];

		var parent = elem.parentNode.parentNode.parentNode;
		//console.log(parent);

		var id = parent.id;
		//console.log(id);

		var disPlayCheck = parent.children[1].children[0].children[0].children[0];
		var disPlayBlock = parent.children[1].children[0].children[1].children[0];

		var sugPlay = parent.children[2].children[0].children[1];

		var disBuyCheck = parent.children[3].children[0].children[0].children[0];
		var disBuyBlock = parent.children[3].children[0].children[1].children[0];

		var sugBuy = parent.children[4].children[0].children[1];

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
			if (elem.id == 'sugPlay'){
				disPlayCheck.checked = true;
				disPlayCheck.parentNode.classList.add("active");
				disPlayBlock.checked = false;
				disPlayBlock.parentNode.classList.remove("active");

				if (PhoenixUX.mediaPricing && PhoenixUX.mediaPricing[id] && PhoenixUX.mediaPricing[id].disPlay){
					delete PhoenixUX.mediaPricing[id].disPlay;
				}
			} else if (elem.id == 'sugBuy'){
				disBuyCheck.checked = true;
				disBuyCheck.parentNode.classList.add("active");
				disBuyBlock.checked = false;
				disBuyBlock.parentNode.classList.remove("active");

				if (PhoenixUX.mediaPricing && PhoenixUX.mediaPricing[id] && PhoenixUX.mediaPricing[id].disBuy){
					delete PhoenixUX.mediaPricing[id].disBuy;
				}
			}
		}

		if (!PhoenixUX.mediaPricing[id]){
			PhoenixUX.mediaPricing[id] = {};
		}

		PhoenixUX.mediaPricing[id][elem.id] = elem.value ? elem.value : 0;

		// Update the publish fee
		PhoenixUX.updatePubFee();
	}

	PhoenixUX.updatePubFee = function(){
		var pubJSON = PhoenixUX.generateArtifactJSONFromView();

		Phoenix.calculatePublishFee(pubJSON, function(usd, flo){
			var usdDisplay = "";

			if (usd < 0.01){
				var val = usd.toFixed(3);
				if (parseFloat(val) === 0){
					val = 0.001;
				}
				usdDisplay = "~$" + val; 
			} else if (usd < 0.10){
				var val = usd.toFixed(3);

				usdDisplay = "~$" + parseFloat(val); 
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

				if (Phoenix.wallet){
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
			}
		})
	}

	PhoenixUX.changeMediaSelect = function(id, newType, newSubtype){
		var typeSelect = document.getElementById(id).children[3].children[0].children[0];
		var subtypeSelect = document.getElementById(id).children[3].children[0].children[1];

		for (var i = 0; i < typeSelect.children.length; i++) {
			if (typeSelect.children[i].value == newType){
				typeSelect.value = newType;
				PhoenixUX.onMediaSelectChange(typeSelect, true);
			}
		}

		for (var i = 0; i < subtypeSelect.children.length; i++) {
			if (subtypeSelect.children[i].value == newSubtype){
				subtypeSelect.value = newSubtype;
				PhoenixUX.onMediaSelectChange(subtypeSelect);
			}
		}
	}

	PhoenixUX.updateAllSubtypeSelects = function(){
		if (PhoenixUX.mediaFiles){
			for (var j = 0; j < PhoenixUX.mediaFiles.length; j++) {
				var typeSelect = document.getElementById(PhoenixUX.mediaFiles[j].id).children[3].children[0].children[0];

				PhoenixUX.onMediaSelectChange(typeSelect);
			}
		}
	}

	PhoenixUX.onMediaSelectChange = function(elem, manualRun){
		PhoenixUX.mediaChangeSelect = elem;

		var id = elem.parentNode.parentNode.parentNode.id;
		var type = elem.parentNode.children[0].value;
		var secondSelector = elem.parentNode.children[1];

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
						var value;
						var display;
						var subtype;

						if (PhoenixUX.fileSelectTypes[v][i] !== null && typeof PhoenixUX.fileSelectTypes[v][i] === 'object'){
							value = PhoenixUX.fileSelectTypes[v][i].publish;
							display = PhoenixUX.fileSelectTypes[v][i].display;
							subtype = PhoenixUX.fileSelectTypes[v][i].subtype;
						} else {
							value = PhoenixUX.fileSelectTypes[v][i];
							display = PhoenixUX.fileSelectTypes[v][i];
						}

						if (subtype){
							if (PhoenixUX.subtype != subtype)
								continue;
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

			if (!manualRun){
				PhoenixUX.generateArtifactJSONFromView();
			}
		} else if (elem.id === "subtypeSelect") {
			PhoenixUX.mediaPricing[id + 'price'].subtype = elem.value;

			PhoenixUX.generateArtifactJSONFromView();
		}
	}

	PhoenixUX.addPaymentAddress = function(elem){
		if (elem)
			elem.remove();

		var numOfPaymentAddresses = paymentAddressesElement.children.length;

		var content = document.createElement("div");
		content.innerHTML = '\
		<div class="row" id="' + (numOfPaymentAddresses) + '">\
			<div class="input-group col-10" style="margin-bottom: 5px;">\
				<div class="input-group-btn">\
					<button type="button" class="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">\
						<img style="height: 30px" src="./img/Bitcoin.svg">\
					</button>\
					<div class="dropdown-menu">\
						<a style="padding-left:-10px" class="dropdown-item" href="" onclick="PhoenixUI.changePaymentAddressType(this);return false;"><img style="height: 30px" src="./img/Bitcoin.svg"> <span> Bitcoin</span></a>\
						<a style="padding-left:-10px" class="dropdown-item" href="" onclick="PhoenixUI.changePaymentAddressType(this);return false;"><img style="height: 30px" src="./img/FLOflat2.png"> <span> Florincoin</span></a>\
						<a style="padding-left:-10px" class="dropdown-item" href="" onclick="PhoenixUI.changePaymentAddressType(this);return false;"><img style="height: 30px" src="./img/Litecoin.svg"> <span> Litecoin</span></a>\
						<a style="padding-left:-10px" class="dropdown-item" href="" onclick="PhoenixUI.changePaymentAddressType(this);return false;"><img style="height: 30px" src="./img/bch.png"> <span> Bitcoin Cash</span></a>\
					</div>\
				</div>\
				<input type="text" class="form-control" oninput="PhoenixUI.onPaymentAddressChange(this);">\
				<span class="input-group-addon">\
					<input type="radio" name="mainAddressRadio">\
				</span>\
			</div>\
			<div class="col-2">\
				<div class="row justify-content-center align-items-center" style="margin-top: 7px; float: left;">\
					<button class="btn btn-sm btn-outline-danger" onclick="PhoenixUI.removePaymentAddress(this);">-</button>\
					<div style="width: 5px"> </div>\
					<button class="btn btn-sm btn-outline-success" onclick="PhoenixUI.addPaymentAddress(this);">+</button>\
				</div>\
			</div>\
		</div>';

		paymentAddressesElement.appendChild(content.children[0]);
	}

	PhoenixUX.removePaymentAddress = function(elem){
		var paymentRow = elem.parentNode.parentNode.parentNode;
		var id = paymentRow.id;

		if (PhoenixUX.paymentAddresses && PhoenixUX.paymentAddresses[id])
			PhoenixUX.paymentAddresses[id] = {};

		paymentRow.parentNode.removeChild(paymentRow);

		PhoenixUX.updatePubFee();
	}

	PhoenixUX.changePaymentAddressType = function(elem){
		// Save the changed type into the payment array
		var dropdownImgSrc = elem.children[0].src;

		if (dropdownImgSrc.includes('Bitcoin') && !dropdownImgSrc.includes('Cash'))
			dropdownImgSrc = "./img/Bitcoin.svg";
		else if (dropdownImgSrc.includes('FLO'))
			dropdownImgSrc = "./img/FLOflat2.png";
		else if (dropdownImgSrc.includes('Litecoin'))
			dropdownImgSrc = "./img/Litecoin.svg";
		else if (dropdownImgSrc.includes('Bitcoin') && dropdownImgSrc.includes('Cash'))
			dropdownImgSrc = "./img/bch.svg";

		elem.parentElement.parentElement.children[0].children[0].src = dropdownImgSrc;

		// Update the validation state of the input for this element
		PhoenixUX.onPaymentAddressChange(elem.parentElement.parentElement.parentElement.children[1]);

		// Return false to prevent page reload
		return false;
	}

	PhoenixUX.setPaymentAddressType = function(elem, type){
		// Save the changed type into the payment array
		var dropdownImgSrc = "";

		if (type === "BTC")
			dropdownImgSrc = "./img/Bitcoin.svg";
		else if (type === "FLO")
			dropdownImgSrc = "./img/FLOflat2.png";
		else if (type === "LTC")
			dropdownImgSrc = "./img/Litecoin.svg";
		else if (type === "BCH")
			dropdownImgSrc = "./img/bch.png";

		// Set the icon
		elem.children[0].children[0].children[0].children[0].src = dropdownImgSrc;

		// Update the validation state of the input for this element
		PhoenixUX.onPaymentAddressChange(elem.children[0].children[1]);

		// Return false to prevent page reload
		return false;
	}

	PhoenixUX.onPaymentAddressChange = function(elem, dontGen){
		try {
			// Validate the address based on the type of cryptocurrency currently selected
			var typeSelected = elem.parentElement.children[0].children[0].children[0].src;

			if (typeSelected.includes('Bitcoin') && !typeSelected.includes('Cash'))
				typeSelected = 'BTC';
			else if (typeSelected.includes('FLO'))
				typeSelected = 'FLO';
			else if (typeSelected.includes('Litecoin'))
				typeSelected = 'LTC';
			else if (typeSelected.includes('bch'))
				typeSelected = 'BCH';

			var id = elem.parentElement.parentElement.id;

			var valid = WAValidator.validate(elem.value, typeSelected);
			if(valid){
				elem.style['border-color'] = '#5cb85c'; // Green outline

				PhoenixUX.paymentAddresses[id] = {currency: typeSelected, address: elem.value};

				// Generate Artifact JSON and to save the draft
				if (!dontGen)
					PhoenixUX.generateArtifactJSONFromView();
			} else {
				elem.style['border-color'] = '#d9534f'; // Red outline

				var pmntTmp = PhoenixUX.paymentAddresses[id];
				delete pmntTmp[id];
				PhoenixUX.paymentAddresses = JSON.parse(JSON.stringify(pmntTmp));
			}
		} catch (e) {
			elem.style['border-color'] = '#d9534f';
			return false;
		}
	}

	PhoenixUX.onTipsInput = function(elem, ignoreTypingHelpers){
		var id = elem.id.replace('tip','');

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

		if (elem.value == "")
			delete PhoenixUX.advancedPricing[id];
		else {
			// Truncate zeros
			elem.value = parseInt(elem.value);
			PhoenixUX.advancedPricing[id] = elem.value;
		}

		PhoenixUI.updatePubFee();
	}

	PhoenixUX.onFileNameInput = function(elem){
		var id = elem.parentElement.parentElement.id + 'price';

		if (!PhoenixUX.mediaPricing[id]){
			PhoenixUX.mediaPricing[id] = {};
		}

		PhoenixUX.mediaPricing[id].displayName = elem.value;
	}

	PhoenixUX.bulkUploadCSVSelect = function(elem){
		// Check for the various File API support.
		if (window.File && window.FileReader && window.FileList && window.Blob) {
			//do your stuff!
			var reader = new FileReader();

			reader.onload = function(event){
				PhoenixUX.bulkCSVJSON = csv2JSON(event.target.result);

				colIdSelectorElement.innerHTML = "";
				colFilesSelectorElement.innerHTML = "";

				for (var col in PhoenixUX.bulkCSVJSON[0]){
					var x = document.createElement('option');
					var y = document.createElement('option');
					x.value = PhoenixUX.bulkCSVJSON[0][col];
					y.value = PhoenixUX.bulkCSVJSON[0][col];
					x.innerHTML = PhoenixUX.bulkCSVJSON[0][col];
					y.innerHTML = PhoenixUX.bulkCSVJSON[0][col];
					colIdSelectorElement.appendChild(x);
					colFilesSelectorElement.appendChild(y);
				}

				PhoenixUX.updateBulkSelects();
			}

		  reader.readAsText(elem.files[0]);
		} else {
		  alert('The File APIs are not fully supported by your browser.');
		}
	}

	PhoenixUX.updateBulkSelects = function(){
		var idSel = colIdSelectorElement.value;
		var filesSel = colFilesSelectorElement.value;

		bulkColDetails.innerHTML = '';
		bulkColDetails.style.display = 'block';

		selIdColElement.style.display = "flex";
		selFilesColElement.style.display = "flex";

		for (var col in PhoenixUX.bulkCSVJSON[0]){
			if (idSel == PhoenixUX.bulkCSVJSON[0][col] || filesSel == PhoenixUX.bulkCSVJSON[0][col])
				continue;

			// bulkColDetails.innerHTML += '<div class="form-group row">\
			// 							<label for="staticEmail" class="col-sm-4 col-form-label">' + PhoenixUX.bulkCSVJSON[0][col] + '</label>\
			// 							<div class="col-sm-8">\
			// 								<input type="text" class="form-control" placeholder="artifact." id="BulkCol' + PhoenixUX.bulkCSVJSON[0][col] + '">\
			// 							</div>\
			// 						</div>';

			var colName = PhoenixUX.bulkCSVJSON[0][col];

			var inputStart = "artifact.";

			switch(colName){
				case "Type":
					inputStart = "artifact.type";
					break;
				case "Title":
					inputStart = "artifact.info.title";
					break;
				case "Description":
					inputStart = "artifact.info.description";
					break;
				case "Artist":
					inputStart = "artifact.info.extraInfo.artist";
					break;
				case "Year":
					inputStart = "artifact.info.year";
					break;
				case "Payment":
					inputStart = "artifact.payment";
					break;
				case "Network":
					inputStart = "artifact.storage.network";
					break;
				case "Director":
					inputStart = "artifact.info.extraInfo.director";
					break;
				case "Distributor":
					inputStart = "artifact.info.extraInfo.distributor";
					break;
			}

			var formGroupDiv = document.createElement("div");
			formGroupDiv.classList = ["form-group row"];
			var label = document.createElement("label");
			label.classList = ["col-4 col-form-label"];
			label.innerHTML = colName;
			var inputDiv = document.createElement("div");
			inputDiv.classList = ["col-8"];
			var input = document.createElement("input");
			input.type = "text";
			input.classList = ["form-control"];
			input.value = inputStart;
			input.id = "BulkCol" + colName;

			formGroupDiv.appendChild(label);
			inputDiv.appendChild(input);
			formGroupDiv.appendChild(inputDiv);

			bulkColDetails.appendChild(formGroupDiv);
		}
	}

	PhoenixUX.handleBulkUpload = function (file){
		PhoenixUX.bulkFiles.push(file);

		var updateProg = function(){
			var amountOfFilesComplete = PhoenixUX.bulkFilesComplete.length;
			var bulkfilesLength = PhoenixUX.bulkFiles.length;
			var amountOfFiles = bulkfilesLength + amountOfFilesComplete;

			var percentDoneOverall = (amountOfFilesComplete/amountOfFiles * 100);

			bulkProgressBarElement.innerHTML = "Uploading... (" + amountOfFilesComplete + "/" + amountOfFiles + " done!)";
			bulkProgressBarElement.style.width = percentDoneOverall + "%";

			if (percentDoneOverall == 100){
				bulkProgressBarElement.innerHTML = "Upload Complete! (Uploaded " + amountOfFilesComplete + " Files)";
			}
		}

		var prepend = file.name.split('.')[0];
		var newName = file.name.replace(prepend + '.', '');

		Phoenix.uploadFileToTus(file, function(success){ 
			var id = success;

			var bulk = PhoenixUX.bulkFiles;

			bulkProgressBarInfoElement.innerHTML = "Upload of \"" + file.name + "\" Complete";

			for (var i = 0; i < bulk.length; i++) {
				if (bulk[i] == file)
					PhoenixUX.bulkFiles.splice(i, 1);
			}

			PhoenixUX.bulkFilesComplete.push({file: file, id: id});

			updateProg();
		}, function(error){ console.log(error) }, function(percent){
			updateProg();
		}, newName, true);
	}

	PhoenixUX.bulkPublish = function(){
		var inputs = [];
		var artifactJSONs = [];

		var idSel = colIdSelectorElement.value;
		var filesSel = colFilesSelectorElement.value;

		if (!PhoenixUX.bulkCSVJSON){
			return;
		}

		for (var artifact = 1; artifact < PhoenixUX.bulkCSVJSON.length; artifact++){
			var artCSVRow = PhoenixUX.bulkCSVJSON[artifact];
			var artifactJSON = {
				artifact: {
					info: {

					},
					storage: {
						network: "IPFS"
					}
				}
			};

			var idColVal, fileColVal;

			for (var col = 0; col < artCSVRow.length; col++){
				if (idSel == PhoenixUX.bulkCSVJSON[0][col]){
					idColVal = artCSVRow[col];
					continue;
				}

				if (filesSel == PhoenixUX.bulkCSVJSON[0][col]){
					fileColVal = artCSVRow[col];
					continue;
				}

				//console.log(col);
				try {
					var columnInput = document.getElementById('BulkCol' + PhoenixUX.bulkCSVJSON[0][col]).value;
				} catch (e){
					// error for some reason, just skip this node.
					continue;
				}

				var path = columnInput.split('.');

				var value = artCSVRow[col];

				try {
					var tmpValue =  JSON.parse("["+value.replace(/^\n+|\n+$/g, "").replace(/\n+/g, ",").replace(/'\b/g, "\u2018").replace(/\b'/g, "\u2019").replace(/"\b/g, "\u201c").replace(/\b"/g, "\u201d").replace(/--/g,  "\u2014").replace(/\b\u2018\b/g,  "'")+"]")[0];
					console.log(tmpValue);
					value = tmpValue;
				} catch (e) { console.log(e); /* do nothing */ }

				if (path.length == 1){
					artifactJSON[path[0]] = value;
				} else if (path.length == 2) {
					if (!artifactJSON[path[0]]){
						artifactJSON[path[0]] = {}
					}

					artifactJSON[path[0]][path[1]] = value;
				} else if (path.length == 3) {
					if (!artifactJSON[path[0]]){
						artifactJSON[path[0]] = {}
					}
					if (!artifactJSON[path[0]][path[1]]){
						artifactJSON[path[0]][path[1]] = {}
					}

					artifactJSON[path[0]][path[1]][path[2]] = value;
				} else if (path.length == 4) {
					if (!artifactJSON[path[0]]){
						artifactJSON[path[0]] = {}
					}
					if (!artifactJSON[path[0]][path[1]]){
						artifactJSON[path[0]][path[1]] = {}
					}
					if (!artifactJSON[path[0]][path[1]][path[2]]){
						artifactJSON[path[0]][path[1]][path[2]] = {}
					}

					artifactJSON[path[0]][path[1]][path[2]][path[3]] = value;
				} else if (path.length > 4) {
					// Don't allow more than 4.
				}
			}

			var fileSearch = [];
			var filesJSON = [];

			var splitFiles = fileColVal.split(';');

			if (splitFiles.length > 0){
				fileColVal = splitFiles;
			}


			if (typeof fileColVal == "string"){
				fileSearch.push(fileColVal)
				filesJSON.push({fname: fileColVal});
			}

			if (Array.isArray(fileColVal)){
				for (var i in fileColVal){
					try {
						fileColVal[i] = JSON.parse("["+fileColVal[i].replace(/^\n+|\n+$/g, "").replace(/\n+/g, ",")+"]")[0];
					} catch (e) { }

					if (typeof fileColVal[i] == "string"){
						fileSearch.push(fileColVal[i]);
						filesJSON.push({fname: fileColVal[i]});
					} else if (typeof fileColVal[i] == "object"){
						fileSearch.push(fileColVal[i].fname);
						filesJSON.push(fileColVal[i]);
					}
				}
			} else if (typeof fileColVal == "object"){
				fileSearch.push(fileColVal.fname);
				filesJSON.push(fileColVal);
			}

			if (fileSearch.length == 0)
				continue;

			var tusFiles = [];

			//console.log(idColVal);
			for (var i in fileSearch){
				// console.log(fileSearch[i])
				for (var x in Phoenix.bulkTusFiles){
					// console.log(PhoenixUX.bulkFilesComplete[x])
					var tmpStr = Phoenix.bulkTusFiles[x].name;
					if (fileSearch[i] === tmpStr.replace(idColVal + '.', '')){
						tusFiles.push(Phoenix.bulkTusFiles[x]);
					}
				}
			}

			artifactJSON.artifact.storage.files = filesJSON;

			var wipObj = {
				artifactJSON: artifactJSON,
				tusFiles: tusFiles
			}

			console.log(wipObj);

			Phoenix.addAndPublishWIP(wipObj);
		}

		showArtifactPage();
	}

	PhoenixUX.notify = function(message, type){
		$.notify({
			// options
			icon: 'glyphicon glyphicon-warning-sign',
			message: message
		},{
			// settings
			element: 'body',
			position: null,
			type: type,
			allow_dismiss: true,
			newest_on_top: true,
			showProgressbar: false,
			placement: {
				from: "top",
				align: "right"
			},
			offset: {x: 20, y: 70},
			spacing: 10,
			z_index: 1031,
			delay: 5000,
			timer: 1000,
			url_target: '_blank',
			mouse_over: null,
			animate: {
				enter: 'animated fadeInDown',
				exit: 'animated fadeOutUp'
			},
			onShow: null,
			onShown: null,
			onClose: null,
			onClosed: null,
			icon_type: 'class',
			template: '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0}" role="alert">' +
				'<button type="button" aria-hidden="true" class="close" data-notify="dismiss">×</button>' +
				'<span data-notify="icon"></span> ' +
				'<span data-notify="title">{1}</span> ' +
				'<span data-notify="message">{2}</span>' +
				'<div class="progress" data-notify="progressbar">' +
					'<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
				'</div>' +
				'<a href="{3}" target="{4}" data-notify="url"></a>' +
			'</div>' 
		});
	}

	PhoenixUX.toggleAdvanced = function(elem){
		advancedSettingsElement.style.display = (advancedSettingsElement.style.display == "none" ? "flex" : "none");
		elem.innerHTML = (advancedSettingsElement.style.display == "none" ? "Show Advanced Settings <span class=\"icon icon-chevron-down\"></span>" : "Hide Advanced Settings <span class=\"icon icon-chevron-up\"></span>");
	}

	PhoenixUX.hideAdvanced = function(elem){
		advancedSettingsElement.style.display = "none";
	}

	PhoenixUX.onIntInputUpdate = function(elem){

	}

	PhoenixUX.generateDraftRows = function(){
		draftTBodyElement.innerHTML = "";

		var oneMade = false;
		for (var i in Phoenix.wipArtifacts) {
			if (Phoenix.wipArtifacts[i].artifactJSON.artifact){
				oneMade = true;
				draftTBodyElement.innerHTML += '<tr id="' + i + '">\
					<th scope="row"></th>\
					<td>' + Phoenix.wipArtifacts[i].artifactJSON.artifact.type + '</td>\
					<td>' + (Phoenix.wipArtifacts[i].artifactJSON.artifact.info.title ? Phoenix.wipArtifacts[i].artifactJSON.artifact.info.title : "") + '</td>\
					<td>\
						<button class="btn btn-outline-info" onClick="PhoenixUI.resumeWIP(this);"><span class="icon icon-pencil"></span> Resume</button>\
						<button class="btn btn-outline-danger" onClick="PhoenixUI.deleteWIP(this);"><span class="icon icon-trash"></span> Delete</button>\
					</td>\
				</tr>';
			}	
		}

		if (oneMade){
			draftOrElement.style.display = "block";
			draftTableElement.style.display = "table";
		} else {
			draftOrElement.style.display = "none";
			draftTableElement.style.display = "none";
		}
	}

	PhoenixUX.resumeWIP = function(elem){
		var id = elem.parentNode.parentNode.id;
		Phoenix.currentWIPID = id;
		PhoenixUX.loadWIPIntoPublisher(Phoenix.wipArtifacts[Phoenix.currentWIPID]);
		showWizardPage();
	}

	PhoenixUX.startNewWIP = function(){
		Phoenix.createWIPArtifact(function(id){
			PhoenixUX.loadWIPIntoPublisher(Phoenix.wipArtifacts[Phoenix.currentWIPID]);
			showWizardPage();
		})
	}

	PhoenixUX.deleteWIP = function(elem){
		var id = elem.parentNode.parentNode.id;
		console.log(id);
		delete Phoenix.wipArtifacts[id];
		Phoenix.currentWIPID = undefined;
		Phoenix.saveWIPArtifacts();
		PhoenixUX.generateDraftRows();
	}

	PhoenixUX.drawArtifacts = function(){
		artifactsTBodyElement.innerHTML = "";

		for (var i = 0; i < Phoenix.pendingUploadQueue.length; i++){
			var overallPer = 0;
			var complete = 0;
			var incomplete = 0;
			var total = 0;
			var uploadComplete = true;
			for (var j = 0; j < Phoenix.pendingUploadQueue[i].tusFiles.length; j++) {
				if (!Phoenix.pendingUploadQueue[i].tusFiles[j])
					continue;

				total++;

				if (Phoenix.pendingUploadQueue[i].tusFiles[j].progress)
					overallPer += parseFloat(Phoenix.pendingUploadQueue[i].tusFiles[j].progress);

				if (Phoenix.pendingUploadQueue[i].tusFiles[j].progress && parseFloat(Phoenix.pendingUploadQueue[i].tusFiles[j].progress) === 100  && !Phoenix.pendingUploadQueue[i].tusFiles[j].error){
					complete++;
				} else {
					uploadComplete = false;
					incomplete++;
				}
			}
			overallPer = overallPer / total;

			var state = "uploading";

			if (Phoenix.pendingUploadQueue[i].ipfsAddStart){
				state = "adding_to_ipfs"
			}

			var title = "";

			try { title = Phoenix.pendingUploadQueue[i].artifactJSON.artifact.info.title; } catch(e){}
			var str = '<tr class="table-' + (state === "uploading" ? "warning" : "info") + '">\
				<th scope="row"><span class="badge badge-' + (state === "uploading" ? "warning" : "info") + '">' + (state === "uploading" ? "Uploading" : "Adding to IPFS") + '</span</th>\
				<td><code>' + title + '</code></td>\
				<td>\
					<div class="progress">\
						<div class="progress-bar progress-bar-animated progress-bar-striped bg-' + (state === "adding_to_ipfs" ? 'info' : 'warning') + '" role="progressbar" style="width: ' + overallPer + '%">' + (state === "adding_to_ipfs" ? 'Adding files to IPFS...' : 'Uploaded ' + complete + '/' + total + ' Files (' + parseFloat(overallPer).toFixed(0) + '%)') + '</div>\
					</div>\
				</td>\
				<td>\
					<button class="btn btn-no-pad btn-outline-info btn-background-white">More Info</button>\
				</td>\
			</tr>';

			artifactsTBodyElement.innerHTML += str;
		}

		PhoenixUX.successfulTXIDs = [];
		PhoenixUX.processingArtifacts = [];

		for (var i in Phoenix.artifacts){
			for(var j in Phoenix.artifacts[i]){
				PhoenixUX.successfulTXIDs.push(Phoenix.artifacts[i][j].txid);
			}
		}

		for (var i in Phoenix.disabledArtifactTXIDs){
			PhoenixUX.successfulTXIDs.push(Phoenix.disabledArtifactTXIDs[i]);
		}

		for (var i in Phoenix.publishedArtifacts){
			var match = false;
			for (var j in Phoenix.publishedArtifacts[i].txs){
				for (var k in PhoenixUX.successfulTXIDs){
					if (Phoenix.publishedArtifacts[i].txs[j].txid === PhoenixUX.successfulTXIDs[k]){
						match = true;
					}
				}
			}

			if (!match){
				if (Phoenix.currentPublisher.address === Phoenix.publishedArtifacts[i].publisher)
					PhoenixUX.processingArtifacts.push(Phoenix.publishedArtifacts[i]);
			}
		}

		if (PhoenixUX.processingArtifacts.length > 0){
			Phoenix.pendingArtifact = true;
		} else {
			Phoenix.pendingArtifact = false;
		}

		for (var i in PhoenixUX.processingArtifacts){
			var title = "";
			try { title = PhoenixUX.processingArtifacts[i].artifactJSON['oip-041'].artifact.info.title; } catch(e){}
			var markup = '<tr class="table-secondary">\
				<th scope="row"><span class="badge badge-secondary">Processing</span></th>\
				<td><code>' + title + '</code></td>\
				<td>\
					<div class="progress">\
						<div class="progress-bar progress-bar-animated progress-bar-striped bg-secondary" role="progressbar" style="width: 100%;" aria-valuenow="65" aria-valuemin="0" aria-valuemax="100">Waiting for Artifact to be picked up by Front End</div>\
					</div>\
				</td>\
				<td>\
					<button class="btn btn-no-pad btn-outline-info btn-background-white">More Info</button>\
				</td>\
			</tr>';

			artifactsTBodyElement.innerHTML += markup;
		}

		var current = Phoenix.currentArtifactPublish;
		var waiting = Phoenix.publishQueue;

		if (current && current.artifactJSON){
			var progress = 0;

			if (Phoenix.currentArtifactPublish.txs && Phoenix.currentArtifactPublish.txs.length && Phoenix.currentArtifactPublish.splitStrings && Phoenix.currentArtifactPublish.splitStrings.length)
				progress = Phoenix.currentArtifactPublish.txs.length / Phoenix.currentArtifactPublish.splitStrings.length;

			var title = "";
			try { title = current.artifactJSON['oip-041'].artifact.info.title; } catch(e){}
			artifactsTBodyElement.innerHTML += '<tr class="table-primary">\
				<th scope="row"><span class="badge badge-primary">Publishing</span></th>\
				<td><code>' + title + '</code></td>\
				<td>\
					<div class="progress">\
						<div class="progress-bar progress-bar-animated progress-bar-striped bg-primary" role="progressbar" style="width: ' + (progress*100) + '%"></div>\
					</div>\
				</td>\
				<td>\
					<button class="btn btn-no-pad btn-outline-info btn-background-white">More Info</button>\
				</td>\
			</tr>';
		}		

		if (waiting.length > 0) {
			for (var i = 0; i < waiting.length; i++) {
				var title = "";
				try { title = waiting[i].artifactJSON['oip-041'].artifact.info.title; } catch(e){}
				artifactsTBodyElement.innerHTML += '<tr class="table-secondary">\
					<th scope="row"><span class="badge badge-secondary">Waiting</span></th>\
					<td><code>' + title + '</code></td>\
					<td>\
						<div class="progress">\
							<div class="progress-bar" role="progressbar" style="width: 0%"></div>\
						</div>\
					</td>\
					<td>\
						<button class="btn btn-no-pad btn-outline-info btn-background-white">More Info</button>\
					</td>\
				</tr>';
			}
		}

		for (var i = PhoenixUX.curArtifacts.length - 1; i >= 0; i--) {
			var skip = false;
			for (var j in Phoenix.disabledArtifactTXIDs){
				if (PhoenixUX.curArtifacts[i].txid === Phoenix.disabledArtifactTXIDs[j])
					skip = true;
			}

			if (skip)
				continue;
			
			var title = "";
			try { 
				if (PhoenixUX.curArtifacts[i]['oip-041'])
					title = PhoenixUX.curArtifacts[i]['oip-041'].artifact.info.title; 
				else 
					continue;
			} catch(e){}
			
			artifactsTBodyElement.innerHTML += '<tr>\
					<th scope="row"><span class="badge badge-success">Active</span></th>\
					<td colspan="2" style="text-align: left;"><code>' + title + '</code></td>\
					<td>\
						<a class="btn btn-no-pad btn-outline-info" href="' + Phoenix.browserURL + PhoenixUX.curArtifacts[i].txid.substring(0, 6) + '">View</a>\
						<button class="btn btn-no-pad btn-outline-danger" onClick="Phoenix.deactivateArtifact(\'' + PhoenixUX.curArtifacts[i].txid + '\');">Deactivate</button>\
					</td>\
				</tr>';
		}
	}

	PhoenixUX.updateBalanceDisplay = function(){
		var wallet = Phoenix.getWallet();

		var totalBalance = wallet.getTotalBalance() || 0;

		var knownBal = 0;

		for (var i in wallet.known_unspent){
			var spent = false;
			for (var j in wallet.known_spent){
				if (wallet.known_unspent[i].txid === wallet.known_spent[j].txid){
					spent = true;
				}
			}
			if (!spent){
				knownBal += parseFloat(wallet.known_unspent[i].amount);
			}
		}

		if (knownBal > 0){
			totalBalance = knownBal;
		}
		
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

		Phoenix.getMarketData(function(data){ 
			marketData = data; 
			perBTC = marketData.USD/marketData.weighted;
			var FLOUSD = marketData.USD;


			var totalWalletBalanceInUSD = (parseFloat(walletBalanceElement.value)*parseFloat(FLOUSD)).toFixed(2);
			walletBalanceUSDElement.innerHTML = '$' + totalWalletBalanceInUSD;
		})
	}

	return PhoenixUX;
})();

function csv2JSON(csv){
	var data = Papa.parse(csv);

	return data.data;
}
