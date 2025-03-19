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


$login = $inData["Login"];
$password = $inData["Password"];

$conn = new mysqli("localhost", "webuser", "testpassword", "contact");

if($conn->connect_error){
    returnWithError("Couldn't Connect to DB: " . $conn->connect_error);
}
else{
    // Prepare the SQL query to check if the user exists
    $stmt = $conn->prepare("SELECT ID, FirstName, LastName FROM Users WHERE Login = ? AND Password = ?");
    $stmt->bind_param("ss", $login, $password);

    if($stmt->execute()){
        $result = $stmt->get_result();
        if($result->num_rows > 0){
            // User found, return user details
            $row = $result->fetch_assoc();
            $userID = $row["ID"];
            $firstName = $row["FirstName"];
            $lastName = $row["LastName"];
            $retValue = json_encode([
                "userID" => $userID,
                "firstName" => $firstName,
                "lastName" => $lastName,
                "message" => "Login Successful"
            ]);
            sendResultAsJson($retValue);
        }
        else{

            returnWithError("Invalid Login or Password");
        }
    }
    else{

        returnWithError("Error: Something Went Wrong" . $stmt->error);
    }

    $stmt->close();
    $conn->close();
}