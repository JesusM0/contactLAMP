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
let addContactEndPoint = `${urlBase}/AddContact.${extension}`;
let searchContactEndpoint = `${urlBase}/SearchContact.${extension}`;
let deleteContactEndpoint = `${urlBase}/DeleteContact.${extension}`;
let editContactEndpoint = `${urlBase}/EditContact.${extension}`
let fetchContactsEnpoint = `${urlBase}/FetchContact.${extension}`

//global vars
let userID = 0;
let firstName = "";
let lastName = "";

// Function to read cookie
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

function fetchContacts() {

    let reqData = {
        UserID: userID
    };

    let jsonPayload = JSON.stringify(reqData);
    let xhr = new XMLHttpRequest();
    xhr.open("POST", fetchContactsEnpoint, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let jsonObject = JSON.parse(xhr.responseText);
            if (jsonObject.Contacts) {
                let tableBody = document.getElementById('contactsTableBody');
                // Save the add contact row before clearing the table
                let addContactRow = document.getElementById('newContactRow');
                tableBody.innerHTML = '';
                
                // Add back the "Add Contact" row first
                tableBody.appendChild(addContactRow);

                if (jsonObject.Contacts.length > 0) {
                    jsonObject.Contacts.forEach(contact => {
                        let row = document.createElement('tr');
                        row.setAttribute('data-contact-id', contact.ContactID);
                        row.innerHTML = `
                        <td>${contact.FirstName}</td>
                        <td>${contact.LastName}</td>
                        <td>${contact.Phone}</td>
                        <td>${contact.Email}</td>
                        <td>
                        <button class="primary-button update-btn" onclick="updateContact(this)">Update</button>
                        <button class="primary-button delete-btn" onclick="deleteContact(this)">Delete</button>
                        </td>
                        `;
                        tableBody.appendChild(row);
                    });
                } 
            } 
            else {
                console.error("no contacts");
            }
        }
    }
    xhr.send(jsonPayload);
};
    



// Read cookie to get userID
document.addEventListener("DOMContentLoaded", function () {
    readCookie(); // Read the userID from the cookie
    console.log("User ID: ", userID);

    if (userID > 0) {
        fetchContacts(); 
    }
});



let isAddContactListenerAdded = false; // Flag to check if listener is added

// add a new contact
function addContact() {
    const firstName = document.getElementById('newFirstName').value.trim();
    const lastName = document.getElementById('newLastName').value.trim();
    const phone = document.getElementById('newPhone').value.trim();
    const email = document.getElementById('newEmail').value.trim();

    
    const searchQuery = document.getElementById('searchInput').value.trim();

    // check input
    if (!firstName || !lastName || !phone || !email) {
        alert("Please fill in all fields.");
        return;
    }

    let reqData = {
        UserID: userID, 
        FirstName: firstName,
        LastName: lastName,
        Email: email,
        Phone: phone,
    };

    let jsonPayload = JSON.stringify(reqData);
    let xhr = new XMLHttpRequest();
    xhr.open("POST", addContactEndPoint, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    try {
        xhr.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                document.getElementById("addContactResult").innerHTML = "Contact has been added";
                
                if (searchQuery) {
                    searchContact();
                } else {
                    setTimeout(fetchContacts, 500); // Delay fetching by 500ms
                }
            }
        };
        xhr.send(jsonPayload);
    } catch (err) {
        document.getElementById("addContactResult").innerHTML = err.message;
    }

    // Clear input fields
    document.getElementById('newFirstName').value = '';
    document.getElementById('newLastName').value = '';
    document.getElementById('newPhone').value = '';
    document.getElementById('newEmail').value = '';
    fetchContacts();
}




// Wait for the DOM to fully load
document.addEventListener('DOMContentLoaded', () => {
    // the Add Contact button
    const addContactBtn = document.getElementById('addContactBtn');

    if (addContactBtn) {
        //addContactBtn.addEventListener('click', addContact);
    }
    const searchButton = document.getElementById('searchButton'); 

    if (searchButton) {
        //searchButton.addEventListener('click', searchContact); 
    }
});

function deleteContact(button) {
    const row = button.parentElement.parentElement;
    const contactId = row.getAttribute('data-contact-id');

    const confirmDelete = confirm("Are you sure you want to delete this contact?");
    if (!confirmDelete) {
        return;
    }

    let reqData = {
        UserID: userID,
        ContactID: contactId
    };

    console.log(row.getAttribute('data-contact-id'));
    console.log(reqData);

    let xhr = new XMLHttpRequest(); 
    xhr.open("POST", deleteContactEndpoint, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    try {
        xhr.onreadystatechange = function() {
            if (this.readyState == 4) {
                if (this.status == 200) {
                    let response = JSON.parse(xhr.responseText);
                    if (response.error) {
                        alert(response.error);
                    } else {
                        // Only remove the row after successful deletion
                        row.parentElement.removeChild(row);
                        document.getElementById("addContactResult").innerHTML = "Contact has been deleted";
                    }
                } else {
                    alert("Error deleting contact");
                }
            }
        };
        xhr.send(JSON.stringify(reqData));
    } catch (err) {
        document.getElementById("addContactResult").innerHTML = err.message;
    }
}


function logout() {
    //resets user id and clears data
    userId = 0;
    firstName = "";
    lastName = "";
    document.cookie = "userId=; expires=Thu, 01 Jan 1970 00:00:00 GMT"; //clears userId cookie
    window.location.href = 'index.html';
}

function updateContact(button) {
    const row = button.parentElement.parentElement; // Get the row of the clicked button

    // Get the current values from the row
    const firstName = row.cells[0].innerText;
    const lastName = row.cells[1].innerText;
    const phone = row.cells[2].innerText;
    const email = row.cells[3].innerText;

    // Replace the row with input fields instead
    row.innerHTML = `
        <td><input type="text" value="${firstName}" id="editFirstName"></td>
        <td><input type="text" value="${lastName}" id="editLastName"></td>
        <td><input type="tel" value="${phone}" id="editPhone"></td>
        <td><input type="email" value="${email}" id="editEmail"></td>
        <td>
            <button class="primary-button" onclick="editContact(this)">Save</button>
            <button class="primary-button" onclick="cancelEdit(this)">Cancel</button>
        </td>
    `;
    let contactId = row.getAttribute('data-contact-id');
    document.getElementById('editContactID').value = contactId;
}

function editContact(button) {
    const row = button.parentElement.parentElement; // Get the row of the clicked button
    const firstName = document.getElementById('editFirstName').value;
    const lastName = document.getElementById('editLastName').value;
    const phone = document.getElementById('editPhone').value;
    const email = document.getElementById('editEmail').value;

    // check input
    if (!firstName || !lastName || !phone || !email) {
        alert("Please fill in all fields.");
        return;
    }

    // Get the contact ID from the row (assuming you have a data attribute for the ID)
    const contactId = row.getAttribute('data-contact-id');

    // Create the contact object
    const reqData = {
        ContactID: contactId,
        FirstName: firstName,
        LastName: lastName,
        Phone: phone,
        Email: email
    };

    // Create a new XMLHttpRequest object
    const xhr = new XMLHttpRequest();
    let jsonPayload = JSON.stringify(reqData);
    // Set the endpoint for the request
    xhr.open("PUT", editContactEndpoint, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    // Handle the response
    xhr.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (this.status == 200) {
                    fetchContacts();
            } else {
                alert("Error updating contact.");
                console.error("Error:", this.statusText);
            }
        }
    };

    // Convert the contact data to JSON string and send the request
    xhr.send(jsonPayload);
}

function cancelEdit(button) {
    const row = button.parentElement.parentElement; // Get the row of the button clicked
    // Revert the row back to what it was originally
    const firstName = row.cells[0].querySelector('input').value;
    const lastName = row.cells[1].querySelector('input').value;
    const phone = row.cells[2].querySelector('input').value;
    const email = row.cells[3].querySelector('input').value;

    row.innerHTML = `
        <td>${firstName}</td>
        <td>${lastName}</td>
        <td>${phone}</td>
        <td>${email}</td>
        <td>
            <button class="primary-button update-btn" onclick="updateContact(this)">Update</button>
            <button class="primary-button delete-btn" onclick="deleteContact(this)">Delete</button>
        </td>
    `;
}

function searchContact() {
    const query = document.getElementById('searchInput').value.trim(); // Get the search input value when the button is clicked
    const reqData = { 
        UserID: userID,
        search: query 
    };

    let jsonPayload = JSON.stringify(reqData);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", searchContactEndpoint, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    xhr.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (this.status == 200) {
                try {
                    const responseData = JSON.parse(xhr.responseText);
                    if (responseData.error) {
                        displayError(responseData.error);
                    } else {
                        
                        updateContactsTable(responseData.Contacts);
                    }
                } catch (e) {
                    displayError("An error occurred while processing the response."); 
                }
            } else {
                displayError("Error: " + this.statusText); // Handle HTTP errors
            }
        }
    };

    // Send the request with the JSON payload
    xhr.send(jsonPayload);
}

function resetSearch() {
    document.getElementById('searchInput').value = ''; 
    searchContact(); 
}



function updateContactsTable(contacts) {
    const tableBody = document.getElementById('contactsTableBody');

    // Preserve the "Add Contact" row
    const addContactRow = document.getElementById('newContactRow');

    // Clear only the contact rows, not the entire table
    tableBody.innerHTML = '';

    // Re-add the "Add Contact" row at the end
    tableBody.appendChild(addContactRow);

    if (contacts.length > 0) {
        contacts.forEach(contact => {
            const row = document.createElement('tr');
            row.setAttribute('data-contact-id', contact.ContactID);
            row.innerHTML = `
                <td>${contact.FirstName}</td>
                <td>${contact.LastName}</td>
                <td>${contact.Phone}</td>
                <td>${contact.Email}</td>
                <td>
                    <button class="primary-button update-btn" onclick="updateContact(this)">Update</button>
                    <button class="primary-button delete-btn" onclick="deleteContact(this)">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } else {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="5">No contacts found</td>';
        tableBody.appendChild(row);
    }
}





function displayError(message) {
    const errorContainer = document.getElementById('errorContainer');
    errorContainer.innerText = message;
    errorContainer.style.display = 'block';
}

function hideError() {
    const errorContainer = document.getElementById('errorContainer');
    errorContainer.style.display = 'none';
}











