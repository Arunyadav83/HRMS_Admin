document.addEventListener("DOMContentLoaded", function () {
  // Fetch all employees when the page loads
  fetchEmployees();
});

function fetchEmployees() {
  fetch("http://localhost:8081/api/employee", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (response.ok) {
        return response.json(); // Parse the JSON response
      } else {
        throw new Error("Failed to fetch employees");
      }
    })
    .then((employees) => {
      console.log("Employees fetched: ", employees);
      // Loop through the employee list and append each employee card
      employees.forEach(appendEmployeeCard);
    })
    .catch((error) => {
      alert("Error: " + error.message);
      console.error("Error fetching employees: ", error);
    });
}

// Function to append employee cards with edit and delete buttons
function appendEmployeeCard(employee) {
  const employeeCard = document.createElement("li");
  employeeCard.classList.add("notification-message");

  const employeeCardLink = document.createElement("a");
  employeeCardLink.href = "#"; // Prevent default redirect for now
  employeeCard.appendChild(employeeCardLink);

  const listItem = document.createElement("div");
  listItem.classList.add("list-item");
  employeeCardLink.appendChild(listItem);

  const listLeft = document.createElement("div");
  listLeft.classList.add("list-left");
  listItem.appendChild(listLeft);

  const avatar = document.createElement("span");
  avatar.classList.add("avatar");
  listLeft.appendChild(avatar);

  const profileImage = document.createElement("img");
  profileImage.src = "assets/img/profiles/avatar-08.jpg"; // Default profile image
  profileImage.alt = "User Image";
  avatar.appendChild(profileImage);

  const listBody = document.createElement("div");
  listBody.classList.add("list-body");
  listItem.appendChild(listBody);

  const nameElement = document.createElement("span");
  nameElement.classList.add("message-author");
  nameElement.innerText = employee.employeefirstName || "No Name";
  listBody.appendChild(nameElement);

  const messageContent = document.createElement("span");
  messageContent.classList.add("message-content");
  messageContent.innerText = employee.employeeDesignation || "No Designation";
  listBody.appendChild(messageContent);

  // Add Edit and Delete buttons
  createButton(listBody, "Edit", "btn-primary", () => editEmployee(employee.employeeId));
  createButton(listBody, "Delete", "btn-danger", () => deleteEmployee(employee.employeeId, employeeCard));

  document.querySelector(".staff-grid-row").appendChild(employeeCard);
}

function createButton(parent, text, btnClass, onClickHandler) {
  const button = document.createElement("button");
  button.innerText = text;
  button.classList.add("btn", btnClass);
  button.style.marginTop = "10px";
  button.addEventListener("click", onClickHandler);
  parent.appendChild(button);
}

// Function to delete an employee
function deleteEmployee(employeeId, employeeCard) {
  if (confirm("Are you sure you want to delete this employee?")) {
    fetch(`http://localhost:8081/api/employee/${employeeId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.ok) {
          // Remove the employee card from the DOM
          employeeCard.remove();
          alert("Employee deleted successfully!");
        } else {
          throw new Error("Failed to delete employee");
        }
      })
      .catch((error) => {
        alert("Error: " + error.message);
        console.error("Error deleting employee: ", error);
      });
  }
}

// Function to edit an employee
function editEmployee(employeeId) {
  // Fetch the employee data from the server using employeeId
  fetch(`http://localhost:8082/api/employee/${employeeId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Failed to fetch employee details");
      }
    })
    .then((employee) => {
      // Populate the modal fields with employee data
      populateEditForm(employee);
      // Show the modal
      var editModal = new bootstrap.Modal(document.getElementById("edit_employee"));
      editModal.show();
    })
    .catch((error) => {
      alert("Error: " + error.message);
      console.error("Error fetching employee details: ", error);
    });
}

function populateEditForm(employee) {
  document.getElementById("editedfirstname").value = employee.employeefirstName;
  document.getElementById("editedLastName").value = employee.employeeLastName;
  document.getElementById("editedusername").value = employee.employeeUsername;
  document.getElementById("editedemail").value = employee.employeeEmail;
  document.getElementById("editedpassword").value = employee.employeePassword;
  document.getElementById("editedempid").value = employee.employeeId;
  document.getElementById("editednumber").value = employee.employeePhonenumber;
  document.getElementById("editedcompany").value = employee.employeeCompany;
  document.getElementById("editeddepartment").value = employee.employeeDepartment;
  document.getElementById("editeddesignation").value = employee.employeeDesignation;
  document.getElementById("editedbirthday").value=employee.dateofbirth;
  document.getElementById("editedaddress").value=employee.address;
  document.getElementById("editedgender").value=employee.gender;
}

// Submit the edited employee data
document.querySelector('.editbtn').addEventListener('click', function (e) {
  e.preventDefault(); // Prevent form submission

  // Create the updated employee object
  const editedEmployee = {
    employeefirstName: document.getElementById("editedfirstname").value,
    employeeLastName: document.getElementById("editedLastName").value,
    employeeUsername: document.getElementById("editedusername").value,
    employeeEmail: document.getElementById("editedemail").value,
    employeePassword: document.getElementById("editedpassword").value,
    employeePhonenumber: document.getElementById("editednumber").value,
    employeeCompany: document.getElementById("editedcompany").value,
    employeeDepartment: document.getElementById("editeddepartment").value,
    employeeDesignation: document.getElementById("editeddesignation").value,
    dateofbirth:document.getElementById("editedbirthday").value,
    gender:document.getElementById("editedgender").value,
    address:document.getElementById("editedaddress").value
  };
   console.log(editedEmployee);
  // Send the updated employee data to the server using PUT
  const employeeId = document.getElementById("editedempid").value;
  fetch(`http://localhost:8082/api/employee/${employeeId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(editedEmployee),
  })
    .then((response) => {
      if (response.ok) {
        alert("Employee updated successfully!");
        // Refresh the employee list
        fetchEmployees();
        // Close the modal
        
       editEmployee()
        var editModal = bootstrap.Modal.getInstance(document.getElementById("edit_employee"));
        editModal.hide();
      } else {
        throw new Error("Failed to update employee");
      }
    })
    .catch((error) => {
      alert("Error: " + error.message);
      console.error("Error updating employee: ", error);
    });
});
