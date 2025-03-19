<?php


function getRequestData(){
    return json_decode(file_get_contents('php://input'), true);
}


function sendResultAsJson($obj) {
    header('Content-type: application/json');
    echo $obj;
}


function returnWithError($err){
    $retValue = json_encode(["error" => $err]);
    sendResultAsJson($retValue);
    exit();
}

$inData = getRequestData();

$userID = $inData["UserID"];
$conn = new mysqli("localhost", "webuser", "testpassword", "contact");
$searchTerm = "%" . $inData["search"] . "%";

if($conn->connect_error){
    returnWithError("Couldn't connect to DB: " . $conn->connect_error);
}

else{
    $stmt = $conn->prepare("SELECT ContactID, FirstName, LastName, Email, Phone FROM Contacts WHERE UserID = ? AND (LOWER(FirstName) LIKE LOWER(?) OR LOWER(LastName) LIKE LOWER(?) OR LOWER(Email) LIKE LOWER(?) OR Phone LIKE ?)");
    $stmt->bind_param("issss", $userID, $searchTerm, $searchTerm, $searchTerm, $searchTerm);
    
    if ($stmt->execute()) {
        $result = $stmt->get_result();
        $contacts = [];

        //loop through and retrieve all matching contacts
        while ($row = $result->fetch_assoc()) {
            $contacts[] = $row;
        }

        if (count($contacts) > 0) {
            $retValue = json_encode(["Contacts" => $contacts]);
            sendResultAsJson($retValue);
        } else {
            returnWithError("No such person");
        }
    }

    else{
        returnWithError("Error: Something Went Wrong With Search" . $stmt->error);
    }

    $stmt->close();
    $conn->close();

}