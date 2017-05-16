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
	console.log('Loading Addresses!');
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
		console.log(data.length);
		for (var i = 0; i < data.length; i++) {
			//console.log(data[i]["publisher-data"]["alexandria-publisher"]);
			//console.info(wallet.addresses);
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

		var FLOUSD

		getMarketData(function(data){ 
			marketData = data; 
			perBTC = marketData.USD/marketData.weighted;
			var FLOUSD = marketData.USD;
		
			// Wipe the div
			$('#walletAccordian').html("");

			var i = 0;
			for (var addr in wallet.addresses) {
				i = i + 1;
				var address = wallet.addresses[addr].addr;
				var priv = wallet.addresses[addr].priv;
				var balance = wallet.balances[addr];

				// Add the florincoin addresses and balance to the table.
				$('#walletAccordian').append('<div class="panel">\
									<a role="button" data-toggle="collapse" data-parent="#walletAccordian" href="#collapse' + i + '" aria-expanded="true" aria-controls="collapse' + i + '">\
										<div class="panel-heading" role="tab" id="heading' + i + '">\
											<h4 class="panel-title">\
												<div style="padding: 0px 30px; color: #000">\
													<span>' + address + '</span><span style="float: right"><span class="color: green">$' + (parseFloat(balance)*parseFloat(FLOUSD)).toFixed(2) + '</span> - ' + balance + ' FLO</span>\
												</div>\
											</h4>\
										</div>\
									</a>\
									<div id="collapse' + i + '" class="panel-collapse collapse" role="tabpanel" aria-labelledby="heading' + i + '">\
										<div class="panel-body">\
											<!-- Some HTML design code comes from https://github.com/OutCast3k/coinbin/, you can view the license for this code here: https://github.com/OutCast3k/coinbin/blob/master/LICENSE -->\
											<div class="col-md-12" align="center">\
												<div id="walletQrCode' + i + '" title="florincoin:' + address + '"></div> <br>\
												<div>\
													<span id="walletAddress">' + address + '</span>\
												</div>\
												<br>\
												<div style="text-align:center; width:430px;">\
													<ul class="nav nav-pills" role="tablist">\
														<li role="presentation" class="active"><a href="javascript:;" id="walletBalance" rel="' + balance + '" style="display: block;">' + balance + ' FLO</a></li>\
														<li role="presentation"><a href="#walletSpend" id="walletShowSpend"  aria-controls="walletSpend" role="pill" data-toggle="pill">Spend</a></li>\
														<li role="presentation"><a id="walletHistory" href="http://florincoin.info/address/' + address + '" target="_blank" data-ytta-id="-">History</a></li>\
														<li role="presentation"><a href="#tradebot" target="" >Buy</a></li>\
														<li role="presentation"><a href="#walletKeys" id="walletShowKeys"  aria-controls="walletKeys" role="pill" data-toggle="pill">Keys</a></li>\
													</ul>\
													<br>\
													<div class="tab-content" style="margin-top: -40px;">\
														<div role="tabpanel" id="walletKeys" class="tab-pane">\
															<label>Public Key</label>\
															<input class="form-control pubkey" type="text" readonly="" data-original-title="" title="" value="' + address + '">\
															<label>Private key</label>\
															<div class="input-group">\
																<input class="form-control privkey" type="password" readonly="" data-original-title="" title="" value="' + priv + '">\
																<span class="input-group-btn">\
																	<button class="showKey btn btn-default" onclick="" type="button">Show</button>\
																</span>\
															</div>\
														</div>\
														<div id="walletSpend" class="tab-pane active">\
															<div class="row">\
																<div class="form-inline output">\
																	<div class="col-xs-8">\
																		<label>Address</label>\
																	</div>\
																	<div class="col-xs-3">\
																		<label>Amount</label>\
																	</div>\
																</div>\
															</div>\
															<div class="row" id="walletSpendTo">\
																<div class="form-horizontal output">\
																	<div class="col-xs-8">\
																		<input type="text" class="form-control addressTo" data-original-title="" title="">\
																	</div>\
																	<div class="col-xs-3">\
																		<input type="text" class="form-control amount" data-original-title="" title="" placeholder="0.00">\
																	</div>\
																	<a href="javascript:;" class="addressAdd" data-ytta-id="-"><span class="glyphicon glyphicon-plus"></span></a>\
																	<br><br>\
																</div>\
															</div>\
															<div class="row">\
																<div class="col-xs-6">\
																	<label><abbr title="" data-original-title="the amount to pay in network miner fees - 0.0004 or more recommended for a faster processing time">Transaction Fee</abbr>&nbsp;&nbsp;<a href="https://bitcoinfees.21.co/" target="_blank" data-ytta-id="-"><span class="glyphicon glyphicon-question-sign"></span></a></label>\
																	<input type="text" class="form-control" value="0.0004" id="txFee" data-original-title="" title="">\
																</div>\
																<div class="col-xs-5">\
																	<label><abbr title="" data-original-title="the amount to donate to coinb.in">Donation</abbr></label>\
																	<input type="text" class="form-control" value="0.003" id="developerDonation" data-original-title="" title="">\
																</div>\
															</div>\
															<br>\
															<div id="walletSendStatus" class="alert alert-danger hidden"></div>\
															<button class="btn btn-primary" type="button" id="walletSendBtn">Send</button>\
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