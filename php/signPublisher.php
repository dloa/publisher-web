<?php
// Set text to plain so we avoid including html, it is also better as the page will be smaller and load faster.
header("Content-Type: text/plain");

// http://api.alexandria.io/#sign-publisher-announcement-message
$API_ENDPOINT = 'http://localhost:41289/alexandria/v1/sign';

$data = array(
  "address" => $_POST["address"],
  "text" => $_POST['name'] . '-' . $_POST['address'] . '-' . time()
);

$str_data = json_encode($data);

function sendPostData($url, $post){
	try {
	  	$ch = curl_init($url);
	  	if (FALSE === $ch)
        	throw new Exception('failed to initialize');
	  	curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");  
	  	curl_setopt($ch, CURLOPT_POSTFIELDS,$post);
	  	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	  	curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1); 
	  	curl_setopt($ch, CURLOPT_HTTPHEADER, array(                                                                          
	  	  'Content-Type: application/json',                                                                                
	  	  'Content-Length: ' . strlen($post))                                                                       
	  	);
	  	$result = curl_exec($ch);
	  	if (FALSE === $result){
        	print(curl_error($ch) . ' ' . curl_errno($ch));
	  	}
	  	curl_close($ch);  // Seems like good practice
	  	return $result;
	} catch(Exception $e) {
	    print('Curl failed with error #' . $e->getCode() . ': ' . $e->getMessage());
	}
}

// Print the result to the window.
print(sendPostData($API_ENDPOINT, $str_data));

?>