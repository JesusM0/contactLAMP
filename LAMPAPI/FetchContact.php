<?php

function getRequestData() {
    return json_decode(file_get_contents('php://input'), true);
}

function sendResultAsJson($obj) {
    header('Content-type: application/json');
    echo $obj;
}

function returnWithError($err) {
    $retValue = json_encode(["error" => $err]);
    sendResultAsJson($retValue);
    exit();
}

$inData = getRequestData();
$userID = $inData["UserID"];

$conn = new mysqli("localhost", "webuser", "testpassword", "contact");

if ($conn->connect_error) {
    returnWithError("Couldn't connect to DB: " . $conn->connect_error);
} else {
    $stmt = $conn->prepare("SELECT * FROM Contacts WHERE UserID = ?");
    $stmt->bind_param("i", $userID);
    
    if ($stmt->execute()) {
        $result = $stmt->get_result();
        $contacts = [];
        while ($row = $result->fetch_assoc()) {
            $contacts[] = $row;
        }
        $retValue = json_encode(["Contacts" => $contacts]);
        sendResultAsJson($retValue);
    } else {
        returnWithError("Error Loading Contacts: " . $stmt->error);
    }

    $stmt->close();
    $conn->close();
}