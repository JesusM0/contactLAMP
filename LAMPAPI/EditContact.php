<?php

function getRequestData(){
    return json_decode(file_get_contents('php://input'), true);
}

function sendResultInfoAsJson($obj) {
    header('Content-type: application/json');
    echo $obj;
}

function returnWithError($err){
    $retValue = json_encode(["error" => $err]);
    sendResultInfoAsJson($retValue);
    exit();
}

//retrieve data from front end
$inData = getRequestData();

//Fetching parameters from the request
// use contactId instead of userID
$contactID = $inData["ContactID"];
$firstName = $inData["FirstName"];
$lastName = $inData["LastName"];
$email = $inData["Email"];
$phone = $inData["Phone"];

//start connection to DB using host(server), db user, db password, db name
$conn = new mysqli("localhost", "webuser", "testpassword", "contact");

if($conn->connect_error){
    returnWithError("Couldn't connect to DB: " . $conn->connect_error);
}

else {
    $stmt = $conn->prepare("UPDATE Contacts SET FirstName = ?, LastName = ?, Email = ?, Phone = ? WHERE ContactID = ?");
    $stmt->bind_param("ssssi", $firstName, $lastName, $email, $phone, $contactID);

    if($stmt->execute() === TRUE) {
        echo json_encode(["message" => "Contact updated."]);
    }
    else {
        returnWithError("Error: Something went Wrong" . $stmt->error);
    }

    $stmt->close();
    $conn->close();

}