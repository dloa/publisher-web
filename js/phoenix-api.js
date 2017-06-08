// Phoenix-API runs all of the background processes used by the publisher. 
// It emits events with info when things happen that have example definitions in `phoenix-ui.js`. 
// This allows you to subscribe to happening events to update your UI.


var PhoenixEvents = {};
_.extend(PhoenixEvents, Backbone.Events);

var PhoenixStatus = {
	status: 'waiting', 
	pubQueue: [], // Artifacts that are being published are added to the pubQueue.
	currentUser: { // This is the currently selected "Publisher"
		publisherAddress: 'floAddr',
		publisherName: 'Sky'
	}, 
	users: [{ // This contains all of the available publishers for the wallet. You can use this to select a new user.
		publisherAddress: '',
		publisherName: ''
	}], 
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
					if (window.location.pathname.includes('login.html') || !window.location.pathname.includes('.html')){
						window.location.href = 'index.html';
					}
				} else {
					if (window.location.pathname.includes('index.html')){
						window.location.href = 'login.html';
						return;
					}
				}
			} else {
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
				PhoenixEvents.trigger("onWalletLoad", PhoenixAPI.wallet);
			});
		});

		// If remember me is false then wipe the data, we just needed to store it until after redirect
		if (localStorage["remember-me"] == "false"){
			localStorage.identifier = '';
			localStorage.loginWalletEnc = '';
		}

		if (localStorage.justSignedUp == "true"){
			var data = localStorage.justSignedUpData.split('/');

			var inwal = false;
			for (var addr in wallet.addresses){
				if (addr == data[0])
					inwal = true;
			}

			if (inwal){
				$.getJSON( "https://api.alexandria.io/alexandria/v1/publisher/get/all", function( data ) {
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

	PhoenixAPI.getWallet = function(){
		return this.wallet;
	}


	// Be sure to fill artifact.files with an array of input selectors.
	PhoenixAPI.publishArtifact = function(artifact){
		PhoenixEvents.trigger("testEvent", "test");
	}

	return PhoenixAPI;
})();

Phoenix.login();