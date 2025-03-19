document.addEventListener('DOMContentLoaded', () => {
    //const urlBase = 'http://localhost/LAMPAPI'
    const urlBase = 'http://practestah.ahclass.xyz/LAMPAPI';
    const extension = 'php';

    // Popup functionality
    const createUserBtn = document.getElementById('createUserBtn');
    const createUserPopup = document.getElementById('createUserPopup');
    const closeBtn = document.querySelector('.close-btn');

    //defined functions for forms
    const newContactForm = document.getElementById('newContactForm');
    const createUserForm = document.getElementById('createUserForm');

    //PHP ENDPOINTS
    let createEndPoint = `${urlBase}/Create.${extension}`;

    //global vars
    let userID = 0;
    let firstName = "";
    let lastName = "";

    // Open popup
    createUserBtn.addEventListener('click', () => {
        createUserPopup.style.display = 'block';
    });

    // Close popup
    closeBtn.addEventListener('click', () => {
        createUserPopup.style.display = 'none';
    });

    // Close popup when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === createUserPopup) {
            createUserPopup.style.display = 'none';
        }
    });

    function displayError(message) {
        const errorContainer = document.getElementById('errorContainer');
        errorContainer.innerText = message;
        errorContainer.style.display = 'block';
    }

    function hideError() {
        const errorContainer = document.getElementById('errorContainer');
        errorContainer.style.display = 'none';
    }
    
    // Handle create form submission
    createUserForm.addEventListener('submit', (e) => {
        e.preventDefault();
        hideError(); // Hide any previous errors
    
        firstName = document.getElementById('firstName').value;
        lastName = document.getElementById('lastName').value;
        let password = document.getElementById('confirmPassword').value;
        let login = document.getElementById('newUsername').value;
        let email = document.getElementById('email').value;
        let phone = document.getElementById('phone').value;
    
        let reqData = {
        FirstName: firstName,
        LastName: lastName,
        Login: login,
        Email: email,
        Phone: phone,
        Password: password
        };
    
        console.log("Sending Request Data:", reqData);
    
        let jsonPayload = JSON.stringify(reqData);
        let xhr = new XMLHttpRequest();
        xhr.open("POST", createEndPoint, true);
        xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
        xhr.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            let jsonObject = JSON.parse(xhr.responseText);
            userID = jsonObject.userID;
            if (jsonObject.error) {
                displayError(jsonObject.error);
            } else {
                userID = jsonObject.userID;
                createUserPopup.style.display = 'none';
            }
        }
        else{
            displayError("Error: ", xhr.status, xhr.responseText);
        }
        }
        xhr.send(jsonPayload);
    });

    function loginCookie(userID){
        let minutes = 60;
        let date = new Date();
        date.setTime(date.getTime()+(minutes*60*1000));
        //set the cookie parameters
        document.cookie = "firstName=" + firstName + ";";
        document.cookie = "lastName=" + lastName + ";";
        document.cookie = "userID=" + userID + "; expires=" + date.toGMTString() + "; path=/";
    }

    function readCookie(){
        userID = -1;
        //take the cookie for the logged in user and split the cookie parameters
        let data = document.cookie.split(";");

        //search the data for the userID by trimming it and looking for where it starts with userid=
        for(let i = 0; i < data.length; i++){
            let cookieID = data[i].trim();
            if(cookieID.startsWith("userID=")){
                //userID is now the one found in the split.
                userID = cookieID.split("=")[1];
                break;
            }
        }
    }

    // Handle login form submission
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        let username = document.getElementById('username').value;
        let password = document.getElementById('password').value;

        if(!username || !password) {
            displayError("Must have both fields");
            return;
        }

        let xhr = new XMLHttpRequest();
        let url = urlBase + '/Login.' + extension;

        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/json");

        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                let response = JSON.parse(xhr.responseText);
                
                if (xhr.status === 200) {
                    if (response.error) {
                        displayError(response.error);
                    } else {
                        userID = response.userID;
                        firstName = response.firstName;
                        lastName = response.lastName;
                        loginCookie(userID);
                        // Redirect to contact page
                        window.location.href = 'contact.html'
                    }
                } else {
                    displayError('Error logging in. Please try again.');
                    console.error(xhr.statusText);
                }
            }
        };

        let jsonPayload = JSON.stringify({
            Login: username,
            Password: password
        });
        console.log("Sending Request Data:", jsonPayload);

        xhr.send(jsonPayload);
    });
});