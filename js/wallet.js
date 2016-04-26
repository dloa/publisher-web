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

function loadAddresses(){
	// First load addresses into new publisher modal

	// Next check alexandria for all publishers and see if any wallets match. If they do, add them to the option list.
}