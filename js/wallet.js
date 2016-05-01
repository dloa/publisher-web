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
            // Dismiss modal then open success.
            $('#walletModal').modal('hide');
            swal("Success!", "Successfully logged into wallet!", "success");
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
        option.text = address;
        x.add(option);
	}

	// Next check alexandria for all publishers and see if any wallets match. If they do, add them to the option list.
	$.getJSON( "http://libraryd.alexandria.io/alexandria/v1/publisher/get/all", function( data ) {
		for (var i = 0; i < data.length; i++) {
			//console.log(data[i]["publisher-data"]["alexandria-publisher"]);
			for (var addr in wallet.addresses) {
				var address = wallet.addresses[addr].addr;
				if (data[i]["publisher-data"]["alexandria-publisher"].address == address){
			        // Remove the "None Registered..." text
			        $("#publisherSelect option[value='None Registered...']").remove();
					// Add the publisher as an option then select it.
		            var x = document.getElementById("publisherSelect");
		            var option = document.createElement("option");
		            option.text = data[i]["publisher-data"]["alexandria-publisher"].name + ' (' + data[i]["publisher-data"]["alexandria-publisher"].address + ')';
		            x.add(option);
		            // Set the just added option to be active.
		            x.value = option.text;
				}
			}
		}
	});
}

function refreshWalletInfo(){
	$('#refreshButton').text("Loading...");
	wallet.refreshBalances(function(data){
		$('#identifier').text(wallet.identifier);
		$('#addressTable > tbody').html("");
		$('#refreshButton').text("Refresh");
		for (var addr in wallet.addresses) {
			var address = wallet.addresses[addr].addr;
			var balance = wallet.balances[addr];

			// Add the florincoin addresses and balance to the table.
	        $('#addressTable > tbody:last-child').append('<tr><td><code>' + address + '</code></td><td><code>' + balance + '</code></td><td><button class="btn btn-success" onclick="openTradebot(\'' + address + '\')">Buy FLO</button></tr>');
		}
	});
}

function newAddress(){
	wallet.generateAddress();
	wallet.store();
	refreshWalletInfo();
}