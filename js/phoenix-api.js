// Phoenix-API runs all of the background processes used by the publisher. 
// It emits events with info when things happen that have example definitions in `phoenix-ui.js`. 
// This allows you to subscribe to happening events to update your UI.


var PhoenixEvents = {};
_.extend(PhoenixEvents, Backbone.Events);

var librarianHost = "https://api.alexandria.io";

var PhoenixStatus = {
	status: 'waiting', 
	pubQueue: [], // Artifacts that are being published are added to the pubQueue.
	currentPublisher: { // This is the currently selected "Publisher"
		publisherAddress: 'floAddr',
		publisherName: 'Sky'
	}, 
	publishers: [{ // This contains all of the available publishers for the wallet. You can use this to select a new user.
		publisherAddress: '',
		publisherName: ''
	}], 
	artifacts: {
		pubAddress: [{},{}]
	},
	wallet: {},
	ipfs: {
		ipfs: {}, // The actual IPFS object currently being used
		host: '',
		port: '',
		protocol: ''
	}
}

var Phoenix = (function() {	
	var PhoenixAPI = {};
	// Load info from LibraryD
	PhoenixAPI.searchAPI = function(module, searchOn, searchFor) {
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

	// Used to login. Should we call this Sync or Async?
	PhoenixAPI.login = function(identifier, password){
		// Trigger the onLogin event
		PhoenixEvents.trigger("onLogin", {});

		if (!identifier || !password){
			if (typeof(Storage) !== "undefined") {
				if (localStorage.getItem("identifier") != ''){
					identifier = localStorage.identifier;
					password = CryptoJS.AES.decrypt(localStorage.loginWalletEnc, identifier).toString(CryptoJS.enc.Utf8);

					// If we are on the login page and there is login info, then we should redirect to the dashboard.
					// if (window.location.pathname.includes('login.html') || !window.location.pathname.includes('.html')){
					// 	window.location.href = 'index.html';
					// }
				} else {
					PhoenixEvents.trigger("onLoginFail", "Missing identifier or password and none found in localStorage!")
					// if (window.location.pathname.includes('index.html')){
					// 	window.location.href = 'login.html';
					// 	return;
					// }
				}
			} else {
				PhoenixEvents.trigger("onLoginFail", "Missing identifier or password and HTML5 LocalStorage is not supported.")
			    // console.log('No Support for storing locally.')
			}
		}
		$.get(flovaultBaseURL + "/wallet/checkload/" + identifier, function (response) {
			if (response.gauth_enabled) {
				// ToDo: add 2FA support, needs further research
				PhoenixEvents.trigger("onLoginFail", { 
					title: "Error!", 
					type: "error", 
					message: "Two Factor Authentication is not currently supported, please disable it or create a new wallet." 
				});
			}
			PhoenixAPI.wallet = new Wallet(response.identifier, password);
			PhoenixAPI.wallet.load(function () {
				PhoenixEvents.trigger("onLoginSuccess", {});
				PhoenixEvents.trigger("onWalletLoad", PhoenixAPI.wallet);

				PhoenixAPI.getPublishersFromLibraryD();
			});
		});

		// If remember me is false then wipe the data, we just needed to store it until after redirect
		if (localStorage["remember-me"] == "false"){
			localStorage.identifier = '';
			localStorage.loginWalletEnc = '';
		}

		// This should only be filled if the user just signed up and their data cannot be found in LibraryD yet.
		if (localStorage.justSignedUp == "true"){
			var data = localStorage.justSignedUpData.split('/');

			var inwal = false;
			for (var addr in wallet.addresses){
				if (addr == data[0])
					inwal = true;
			}

			if (inwal){
				$.getJSON(librarianHost + "/alexandria/v1/publisher/get/all", function( data ) {
					var addrInPubs = false;
					for (var i = 0; i < data.length; i++) {
						//console.log(data[i]["publisher-data"]["alexandria-publisher"]);
						for (var addr in wallet.addresses) {
							var address = wallet.addresses[addr].addr;
							if (data[i]["publisher-data"]["alexandria-publisher"].address == address){
								addrInPubs = true;
							}
						}
					}

					// If LibraryD has picked up the publisher, we can wipe the data in the localstorage
					if (addrInPubs){
						localStorage.justSignedUp = '';
						localStorage.justSignedUpData = '';
					}
				});
			} else {
				PhoenixEvents.trigger("onLoginFail", { message: "Unable to find publisher address inside of the loaded wallet for the just signed up data." });
			}
		}

		PhoenixEvents.trigger("onLoginSuccess", "Success");
	}

	PhoenixAPI.logout = function(){
		localStorage.identifier = '';
		localStorage.loginWalletEnc = '';
		window.location.href = 'login.html';
	}

	PhoenixAPI.getPublishersFromLibraryD = function(){
		var wallet = this.wallet;

		try {
			$.getJSON(librarianHost + "/alexandria/v2/publisher/get/all", function( data ) {
				var myPublishers = [];

				for (var i = 0; i < data.length; i++) {
					//console.log(data[i]["publisher-data"]["alexandria-publisher"]);
					for (var addr in wallet.addresses) {
						var walletAddress = wallet.addresses[addr].addr;
						var publisher = data[i]["publisher-data"]["alexandria-publisher"];
						if (publisher.address == walletAddress){
							myPublishers.push(publisher);
							
						}
					}
				}

				if (myPublishers.length == 0){
					PhoenixEvents.trigger("onPublisherLoadFailure", { message: 'No publishers found in LibraryD that match any wallet addresses.' });
				} else {
					PhoenixAPI.publishers = myPublishers;
					PhoenixEvents.trigger("onPublisherLoadSuccess", PhoenixAPI.publishers);
				}

				for (var pub in myPublishers)
					PhoenixAPI.loadArtifactsForPub(myPublishers[pub].address);
			});
		} catch (e) {
			PhoenixEvents.trigger('onError', {message: e});
		}
	}

	PhoenixAPI.loadArtifactsForPub = function(pubAddress){
		var results = PhoenixAPI.searchAPI('media', 'publisher', pubAddress);

		if (!PhoenixAPI.artifacts)
			PhoenixAPI.artifacts = {}

		PhoenixAPI.artifacts[pubAddress] = results;
		PhoenixEvents.trigger('onArtifactsLoad', {address: pubAddress, results: results})
	}

	PhoenixAPI.getWallet = function(){
		return this.wallet;
	}


	// Be sure to fill artifact.files with an array of input selectors.
	PhoenixAPI.publishArtifact = function(artifact){
		PhoenixEvents.trigger("testEvent", "test");
	}

	PhoenixAPI.getMarketData = function(callback){
		$.getJSON("https://api.alexandria.io/flo-market-data/v1/getAll", function(data){
			PhoenixAPI.marketData = data;
			callback(data);
		})
	}

	PhoenixAPI.deactivateArtifact = function(artifactTxid){
		try {
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
				var results = PhoenixAPI.searchAPI('media', 'txid', artifactTxid);

				if (!results){
					console.error("ERR: No results from API when trying to Deactivate TXID: " + artifactTxid);
					PhoenixEvents.trigger('onArtifactDeactivateFail', "ERR: No results from API when trying to Deactivate TXID: " + artifactTxid);
					return;
				}

				var artPublisher;
				if (results[0]["media-data"]){
					artPublisher = results[0]["media-data"]["alexandria-media"].publisher;
				} else if (results[0]["oip-041"]){
					artPublisher = results[0].publisher;
				}

				LibraryDJS.sendDeactivationMessage(PhoenixAPI.wallet, artPublisher, artifactTxid, function(error, response){
					if (error) {
						PhoenixEvents.trigger('onArtifactDeactivateFail', error);
						return;
					}

					//PhoenixAPI.artifacts[artPublisher]

					PhoenixEvents.trigger('onArtifactDeactivateSuccess', response, artifactTxid);
				});
			});
		} catch (e) {
			console.log(e);
			// Most likely an issue with Sweet alert, abort for now.
		}
	}	

	PhoenixAPI.calculatePublishFee = function(artSize, minPlayArray, sugBuyArray, callback){
		PhoenixAPI.updateMarketData(function(marketData){
			PhoenixAPI.updateLibrarydInfoData(function(libraryDData){
				var USDperFLO = marketData.USD;
				var floPerKb = 0.1; // new endpoint, using 0.1 as default for now, ToDo: Update this when changes are made!
				var pubFeeFreeFlo = (artSize / 1024) * floPerKb;
				var pubFeeFreeUSD = pubFeeFreeFlo * USDperFLO;

				var totMinPlay = 0;
				for (var i = 0; i < minPlayArray.length; i++) {
					totMinPlay += minPlayArray[i];
				}

				var totSugBuy = 0;
				for (var i = 0; i < sugBuyArray.length; i++) {
					totSugBuy += sugBuyArray[i];
				}

				var artCost = (totMinPlay + totSugBuy) / 2; // divide by 2 because there are two inputs

				var avgArtCost = libraryDData.avgArtCost;

				var pubFeeComUSD = (( Math.log(artCost) - Math.log(avgArtCost) ) * (avgArtCost / artCost) * (artCost - avgArtCost)) + avgArtCost;
				var pubFeeComFlo = pubFeeComUSD / USDperFLO;
				var pubFeeUSD = Math.max(pubFeeFreeUSD, pubFeeComUSD);
				var pubFeeFlo = pubFeeUSD / USDperFLO;

				callback(pubFeeUSD, pubFeeFlo);
			})
		})
				
	}

	PhoenixAPI.updateMarketData = function(callback){
		if (!callback)
			callback = function(){};

		var timeNow = Date.now();
		var yesterday = timeNow - (24*60*60*1000);
		if (PhoenixAPI.marketData && PhoenixAPI.marketData.timestamp > yesterday){
			callback(PhoenixAPI.marketData.data);
		} else {
			if (!PhoenixAPI.marketData)
				PhoenixAPI.marketData = {};

			$.getJSON(librarianHost + "/flo-market-data/v1/getAll", function( data ) {
				PhoenixAPI.marketData.timestamp = Date.now();
				PhoenixAPI.marketData.data = data;

				callback(data);
			});
		}		
	}

	PhoenixAPI.updateLibrarydInfoData = function(callback){
		// ToDo: this

		if (!callback)
			callback = function(){};

		if (!PhoenixAPI.librarydInfo)
			PhoenixAPI.librarydInfo = {};
	
		$.getJSON(librarianHost + "/alexandria/v2/info", function( data ) {
			PhoenixAPI.librarydInfo.timestamp = Date.now();
			PhoenixAPI.librarydInfo.data = data;

			callback(data);
		});
	}

	return PhoenixAPI;
})();

Phoenix.login();