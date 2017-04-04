var wallet;

function checkLogin(timerCount) {
	if(!wallet) {
		if (timerCount > 3) {
			window.location = window.location.href.slice(0, -1 * window.location.pathname.split('/')[window.location.pathname.split('/').length - 1].length) + 'login.html';
		} else {
			timerCount++;
			setTimeout(function(){ checkLogin(timerCount) }, 500);
		}
	}
}

function loginToWallet() {
	$.ajax("https://flovault.alexandria.io/wallet/checkload/" + $("#loginWalletIdentifier").val(), { async: false, success: function (response) {
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
	} });
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
			$('#addressTable > tbody:last-child').append('<tr><td><code>' + address + '</code></td><td><code>' + balance + '</code></td>');
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

function AppendOneTX(tx, i){
	var markup = "<tr id='" + tx.txid + "'>\
					<th>" + tx.txid.substr(tx.txid.length - 14) + "</th>\
					<td>" + tx['tx-comment'] + "</td>\
					<td><a href=\"https://explorer.alexandria.io/tx/?txid=" + tx.txid + "\"class=\"btn btn-info\">More Info</a></td>\
				</tr>";
	$("#TXTable > tbody").append(markup);
	checkEnv();
}

function loadTransactions(){
	// Load all transactions into an array.
	var TransactionsArray = [];

	for (var addr in wallet.addresses){
		var url = florinsightBaseURL + "/api/txs/?address=" + addr;
		$.ajax(url, { async: false, success: function(data){
			// Add each tx to the array individually.
			for (var i in data.txs){
				TransactionsArray.push({timestamp: data.txs[i].time, address: addr, tx: data.txs[i]});
			}
		}});
	}

	TransactionsArray.sort(function(a, b){ 
		if (a.timestamp < b.timestamp)
			return 1;
		else
			return -1;
	});

	for (var tx in TransactionsArray){
		AppendOneTX(TransactionsArray[tx].tx, tx);
	}
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