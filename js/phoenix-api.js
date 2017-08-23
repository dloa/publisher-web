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

	PhoenixAPI.tusIPFSEndpoint = "https://ipfs-tus.alexandria.io";
	PhoenixAPI.tusFiles = [];
	PhoenixAPI.publishQueue = [];
	PhoenixAPI.publishState = "Loading";
	PhoenixAPI.wipArtifacts = {};
	PhoenixAPI.pendingUploadQueue = [];

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

				PhoenixAPI.publishState = "Ready";

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

			PhoenixAPI.wallet = new Wallet(data[0], data[1]);
			PhoenixAPI.wallet.load(function () {
				PhoenixEvents.trigger("onLoginSuccess", {});
				PhoenixEvents.trigger("onWalletLoad", PhoenixAPI.wallet);

				PhoenixAPI.getPublishersFromLibraryD();
			});

			var inwal = false;
			for (var addr in PhoenixAPI.wallet.addresses){
				if (addr == data[0])
					inwal = true;
			}

			if (inwal){
				$.getJSON(librarianHost + "/alexandria/v1/publisher/get/all", function( data ) {
					var addrInPubs = false;
					for (var i = 0; i < data.length; i++) {
						//console.log(data[i]["publisher-data"]["alexandria-publisher"]);
						for (var addr in PhoenixAPI.wallet.addresses) {
							var address = PhoenixAPI.wallet.addresses[addr].addr;
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

	PhoenixAPI.loadWIPArtifacts = function(callback){
		try {
			var localWIP = JSON.parse(localStorage.wipArtifacts);
			PhoenixAPI.wipArtifacts = localWIP;
		} catch (e) {
			PhoenixAPI.wipArtifacts = {};
		}
	}

	PhoenixAPI.saveWIPArtifacts = function(callback){
		localStorage.wipArtifacts = JSON.stringify(PhoenixAPI.wipArtifacts);
	}

	PhoenixAPI.createWIPArtifact = function(callback){
		// This UniqueID is just an internal ID that we reference the draft artifact by.
		var uniqueID = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 10);

		var newWIPArtifact = {
			artifactJSON: {},
			files: [],
			tusFiles: []
		}

		PhoenixAPI.wipArtifacts[uniqueID] = newWIPArtifact;

		PhoenixAPI.currentWIPID = uniqueID;

		PhoenixAPI.saveWIPArtifacts();

		callback(uniqueID);
	}

	PhoenixAPI.publishCurrentWIP = function(){
		var artJSON = PhoenixAPI.wipArtifacts[PhoenixAPI.currentWIPID].artifactJSON;
		PhoenixAPI.addAndPublishWIP(PhoenixAPI.wipArtifacts[PhoenixAPI.currentWIPID])
		delete PhoenixAPI.wipArtifacts[PhoenixAPI.currentWIPID];
		PhoenixAPI.currentWIPID = undefined;
		PhoenixAPI.saveWIPArtifacts();
	}

	PhoenixAPI.updateWIPArtifactJSON = function(artifactJSON){
		if (PhoenixAPI.wipArtifacts && PhoenixAPI.currentWIPID){
			if (!PhoenixAPI.wipArtifacts[PhoenixAPI.currentWIPID].artifactJSON){
				PhoenixAPI.wipArtifacts[PhoenixAPI.currentWIPID].artifactJSON = {}
			}

			PhoenixAPI.wipArtifacts[PhoenixAPI.currentWIPID].artifactJSON = artifactJSON;

			PhoenixAPI.saveWIPArtifacts();
		}
	}

	PhoenixAPI.addAndPublishWIP = function(wipArtifact){
		var publishObject = {
			artifactJSON: wipArtifact.artifactJSON,
			status: "Uploading"
		}

		var filesUploadState = [];

		var uploadComplete = true;
		for (var i = 0; i < wipArtifact.tusFiles.length; i++) {
			var len = 0;
			for (var v in wipArtifact.tusFiles[i])
				len++;

			if (len === 3 && !wipArtifact.tusFiles[i].error){
				filesUploadState.push({
					uploadComplete: true,
					obj: wipArtifact.tusFiles[i]
				})
			} else {
				uploadComplete = false;
				filesUploadState.push({
					uploadComplete: false,
					obj: wipArtifact.tusFiles[i]
				})
			}
		}

		console.log(filesUploadState);

		if (uploadComplete){
			var idsToAdd = [];

			var files = wipArtifact.artifactJSON.artifact.storage.files;

			for (var i = 0; i < files.length; i++) {
				if (wipArtifact.tusFiles){
					for (var j = 0; j < wipArtifact.tusFiles.length; j++) {
						if (wipArtifact.tusFiles[j].name == files[i].fname){
							idsToAdd.push(wipArtifact.tusFiles[j].id);
						}
					}
				}
			}

			PhoenixAPI.addFilesToIPFS(idsToAdd, function(ipfsData){
				wipArtifact.artifactJSON.artifact.storage.location = ipfsData[ipfsData.length - 1].hash;

				wipArtifact.artifactJSON = LibraryDJS.signPublishArtifact(PhoenixAPI.wallet, wipArtifact.artifactJSON.artifact.storage.location, PhoenixAPI.currentPublisher.address, wipArtifact.artifactJSON)

				// Publish the artifact JSON into the blockchain.
				PhoenixAPI.addToPublishQueue(wipArtifact.artifactJSON);
			});
		} else {
			PhoenixAPI.pendingUploadQueue.push(wipArtifact);
		}
	}

	PhoenixAPI.checkUploadStatus = function(){
		// Checks the upload status for all pendingUploadQueue items & publishes if finished uploading.
		for (var i = 0; i < PhoenixAPI.pendingUploadQueue.length; i++) {
			var wipArtifact = PhoenixAPI.pendingUploadQueue[i];

			var publishObject = {
				artifactJSON: wipArtifact.artifactJSON,
				status: "Uploading"
			}

			var filesUploadState = [];

			var uploadComplete = true;
			for (var i = 0; i < wipArtifact.tusFiles.length; i++) {
				var len = 0;
				for (var v in wipArtifact.tusFiles[i])
					len++;

				if (len === 3 && !wipArtifact.tusFiles[i].error){
					filesUploadState.push({
						uploadComplete: true,
						obj: wipArtifact.tusFiles[i]
					})
				} else {
					uploadComplete = false;
					filesUploadState.push({
						uploadComplete: false,
						obj: wipArtifact.tusFiles[i]
					})
				}
			}

			if (uploadComplete){
				var idsToAdd = [];

				var files = wipArtifact.artifactJSON.artifact.storage.files;

				for (var i = 0; i < files.length; i++) {
					if (wipArtifact.tusFiles){
						for (var j = 0; j < wipArtifact.tusFiles.length; j++) {
							if (wipArtifact.tusFiles[j].name == files[i].fname){
								idsToAdd.push(wipArtifact.tusFiles[j].id);
							}
						}
					}
				}

				if (!PhoenixAPI.pendingUploadQueue[i].ipfsAddStart){
					PhoenixAPI.pendingUploadQueue[i].ipfsAddStart = true;
					PhoenixAPI.addFilesToIPFS(idsToAdd, function(ipfsData){
						PhoenixAPI.pendingUploadQueue.splice(i, 1);
						wipArtifact.artifactJSON.artifact.storage.location = ipfsData[ipfsData.length - 1].hash;
						wipArtifact.artifactJSON = LibraryDJS.signPublishArtifact(PhoenixAPI.wallet, wipArtifact.artifactJSON.artifact.storage.location, PhoenixAPI.currentPublisher.address, wipArtifact.artifactJSON);

						// Publish the artifact JSON into the blockchain.
						PhoenixAPI.addToPublishQueue(wipArtifact.artifactJSON);
					});
				}
			}
		}
			
	}

	PhoenixAPI.addAndPublish = function(artifactJSON, callback){
		var idsToAdd = [];

		var files = artifactJSON.artifact.storage.files;

		for (var i = 0; i < files.length; i++) {
			if (PhoenixAPI.wipArtifacts[PhoenixAPI.currentWIPID].tusFiles){
				for (var j = 0; j < PhoenixAPI.wipArtifacts[PhoenixAPI.currentWIPID].tusFiles.length; j++) {
					if (PhoenixAPI.wipArtifacts[PhoenixAPI.currentWIPID].tusFiles[j].name == files[i].fname){
						idsToAdd.push(PhoenixAPI.wipArtifacts[PhoenixAPI.currentWIPID].tusFiles[j].id);
					}
				}
			}
		}

		PhoenixAPI.addFilesToIPFS(idsToAdd, function(ipfsData){
			artifactJSON.artifact.storage.location = ipfsData[ipfsData.length - 1].hash;

			// Publish the artifact JSON into the blockchain.
			PhoenixAPI.addToPublishQueue(artifactJSON);
		});
	}

	PhoenixAPI.addFilesToIPFS = function(idsToAdd, callback){
		$.ajax(PhoenixAPI.tusIPFSEndpoint + "/addToIPFS", {
		    "contentType" : 'application/json',
		    "type" : 'POST',
			"data": JSON.stringify({"fileids": idsToAdd}), 
			"success": function( data ) {
				callback(data);
			}
		});
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

	PhoenixAPI.publishArtifact = function(artifactJSON, callback){
		if (!artifactJSON.artifact.info.year)
			artifactJSON.artifact.info.year = parseInt(new Date().getYear());

		if (typeof artifactJSON.artifact.info.year == "string")
			artifactJSON.artifact.info.year = parseInt(artifactJSON.artifact.info.year);

		PhoenixAPI.calculatePublishFee(artifactJSON, function(usd, pubFee){
			PhoenixEvents.trigger("onPublishStart", "Starting publish attempt");
			LibraryDJS.publishArtifact(PhoenixAPI.wallet, artifactJSON.artifact.storage.location, PhoenixAPI.currentPublisher.address, artifactJSON, pubFee, function(err, data){
				if (err){
					console.log("Error: " + data);
					return;
				}
				callback(data);

				PhoenixEvents.trigger("onPublishEnd", data);		
			});
		})
			
	}

	PhoenixAPI.addToPublishQueue = function(artJSON){
		PhoenixAPI.publishQueue.push({
			status: "",
			ipfsUploadComplete: false,
			txPushComplete: false,
			txs: [],
			artifactJSON: artJSON
		});
	}

	PhoenixAPI.processPublishQueue = function(){
		if (PhoenixAPI.publishQueue.length > 0){
			if (PhoenixAPI.publishState === "Ready"){
				PhoenixAPI.publishState = "Publishing";

				// Get the first element and remove it from the array
				var pubObj = PhoenixAPI.publishQueue.shift();
				PhoenixAPI.currentArtifactPublish = pubObj;

				PhoenixAPI.currentArtifactPublish.splitStrings = LibraryDJS.createMultipartStrings(JSON.stringify(pubObj.artifactJSON));

				PhoenixAPI.calculatePublishFee(pubObj.artifactJSON, function(usd, pubFee){
					if (isNaN(pubFee)){
						pubFee = 0.002;
					}
					PhoenixAPI.currentArtifactPublish.pubFee = pubFee;
					PhoenixEvents.trigger("onPublishStart", "Starting publish attempt");
				})

				// PhoenixAPI.publishArtifact(pubObj.artifactJSON, function(data){
				// 	PhoenixAPI.publishState = "Ready";
				// 	PhoenixAPI.currentArtifactPublish = undefined;
				// })
			}
		}

		if (PhoenixAPI.publishState === "Publishing"){
			LibraryDJS.processTXPublishObj(PhoenixAPI.currentArtifactPublish, {
				wallet: PhoenixAPI.wallet,
				address: PhoenixAPI.currentPublisher.address
			}, PhoenixAPI.publishQueueOnTXSuccess, PhoenixAPI.publishQueueOnTXError);
		}
	}

	PhoenixAPI.publishQueueOnTXSuccess = function(data){
		PhoenixAPI.currentArtifactPublish.txs.push(data);

		if (PhoenixAPI.currentArtifactPublish.txs && PhoenixAPI.currentArtifactPublish.splitStrings && PhoenixAPI.currentArtifactPublish.txs.length > 0 && PhoenixAPI.currentArtifactPublish.splitStrings.length > 0 && PhoenixAPI.currentArtifactPublish.txs.length === PhoenixAPI.currentArtifactPublish.splitStrings.length){
			PhoenixAPI.publishState = "Ready";
			PhoenixAPI.currentArtifactPublish = undefined;
			PhoenixEvents.trigger("onPublishEnd", data);
		}

		PhoenixEvents.trigger("onPublishTXSuccess", data);
	}

	PhoenixAPI.publishQueueOnTXError = function(error){ }

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

	PhoenixAPI.calculatePublishFee = function(artJSON, callback){
		PhoenixAPI.updateMarketData(function(marketData){
			PhoenixAPI.updateLibrarydInfoData(function(libraryDData){
				var USDperFLO = marketData.USD;
				var floPerKb = 0.01; // new endpoint, using 0.1 as default for now, ToDo: Update this when changes are made!
				var pubFeeFreeFlo = (JSON.stringify(artJSON).length / 1024) * floPerKb;
				var pubFeeFreeUSD = pubFeeFreeFlo * USDperFLO;

				var minPlayArray = [], minBuyArray = [], sugPlayArray = [], sugBuyArray = [];

				if (artJSON.artifact && artJSON.artifact.storage && artJSON.artifact.storage.files){
					var files = artJSON.artifact.storage.files;

					for (var i = 0; i < files.length; i++) {
						if (!artJSON.artifact.payment)
							artJSON.artifact.payment = {}

						if (artJSON.artifact && artJSON.artifact.payment && !artJSON.artifact.payment.disPer)
							artJSON.artifact.payment.disPer == 0.30;

						if (files[i].sugBuy){
							// disPer stands for discount percentage
							minBuyArray.push(parseFloat(files[i].sugBuy) * (1-artJSON.artifact.payment.disPer))
							sugBuyArray.push(parseFloat(files[i].sugBuy))
						}
						if (files[i].sugPlay){
							minPlayArray.push(parseFloat(files[i].sugPlay) * (1-artJSON.artifact.payment.disPer))
							sugPlayArray.push(parseFloat(files[i].sugPlay))
						}
					}
				}		

				var totMinPlay = 0;
				for (var i = 0; i < minPlayArray.length; i++) {
					totMinPlay += minPlayArray[i];
				}

				var totMinBuy = 0;
				for (var i = 0; i < minBuyArray.length; i++) {
					totMinBuy += minBuyArray[i];
				}

				var totSugPlay = 0;
				for (var i = 0; i < sugPlayArray.length; i++) {
					totSugPlay += sugPlayArray[i];
				}

				var totSugBuy = 0;
				for (var i = 0; i < sugBuyArray.length; i++) {
					totSugBuy += sugBuyArray[i];
				}

				var artCost = (totMinPlay + totSugPlay + totMinBuy + totSugBuy) / 4; // divide by 4 because there are four inputs

				var avgArtCost = libraryDData.avgArtCost;

				var pubFeeComUSD = 0;
				if (artCost <= avgArtCost){
					pubFeeComUSD = artCost;
				} else {
					pubFeeComUSD = (( Math.log(artCost) - Math.log(avgArtCost) ) * (avgArtCost / artCost) * (artCost - avgArtCost)) + avgArtCost;
				}

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

		var timeNow = Date.now();
		var yesterday = timeNow - (24*60*60*1000);
		if (PhoenixAPI.librarydInfo && PhoenixAPI.librarydInfo.timestamp > yesterday){
			callback(PhoenixAPI.librarydInfo.data);
		} else {
			$.getJSON(librarianHost + "/alexandria/v2/info", function( data ) {
				PhoenixAPI.librarydInfo.timestamp = Date.now();
				PhoenixAPI.librarydInfo.data = data;

				callback(data);
			});
		}
	}

	PhoenixAPI.uploadFileToTus = function(file, onSuccess, onError, onProgress, newName){
		if (!onSuccess)
			onSuccess = function(){};
		if (!onError)
			onError = function(){};
		if (!onProgress)
			onProgress = function(){};

		PhoenixAPI.wipArtifacts[PhoenixAPI.currentWIPID].tusFiles.push({"name": newName ? newName : file.name});
		PhoenixAPI.saveWIPArtifacts();

		// Create a new tus upload
	    var upload = new tus.Upload(file, {
	    	metadata: {
	    		"name": newName ? newName : file.name
	    	},
	        endpoint: PhoenixAPI.tusIPFSEndpoint + "/files/",
	        retryDelays: [0, 1000, 3000, 5000],
	        onError: function(error) {
	        	 if (PhoenixAPI.wipArtifacts && PhoenixAPI.currentWIPID){
	        		for (var i = 0; i < PhoenixAPI.wipArtifacts[PhoenixAPI.currentWIPID].tusFiles.length; i++) {
						if (PhoenixAPI.wipArtifacts[PhoenixAPI.currentWIPID].tusFiles[i].name == file.name){
							PhoenixAPI.wipArtifacts[PhoenixAPI.currentWIPID].tusFiles[i].error = error;
							PhoenixAPI.saveWIPArtifacts();
						}
					}
	        	}
				
				for (var j = 0; j < PhoenixAPI.pendingUploadQueue.length; j++){
					for (var i = 0; i < PhoenixAPI.pendingUploadQueue[j].tusFiles.length; i++) {
						console.log(i, PhoenixAPI.pendingUploadQueue[j].tusFiles[i].name, file.name)
						if (PhoenixAPI.pendingUploadQueue[j].tusFiles[i].name == file.name){
							PhoenixAPI.pendingUploadQueue[j].tusFiles[i].error = error;
						}
		        	}
				}

				PhoenixEvents.trigger('onTusUploadError', {});

	            onError(error);
	        },
	        onProgress: function(bytesUploaded, bytesTotal) {
	            var percentage = (bytesUploaded / bytesTotal * 100).toFixed(2);

	            if (PhoenixAPI.wipArtifacts && PhoenixAPI.currentWIPID){
	        		for (var i = 0; i < PhoenixAPI.wipArtifacts[PhoenixAPI.currentWIPID].tusFiles.length; i++) {
						if (PhoenixAPI.wipArtifacts[PhoenixAPI.currentWIPID].tusFiles[i].name == file.name){
							PhoenixAPI.wipArtifacts[PhoenixAPI.currentWIPID].tusFiles[i].progress = percentage;
							PhoenixAPI.saveWIPArtifacts();
						}
					}
	        	}
				
				for (var j = 0; j < PhoenixAPI.pendingUploadQueue.length; j++){
					for (var i = 0; i < PhoenixAPI.pendingUploadQueue[j].tusFiles.length; i++) {
						console.log(i, PhoenixAPI.pendingUploadQueue[j].tusFiles[i].name, file.name)
						if (PhoenixAPI.pendingUploadQueue[j].tusFiles[i].name == file.name){
							PhoenixAPI.pendingUploadQueue[j].tusFiles[i].progress = percentage;
						}
		        	}
				}

				PhoenixEvents.trigger('onTusUploadProgress', {});

	            onProgress(percentage, bytesUploaded, bytesTotal);
	        },
	        onSuccess: function() {
	        	var id = upload.url.replace(PhoenixAPI.tusIPFSEndpoint + '/files/', '');

	        	if (PhoenixAPI.wipArtifacts && PhoenixAPI.currentWIPID){
	        		for (var i = 0; i < PhoenixAPI.wipArtifacts[PhoenixAPI.currentWIPID].tusFiles.length; i++) {
						if (PhoenixAPI.wipArtifacts[PhoenixAPI.currentWIPID].tusFiles[i].name == file.name){
							PhoenixAPI.wipArtifacts[PhoenixAPI.currentWIPID].tusFiles[i].id = id;
							PhoenixAPI.saveWIPArtifacts();
						}
					}
	        	}
				
				for (var j = 0; j < PhoenixAPI.pendingUploadQueue.length; j++){
					for (var i = 0; i < PhoenixAPI.pendingUploadQueue[j].tusFiles.length; i++) {
						console.log(i, PhoenixAPI.pendingUploadQueue[j].tusFiles[i].name, file.name)
						if (PhoenixAPI.pendingUploadQueue[j].tusFiles[i].name == file.name){
							PhoenixAPI.pendingUploadQueue[j].tusFiles[i].id = id;
						}
		        	}
				}

				PhoenixEvents.trigger("onTusUploadSuccess", {});

	        	onSuccess(id);
	        }
	    })

	    // Start the upload
	    upload.start()
	}

	return PhoenixAPI;
})();

// Attempt a new publish every 1 second
setInterval(Phoenix.processPublishQueue, 1 * 1000);
setInterval(Phoenix.checkUploadStatus, 1 * 1000);

Phoenix.login();
Phoenix.loadWIPArtifacts();