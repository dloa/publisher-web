function hide (elements) {
  elements = elements.length ? elements : [elements];
  for (var index = 0; index < elements.length; index++) {
	elements[index].style.display = 'none';
  }
}

function show (elements, specifiedDisplay) {
 elements = elements.length ? elements : [elements];
 for (var index = 0; index < elements.length; index++) {
  elements[index].style.display = specifiedDisplay || 'block';
}
}

function continueToArtifact() {
  if (document.getElementById("publisherSelect").value != 'None Registered...'){
	var $active = $('.wizard .nav-tabs li.active');
	$active.next().removeClass('disabled');
	nextTab($active);
  } else {
	swal("Error!", "You must select a publisher address to continue!", "error");
  }
}

function registerNewPublisher(){
	// Variables from form
	var newPublisherName = document.getElementById('newPublisherName').value;
	var newPublisherEmail = document.getElementById('newPublisherEmail').value;
	var newPublisherFlorincoinAddress = document.getElementById('newPublisherFlorincoinAddress').value;

	// Validate inputs and throw errors.
	if (isBlank(newPublisherName)){
		swal("Error!", "You must provide a publisher name.", "error");
		$("#pubNameFormGroup").addClass('has-error');
		return;
	}
	if (!isBlank(newPublisherEmail) && !isEmail(newPublisherEmail)){
		swal("Error!", "You must provide a valid email.", "error");
		$("#pubEmailFormGroup").addClass('has-error');
		return;
	}
	if (isBlank(newPublisherFlorincoinAddress)){
		swal("Error!", "You must sign into a wallet! Reload the page and try again.", "error");
		$("#pubFloAddressFormGroup").addClass('has-error');
		return;
	}
	if(wallet.balances[newPublisherFlorincoinAddress] < 1){
		tradebot(newPublisherFlorincoinAddress);
		swal("Error!", "You must have at least 1 FLO in your wallet to register a publisher.", "error");
		return;
	}

	// Hide the form and show the loading window.
	hide(document.getElementById('newPublisherFormDiv'));
	show(document.getElementById('newPublisherLoadingDiv'));

	// Log to the well that we are signing the announcement message
	document.getElementById('newPublisherLoadingWell').innerHTML += "Signing publisher announcement message...</br>";

	// variable to hold the sign response
	var newPublisherSignResponse = '';
	var newPublisherRegisterResponse = '';

	console.log(newPublisherFlorincoinAddress);

	LibraryDJS.announcePublisher(wallet, newPublisherName, newPublisherFlorincoinAddress, "", newPublisherEmail, function(err, data){
		if (err){
			swal("Error!", "Error registering, please refresh and try again!", "error");
			$('#newPublisherModal').modal('hide');
			return;
		} 
		// Create aleart that it was successful
		swal("Success!", "Your new publisher address has been successfully registered!", "success");
		// Hide the modal
		$('#newPublisherModal').modal('hide');
		// Remove the "None Registered..." text
		$("#publisherSelect option[value='None Registered...']").remove();
		// Add the publisher as an option then select it.
		var x = document.getElementById("publisherSelect");
		var option = document.createElement("option");
		option.text = newPublisherName + ' (' + newPublisherFlorincoinAddress + ')';
		x.add(option);
		// Set the just added option to be active.
		x.value = option.text;
	});

	// Reset if they want to register another.
	show(document.getElementById('newPublisherFormDiv'));
	hide(document.getElementById('newPublisherLoadingDiv'));
}

function isBlank(str) {
	return (!str || /^\s*$/.test(str));
}

function isEmail(str){
	return (!/^\s*$/.test(str) || /\A(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)\Z/.test(str));
}