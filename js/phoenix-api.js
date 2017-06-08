// Phoenix-API runs all of the background processes used by the publisher. 
// It emits events with info when things happen that have example definitions in `phoenix-ui.js`. 
// This allows you to subscribe to happening events to update your UI.
var PhoenixAPI = {
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
};

var flovaultBaseURL = "https://flovault.alexandria.io";

// Used to login. Should we call this Sync or Async?
PhoenixAPI.prototype.login = function(identifier, password){
	$.get(flovaultBaseURL + "/wallet/checkload/" + identifier, function (response) {
		if (response.gauth_enabled) {
			
			swal("Error!", "Two Factor Authentication is not currently supported, please disable it or create a new wallet.", "error");
			// ToDo: add 2FA support, needs further research
		}
		wallet = new Wallet(response.identifier, $("#loginWalletPassword").val());
		wallet.load(function () {
			console.log("Wallet Post-Load");
			console.log(wallet);
			// Load wallet into page
			loadAddresses();
			refreshWalletInfo();
			// Check if we should remember this.
			if ($('#login-remember').prop("checked")){
				if (typeof(Storage) !== "undefined") {
				    localStorage.setItem("identifier", $('#loginWalletIdentifier').val());
				    localStorage.setItem("loginWalletEnc", CryptoJS.AES.encrypt($('#loginWalletPassword').val(), $('#loginWalletIdentifier').val()));
				} else {
				    Console.log('No Support for storing locally.')
				}
			}
			// Dismiss modal then open success.
			$('#walletModal').modal('hide');
			swal("Success!", "Successfully logged into wallet!", "success");
		});
	});
}


// Be sure to fill artifact.files with an array of input selectors.
PhoenixAPI.prototype.publishArtifact = function(artifact){

}

export default PhoenixAPI;