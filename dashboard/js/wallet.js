var wallet;

function loginToWallet() {
	$.get("https://flovault.alexandria.io/wallet/checkload/" + $("#loginWalletIdentifier").val(), function (response) {
		console.log("Check Load Response");
		console.log(response);
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
			//$('#walletModal').modal('hide');
			//swal("Success!", "Successfully logged into wallet!", "success");

			//updateAddressList();
			setTimeout(function(){ refreshWalletInfo() }, 100)
		});
	});
}

function registerWallet() {
	var data = {};
	if ($("#createWalletEmail").val().length > 3)
		data = {email: $("#createWalletEmail").val()};
	$.post("https://flovault.alexandria.io/wallet/create", data, function (response) {
		console.log("Create Response");
		console.log(response);
		if (response.error) {
			swal("Error", "Registration failed, please try again!", "error");
			return;
		}
		//identifierInput.val(response.identifier);
		wallet = new Wallet(response.identifier, $("#createWalletPassword").val());
		wallet.setSharedKey(response.shared_key);
		wallet.store();

		// Create one address by default.
		wallet.generateAddress();

		// Store wallet.
		wallet.store();

		console.log(wallet);

		loadAddresses();

		// Dismiss modal then open success.
		$('#walletModal').modal('hide');
		swal({
			title: "Success!", 
			text: "text",
			type: "success"
		});
		$(".sweet-alert .showSweetAlert").prop('tabindex', 0);
		var address = "";
		for (var addr in wallet.addresses) {
			address = wallet.addresses[addr].addr;
			console.log(address);
		}
		$(".sweet-alert .lead").html("Register was successful, here is your identifier, please keep this safe or you may lose access to your coins and Publisher ID: <br><code>" + response.identifier + "</code><br>Your initial Florincoin address is: <br><code>" + address + "</code>");
	});
}

function loadAddresses(){
	// First load addresses into new publisher modal
	for (var addr in wallet.addresses) {
		var address = wallet.addresses[addr].addr;
		console.log(address);
		// Add the florincoin addresses to the option list.
		var x = document.getElementById("newPublisherFlorincoinAddress");
		var option = document.createElement("option");
		option.value = address;
		option.text = address;
		x.add(option);
	}

	// Next check alexandria for all publishers and see if any wallets match. If they do, add them to the option list.
	$.getJSON( "https://api.alexandria.io/alexandria/v1/publisher/get/all", function( data ) {
		var nameSet = false;
		for (var i = 0; i < data.length; i++) {
			//console.log(data[i]["publisher-data"]["alexandria-publisher"]);
			for (var addr in wallet.addresses) {
				var address = wallet.addresses[addr].addr;
				if (data[i]["publisher-data"]["alexandria-publisher"].address == address){
					if (!nameSet){
						console.log("SET NAME");
						$('#pub-name').text(data[i]["publisher-data"]["alexandria-publisher"].name);
						nameSet = true;
					}
					// Remove the "None Registered..." text
					$("#publisherSelect option[value='None Registered...']").remove();
					// Add the publisher as an option then select it.
					var x = document.getElementById("publisherSelect");
					var option = document.createElement("option");
					option.text = data[i]["publisher-data"]["alexandria-publisher"].name + ' (' + data[i]["publisher-data"]["alexandria-publisher"].address + ')';
					x.add(option);
					// Set the just added option to be active.
					x.value = option.text;
					// Remove the option from the register publisher page
					$('#newPublisherFlorincoinAddress option[value="' + address + '"]').remove();

					loadArtifacts(data[i]["publisher-data"]["alexandria-publisher"].address);
				}
			}
		}
		if (document.getElementById("publisherSelect").length == 1 && document.getElementById("publisherSelect").value != 'None Registered...'){
			continueToArtifact();
		}
	});

	if (document.getElementById("publisherSelect").value == 'None Registered...'){
		if (localStorage.getItem("justSignedUp") == "true"){
			var data = localStorage.getItem("justSignedUpData").split('/');

			var inwal = false;
			for (var addr in wallet.addresses){
				if (addr == data[0])
					inwal = true;
			}

			if (inwal){
				var x = document.getElementById("publisherSelect");
				var option = document.createElement("option");
				option.value = data[0];
				option.text = data[1] + " (" + data[0] + ")";
				x.add(option);

				$("#publisherSelect option[value='None Registered...']").remove();

				// Set the just added option to be active.
				x.value = option.value;

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

					//continueToArtifact();

					if (addrInPubs){
						localStorage.setItem('justSignedUp', '');
						localStorage.setItem('justSignedUpData', '');
					}
				});
			}
		}
	}
}

function refreshWalletInfo(){
	wallet.refreshBalances(function(data){
		$('#identifier').html(wallet.identifier);
		$('#addressTable > tbody').html("");
		for (var addr in wallet.addresses) {
			var address = wallet.addresses[addr].addr;
			var balance = wallet.balances[addr];

			// Add the florincoin addresses and balance to the table.
			$('#addressTable > tbody:last-child').append('<tr><td><code>' + address + '</code></td><td><code>' + balance + '</code></td><td><button class="btn btn-success" onclick="tradebot(\'' + address + '\')">Buy FLO</button></tr>');
		}
	});
}

function newAddress(){
	wallet.generateAddress();
	wallet.store();
	refreshWalletInfo();
}

function signout(){
	localStorage.setItem("identifier", '');
	localStorage.setItem("loginWalletEnc", '');
	window.location.href = 'login.html';
}

if (typeof(Storage) !== "undefined") {
	if (localStorage.getItem("identifier") != ''){
		$("#loginWalletIdentifier").val(localStorage.getItem("identifier"));
		$("#loginWalletPassword").val(CryptoJS.AES.decrypt(localStorage.getItem("loginWalletEnc"), localStorage.getItem("identifier")).toString(CryptoJS.enc.Utf8));

		if (window.location.pathname.includes('login.html') || !window.location.pathname.includes('.html')){
			window.location.href = 'index.html';
		} else if (window.location.pathname.includes('index.html')){
			loginToWallet();
		}

		// If remember me is false then wipe the data, we just needed to store it until after redirect
		if (localStorage.getItem("remember-me") == "false"){
			localStorage.setItem("identifier", '');
			localStorage.setItem("loginWalletEnc", '');
		}

		if (localStorage.getItem("justSignedUp") == "true"){
			var data = localStorage.getItem("justSignedUpData").split('/');

			var inwal = false;
			for (var addr in wallet.addresses){
				if (addr == data[0])
					inwal = true;
			}

			if (inwal){
				var x = document.getElementById("publisherSelect");
				var option = document.createElement("option");
				option.value = data[0];
				option.text = data[1] + " (" + data[0] + ")";
				x.add(option);

				$("#publisherSelect option[value='None Registered...']").remove();

				// Set the just added option to be active.
				x.value = option.value;

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

					continueToArtifact();

					if (addrInPubs){
						localStorage.setItem("justSignedUp", '');
						localStorage.setItem("justSignedUpData", '');
					}
				});
			} else {
				loadAddresses();
			}
		} else {
			loadAddresses();
		}
	} else {
		if (window.location.pathname.includes('index.html')){
			window.location.href = 'login.html';
		}
	}
} else {
    Console.log('No Support for storing locally.')
}

// FLOVAULT INIT
function FloVaultInit() {
	loadScript(document.location.origin + '/static/js/SimpleWallet.js', SimpleWallet_loaded);
}

function SimpleWallet_loaded() {
	console.log('SimpleWallet.js loaded');
	loadScript(document.location.origin + '/static/js/SimpleDeps.js', SimpleDeps_loaded);
};

function SimpleDeps_loaded() {
	console.log('SimpleDeps.js loaded');
};

// ToDo: No error cases are handled

var registerBtn = $("#registerButton");
var emailInput = $("#registerEmailInput");
var registerPassInput = $("#registerPassInput");
var registerOutput = $("#registerOutput");

var identifierInput = $("#wallet-user");
var identifierPassInput = $("#wallet-token");
var identifierOutput = $("#identifierOutput");

var refreshAddressButton = $("#refreshBalance");

var sendFromInput = $("#wallet-from-address-select");
var sendToInput = $("#wallet-send-address");
var sendAmountInput = $("#wallet-send-amount-flo");
var sendCommentInput = $("#wallet-send-message");
var sendOutput = $("#sendOutput");

var flovaultURL = 'https://flovault.alexandria.io';
var tradebotURL = 'https://api.alexandria.io/tradebot';

// FLOVAULT LOAD WALLET
function FloVaultIdentify(send) {
	$.ajax({
		url: 'https://flovault.alexandria.io/wallet/checkload/' + identifierInput.val(),
		success: function(response) {
	         console.log("Check Load Response");
	         console.log(response);
	         identifierOutput.text(JSON.stringify(response, null, 2));
	
	         if (response.gauth_enabled) {
	             console.log("2FA unsupported");
	             alert("Sorry, 2FA is not supported at this time");
	             $('#wallet-connect-btn').removeClass('disabled');
	             return false;
	             // ToDo: add 2FA support, needs further research
	         }
	
	         wallet = new Wallet(response.identifier, identifierPassInput.val());
	         wallet.load(function () {
				console.log("Wallet Post-Load");
				identifierOutput.text(identifierOutput.text() + "\n\nWallet Balance: " + wallet.getTotalBalance());
				hideOverlay();
				updateAddressList(send);
	         });
	     },
		error: function (xhr, ajaxOptions, thrownError) {
			console.error(xhr.status);
			console.error(thrownError);
		}
	});
}

// FLOVAULT LOAD ADDRESSES
var loadedAddresses;
function newFloVaultAddress() {
    wallet.generateAddress();
	loadedAddresses = document.getElementById('wallet-address-select').length - 1;
    updateAddressList();
}

// FLOVAULT REFRESH BALANCES
function refreshFloVaultBalances() {
    wallet.refreshBalances();
    updateAddressList();
}

// FLOVAULT UPDATE ADDRESS LIST
function updateAddressList(send) {
	document.getElementById('wallet-balance-amount').innerHTML = 'Updating ...'
	if ( (!wallet) || (Object.keys(wallet.balances).length == 0) || (loadedAddresses ==  Object.keys(wallet.balances).length) )  {
		console.log('Running Timer');
		var walletWaitTimeoutId = setTimeout('updateAddressList('+send+')', 1500);
	} else {
		clearTimeout(walletWaitTimeoutId);
		console.log(wallet);
		document.getElementById('addressListOutput').innerHTML = "";
		var TotalBalance = 0;
		document.getElementById('wallet-address-select').innerHTML = '<option value="">Select Address</option>';
		document.getElementById('wallet-from-address-select').innerHTML = '<option value="">Select Address</option>';
		for (var addr in wallet.balances) {
			$('#addressListOutput').text($('#addressListOutput').text() + "\n" + addr + " : " + wallet.balances[addr]);
			TotalBalance += wallet.balances[addr];
			document.getElementById('wallet-address-select').innerHTML = document.getElementById('wallet-address-select').innerHTML + '<option value="'+ addr+'">' + addr +'</option>';
			document.getElementById('wallet-from-address-select').innerHTML = document.getElementById('wallet-from-address-select').innerHTML + '<option value="'+ addr+'">' + addr +'</option>';
		}
		console.log('TotalBalance = ' + TotalBalance);
		document.getElementById('wallet-balance-flo').innerHTML = TotalBalance + ' FLO';
		//document.getElementById('wallet-balance-amount').innerHTML = '$'+Math.round((TotalBalance*FLOUSD)*100)/100;
		var selectInterval = setInterval(function() {
		    if (document.getElementById('wallet-address-select').length > 1) {
		        clearInterval(selectInterval);
				document.getElementById('wallet-address-select').removeAttribute('disabled');
				document.getElementById('wallet-from-address-select').removeAttribute('disabled');
				$('#newAddressBtn').removeClass('disabled');
		    }
		}, 100);
		if (send === true) {
			console.log('Continue to send confirmation.');
			sendTip();
		}	
	}
}

// FLOVAULT SEND FLO
function sendFloVault(sendFrom, sendTo, sendAmount, sendComment) {
		var sendCommentRaw = sendComment;
		console.log(sendComment);
		if ( (history.state.currentView != 'wallet') && (sendCommentRaw != '') ) {
			sendComment = '{ "artifact": "'+window.history.state.subView+'", "comment": "'+sendCommentRaw+'"}';
		}
        console.log( sendFrom + ' ' + sendTo + ' ' + sendAmount + ' ' + sendComment );
        if (window.confirm('Send '+ sendAmount + ' FLO to ' + sendTo + ' with comment: ' + sendCommentRaw)) {
                wallet.sendCoins(sendFrom, sendTo, sendAmount, sendComment, sendcallback);
            refreshFloVaultBalances();
            $('#tip-modal').fadeOut(fadeTimer);
        }
}

// FloVault Callback
function sendcallback(err, data){
    if( err == null ){
	    $(sendToInput).val('');
		$(sendFromInput).val('');
		$(sendToInput).val('');
		$(sendAmountInput).val('');
		$(sendCommentInput).val('');
        alert("Send successful\n"+data.txid);
    }
    else
    {
        console.log(err);
        alert("Send failed");
    }
}

// DISPLAY TRADE MODAL
function tradeModal() {
	if ( (document.getElementById('trade-modal').style.display == 'none') || (document.getElementById('trade-modal').style.display == '') ) {
		var floaddress = document.getElementById('wallet-address-select').value;
		if (floaddress == '') {
			alert('Please select an address in Request Tokens section');
		} else {
			$.ajax({
				url: tradebotURL +'/flobalance',
				success: function(e) {
					console.info(e);
					document.getElementById('trade-balance').innerHTML = Math.round((.5*e*(Math.round((FLOUSD/BTCUSD)*100000000)/100000000))*100000000)/100000000;
				}
			});
			$.ajax({
				url: tradebotURL+'/depositaddress?floaddress='+floaddress,
				success: function(e) {
					document.getElementById('trade-address').innerHTML = e;
					btcAddress = $('#trade-address code').text();
					$('#tradebotQR').html('');
					$('#trade-address img').appendTo('#tradebotQR');
					document.getElementById('trade-address').innerHTML = btcAddress;
					document.getElementById('trade-modal').style.display = 'block';
				},
				error: function(e) {
					console.error(e);
					alert('Sorry. Tradebot has malfunctioned. Please try again later.');
				}
			});
		}
	} else {
		document.getElementById('trade-modal').style.display = 'none';
	}
}

function getTradeBotBitcoinAddress(floaddress, callback){
	$.get(tradebotURL+"/depositaddress?floaddress=" + floaddress + '&raw', function(data){
		callback(data.responseText);
	})
}