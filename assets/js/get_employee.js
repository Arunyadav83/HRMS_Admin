document.addEventListener("DOMContentLoaded", function () {
    // Fetch all employees when the page loads
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
        employees.forEach((employee) => {
          appendEmployeeCard(employee); // Use the same card display function
        });
      })
      .catch((error) => {
        alert("Error: " + error.message);
        console.error("Error fetching employees: ", error);
      });
  });
  
  // Function to append employee cards with edit and delete buttons
  function appendEmployeeCard(employee) {
    const employeeCard = document.createElement("li");
    employeeCard.classList.add("notification-message");
  
    const employeeCardLink = document.createElement("a");
    employeeCardLink.href = "chat.html";
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
  
    const messageTime = document.createElement("span");
    messageTime.classList.add("message-time");
    messageTime.innerText = "27 Feb"; // Replace this with the actual data if available
    listBody.appendChild(messageTime);
  
    const messageContent = document.createElement("span");
    messageContent.classList.add("message-content");
    messageContent.innerText =
      employee.employeeDesignation || "No Designation";
    listBody.appendChild(messageContent);
  
    // Add Edit and Delete buttons
    const editButton = document.createElement("button");
    editButton.innerText = "Edit";
    editButton.classList.add("btn", "btn-primary");
    editButton.style.marginTop = "10px";
    editButton.addEventListener("click", function () {
      editEmployee(employee.employeeId);
    });
    listBody.appendChild(editButton);
  
    const deleteButton = document.createElement("button");
    deleteButton.innerText = "Delete";
    deleteButton.classList.add("btn", "btn-danger");
    deleteButton.style.marginLeft = "10px";
    deleteButton.style.marginTop = "10px";
    deleteButton.addEventListener("click", function () {
      deleteEmployee(employee.employeeId, employeeCard);
    });
    listBody.appendChild(deleteButton);
  
    document.querySelector(".staff-grid-row").appendChild(employeeCard);
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
    // Redirect to edit page or open a modal for editing the employee
    window.location.href = `/edit-employee.html?id=${employeeId}`;
  }


// function editEmployee(employeeId) {
//   // Fetch the employee data from the server using employeeId
//   fetch(`http://localhost:8081/api/employee/${employeeId}`, {
//     method: "GET",
//     headers: {
//       "Content-Type": "application/json",
//     },
//   })
//     .then((response) => {
//       if (response.ok) {
//         return response.json();
//       } else {
//         throw new Error("Failed to fetch employee details");
//       }
//     })
//     .then((employee) => {
//       // Populate the modal fields with employee data
//       document.getElementById("editedfirstname").value = employee.employeefirstName;
//       document.getElementById("editedLastName").value = employee.employeeLastName;
//       document.getElementById("editedusername").value = employee.employeeUsername;
//       document.getElementById("editedemail").value = employee.employeeEmail;
//       document.getElementById("editedpassword").value = employee.employeePassword;
//       document.getElementById("editedempid").value = employee.employeeId;
//       document.getElementById("editednumber").value = employee.employeePhonenumber;
//       document.getElementById("editedcompany").value = employee.employeeCompany;
//       document.getElementById("editeddepartment").value = employee.employeeDepartment;
//       document.getElementById("editeddesignation").value = employee.employeeDesignation;

//       // Show the modal
//       var editModal = new bootstrap.Modal(document.getElementById('edit_employee'));
//       editModal.show();
//     })
//     .catch((error) => {
//       alert("Error: " + error.message);
//       console.error("Error fetching employee details: ", error);
//     });
// }


document.querySelector(".submit-btn2").addEventListener("click", function (e) {
  e.preventDefault(); // Prevent form submission
  function formatDate(dateString) {
    const [day, month, year] = dateString.split("-");
    return `${year}-${month}-${day}`;
  }

  // Create the updated employee object based on the form fields
  const editedEmployee = {
    employeefirstName: document.getElementById("editedfirstname").value,
    employeeLastName: document.getElementById("editedLastName").value,
    employeeUsername: document.getElementById("editedusername").value,
    employeeEmail: document.getElementById("editedemail").value,
    employeePassword: document.getElementById("editedpassword").value,
    employeeConfirmpassword: document.getElementById("editedcpassword").value,
    employeeId: document.getElementById("editedempid").value,
    employeePhonenumber: document.getElementById("editednumber").value,
    employeeCompany: document.getElementById("editedcompany").value,
    employeeDepartment: document.getElementById("editeddepartment").value,
    employeeDesignation: document.getElementById("editeddesignation").value,
    employeeJoiningdate:formatDate(document.getElementById("editeddate").value)
  };
  console.log(editedEmployee);
  // Make the PUT request to update the employee
  fetch(`http://localhost:8081/api/employee/${editedEmployee.employeeId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(editedEmployee), // Send updated data as JSON
  })
    .then((response) => {
      if (response.ok) {
        return response.json(); // Parse the response if successful
      } else {
        throw new Error("Failed to update employee");
      }
    })
    .then((data) => {
      // Handle success - show a message and reload or update the UI
      alert("Employee updated successfully!");
      location.reload(); // Reload to see updated employee data
    })
    .catch((error) => {
      alert("Error: " + error.message); // Show error message
      console.error("Error updating employee: ", error);
    });
});
