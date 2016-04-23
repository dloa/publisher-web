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
  $.post("../php/signPublisher.php",{
      name: newPublisherName,
      address: newPublisherFlorincoinAddress
    },
    function(response) {
      var data = JSON.parse(response);
      console.log(data);
      newPublisherSignResponse = data.response[0];
      document.getElementById('newPublisherLoadingWell').innerHTML += "Recieved sign request back. (" + newPublisherSignResponse + ")</br>";

      // If successful then register it.
      if (data['status'] === 'success'){
        document.getElementById('newPublisherLoadingWell').innerHTML += "Registering publisher address...</br>";
        $.post('../php/registerPublisher.php',{
          name: newPublisherName,
          email: newPublisherEmail,
          address: newPublisherFlorincoinAddress,
          bitmessage: '',
          signature: newPublisherSignResponse
        },function(responsetwo){
          console.log(responsetwo);
          var registerResponse = JSON.parse(responsetwo);
          console.log(registerResponse);
          newPublisherRegisterResponse = registerResponse.response[0];
          document.getElementById('newPublisherLoadingWell').innerHTML += "Recieved register request back. (" + newPublisherRegisterResponse + ")</br>";
        });
      } else {
        document.getElementById('newPublisherLoadingWell').innerHTML += "Error signing request, please refresh the page and try again.</br>";
      }
    }
  );
}