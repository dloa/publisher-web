<?php
// Set text to plain so we avoid including html, it is also better as the page will be smaller and load faster.
header("Content-Type: text/plain");

// http://api.alexandria.io/#announce-new-publisher
$API_ENDPOINT = 'http://localhost:41289/alexandria/v1/send';

if ($_POST['email'] != '')
  $md5email = md5($_POST['email']);
else
  $md5email = '';

$data = array(
  "alexandria-publisher" => array(
    "name" => $_POST['name'],
    "address" => $_POST['address'],
    "timestamp" => time(),
    "bitmessage" => $_POST['bitmessage'],
    "email" => $md5email
  ),
  "signature" => $_POST['signature']
  );

$str_data = json_encode($data);
//print($str_data);

function sendPostData($url, $post){
  $ch = curl_init($url);
  curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");  
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_POSTFIELDS,$post);
  curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1); 
  curl_setopt($ch, CURLOPT_HTTPHEADER, array(                                                                          
    'Content-Type: application/json',                                                                                
    'Content-Length: ' . strlen($post))                                                                       
  );
  $result = curl_exec($ch);
  curl_close($ch);  // Seems like good practice
  return $result;
}

// Print the result to the window.
print(sendPostData($API_ENDPOINT, $str_data));

?>