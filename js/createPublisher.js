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
  // Hide the form and show the loading window.
  hide(document.getElementById('newPublisherFormDiv'));
  show(document.getElementById('newPublisherLoadingDiv'));

  // Log to the well that we are signing the announcement message
  document.getElementById('newPublisherLoadingWell').innerHTML += "Signing publisher announcement message...</br>";

  // Variables from form
  var newPublisherName = document.getElementById('newPublisherName').value;
  var newPublisherEmail = document.getElementById('newPublisherEmail').value;
  var newPublisherFlorincoinAddress = document.getElementById('newPublisherFlorincoinAddress').value;

  // variable to hold the sign response
  var newPublisherSignResponse = '';
  var newPublisherRegisterResponse = '';

  // Sign the publisher annoucement message.
  /*$.post("./php/signPublisher.php",{
    name: newPublisherName,
    address: newPublisherFlorincoinAddress
  },
  function(response) {
      // response is the data we get back from the php file
      var data = JSON.parse(response);
      console.log(data);

      // Add a log.
      document.getElementById('newPublisherLoadingWell').innerHTML += "Recieved sign request back. (" + newPublisherSignResponse + ")</br>";

      // If successful then register it.
      if (data['status'] === 'success'){
        // Add a log before moving on, if unsuccessful then it will log differently.
        document.getElementById('newPublisherLoadingWell').innerHTML += "Registering publisher address...</br>";
        // Save the signature.
        newPublisherSignResponse = data.response[0];

        
        $.post('./php/registerPublisher.php',{
          name: newPublisherName,
          email: newPublisherEmail,
          address: newPublisherFlorincoinAddress,
          bitmessage: '',
          signature: newPublisherSignResponse
        },function(responsetwo){
          console.log(responsetwo);
          var registerResponse = JSON.parse(responsetwo);
          console.log(registerResponse);

          // Check if the attempt was successful
          if (registerResponse['status'] === 'success'){
            // Save the response.
            newPublisherRegisterResponse = registerResponse.response[0];
            // Add log
            document.getElementById('newPublisherLoadingWell').innerHTML += "Recieved register request back. (" + newPublisherRegisterResponse + ")</br>";
            // Create aleart that it was successful
            swal("Success!", "Your new publisher address has been successfully registered!", "success");
            // Hide the modal
            $('#newPublisherModal').modal('hide');
            // Add the publisher as an option then select it.
            var x = document.getElementById("publisherSelect");
            var option = document.createElement("option");
            option.text = newPublisherName + ' (' + newPublisherFlorincoinAddress + ')';
            x.add(option);
            // Set the just added option to be active.
            x.value = option.text;
          } else {
            swal("Error!", "Error registering, please refresh and try again!", "error");
            $('#newPublisherModal').modal('hide');
          }
        });
      } else {
        swal("Error!", "Error signing request, please refresh and try again!", "error");
        $('#newPublisherModal').modal('hide');
      }
    }
    );*/

    // Temporary disable publish create logic.
    // Create aleart that it was successful
    swal("Success!", "Your new publisher address has been successfully registered!", "success");
    // Hide the modal
    $('#newPublisherModal').modal('hide');
    // Add the publisher as an option then select it.
    var x = document.getElementById("publisherSelect");
    var option = document.createElement("option");
    option.text = newPublisherName + ' (' + newPublisherFlorincoinAddress + ')';
    x.add(option);
    // Set the just added option to be active.
    x.value = option.text;

  // Reset if they want to register another.
  show(document.getElementById('newPublisherFormDiv'));
  hide(document.getElementById('newPublisherLoadingDiv'));
  
}