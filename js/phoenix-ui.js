// At the top we define all of our variables used below that link to our UI. This uses regular html selectors currently, not jQuery selectors.
var x = document.getElementById('id');

// Accepts a set of Selectors to load the artifact into view. Generates code for all of the different sections to fill it.
PhoenixEvents.on("onLogin", function(msg){ console.log("Logging in"); })
PhoenixEvents.on("onLoginFail", function(msg){ console.log("Login Failed"); })
PhoenixEvents.on("onLoginSuccess", function(msg){ console.log("Login Success!"); })
PhoenixEvents.on("onWalletLoad", function(msg){ console.log("Wallet Loaded"); })

var PhoenixUI = function(){
	function PhoenixUI(){

	}

	PhoenixUI.prototype.loadArtifactIntoView = function(artifact){

	}
}



