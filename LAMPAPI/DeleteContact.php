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

    //parameters to post into db
    $contactID = $inData["ContactID"];

    //start connection to DB using host(server), db user, db password, db name
    $conn = new mysqli("localhost", "webuser", "testpassword", "contact");

    //Connect to the server
    if($conn->connect_error){
        returnWithError("Couldnt Connect to DB: " . $conn->connect_error);
    }
    else{
        //prepare is used to, the way i see it, in the databases query language. In this case, we are inserting into the database
        $stmt = $conn->prepare("DELETE FROM Contacts WHERE ContactID = ?");
        $stmt->bind_param("i", $contactID);

        // Execute the query
        if ($stmt->execute()) {
            // Check if any rows were affected
            if ($stmt->affected_rows > 0) {
                //success message
                $retValue = json_encode(["message" => "Contact deleted."]);
                sendResultInfoAsJson($retValue);
            } else {
                returnWithError("Contact not found.");
            }
        } else {
            // Return error message
            returnWithError("Error deleting contact: " . $stmt->error);
        }

        $stmt->close();
        $conn->close();
    }
?>
 