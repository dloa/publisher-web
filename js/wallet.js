var wallet;

function loginToWallet() {
	$.get("http://flovault.alexandria.io/wallet/checkload/" + $("#loginWalletIdentifier").val(), function (response) {
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
            // Dismiss modal then open success.
            $('#walletModal').modal('hide');
            swal("Success!", "Successfully logged into wallet!", "success");
        });
    });
}

function registerWallet() {
	var data = {};
	if ($("#createWalletEmail").val().length > 3)
	    data = {email: emailInput.val()};
	$.post("http://flovault.alexandria.io/wallet/create", data, function (response) {
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

	    wallet.generateAddress();

	    console.log(wallet);

	    // Dismiss modal then open success.
        $('#walletModal').modal('hide');
	    swal({
	    	title: "Success!", 
	    	text: "text",
	    	type: "success"
	    });
	    $(".sweet-alert .showSweetAlert").prop('tabindex', 0);
	    $(".sweet-alert .lead").html("Register was successful, here is your identifier, please keep this safe or you may lose access to your coins and Publisher ID: <br><code>" + response.identifier + "</code>");
	});
}

function loadAddresses(){
	// First load addresses into new publisher modal

	// Next check alexandria for all publishers and see if any wallets match. If they do, add them to the option list.
}