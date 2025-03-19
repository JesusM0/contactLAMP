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
    $userID = $inData["UserID"];
    $firstName = $inData["FirstName"];
    $lastName = $inData["LastName"];
    $email = $inData["Email"];
    $phone = $inData["Phone"];

    //start connection to DB using host(server), db user, db password, db name
    $conn = new mysqli("localhost", "webuser", "testpassword", "contact");

    if($conn->connect_error){
        returnWithError("Couldnt Connect to DB: " . $conn->connect_error);
    }
    else{
        //prepare is used to, the way i see it, in the databases query language. In this case, we are inserting into the database
        $stmt = $conn->prepare("INSERT INTO Contacts (UserID, FirstName, LastName, Email, Phone) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("issss", $userID, $firstName, $lastName, $email, $phone);

        if($stmt->execute()){
            //inserts the id into the db contact table
            $contactID = $stmt->insert_id;
            echo json_encode(["contactID" => $contactID, "message" => "Contact Added."]);
        }
        else{
            //DEBUGGING!!!!
            if($conn->errno == 1062){
                // error 1062 in mysql is a duplicate error, spent hours figuring this out -_-
                returnWithError("Duplicate Entry.. Which one?? IDK!");
            }
            else{
                returnWithError("Error: Something went Wrong" . $stmt->error);
            }
        }

        $stmt->close();
        $conn->close();
    }



?> 