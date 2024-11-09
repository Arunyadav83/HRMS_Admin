// Function to append employee cards with edit and delete buttons

function formatDate(dateString) {
  // Split the date string assuming it's in the format dd-MM-yyyy
  const [day, month, year] = dateString.split("-");
  //Return the date in the format yyyy-MM-dd
  return `${year}-${month}-${day}`;
}
function appendEmployeeCard(employee) {
  const employeeCard = document.createElement("div");
  employeeCard.classList.add(
    "col-md-4",
    "col-sm-6",
    "col-12",
    "col-lg-4",
    "col-xl-3"
  );

  employeeCard.setAttribute("data-employee-id", employee.employeeId); // Set employee ID as attribute for removal

  const profileWidget = document.createElement("div");
  profileWidget.classList.add("profile-widget");

  const profileImg = document.createElement("div");
  profileImg.classList.add("profile-img");

  const avatarLink = document.createElement("a");
  avatarLink.href = `profile.html?id=${employee.employeeId}`;
  avatarLink.classList.add("avatar");

  const profileImage = document.createElement("img");
  profileImage.src =
    employee.profileImageUrl || "assets/img/profiles/avatar-08.jpg"; // Default profile image
  profileImage.alt = "User Image";
  avatarLink.appendChild(profileImage);

  profileImg.appendChild(avatarLink);

  const profileAction = document.createElement("div");
  profileAction.classList.add("dropdown", "profile-action");

  const actionIcon = document.createElement("a");
  actionIcon.href = "#";
  actionIcon.classList.add("action-icon", "dropdown-toggle");
  actionIcon.setAttribute("data-bs-toggle", "dropdown");
  actionIcon.setAttribute("aria-expanded", "false");
  actionIcon.innerHTML = '<i class="material-icons">more_vert</i>';

  const dropdownMenu = document.createElement("div");
  dropdownMenu.classList.add("dropdown-menu", "dropdown-menu-right");

  const editLink = document.createElement("a");
  editLink.classList.add("dropdown-item");
  editLink.href = "#";
  editLink.setAttribute("data-bs-toggle", "modal");
  editLink.setAttribute("data-bs-target", "#edit_employee");
  editLink.innerHTML = '<i class="fa-solid fa-pencil m-r-5"></i> Edit';
  editLink.addEventListener("click", () => editEmployee(employee.employeeId));

  const deleteLink = document.createElement("a");
  deleteLink.classList.add("dropdown-item");
  deleteLink.href = "#";
  deleteLink.setAttribute("data-bs-toggle", "modal");
  deleteLink.setAttribute("data-bs-target", "#delete_employee");
  deleteLink.innerHTML = '<i class="fa-regular fa-trash-can m-r-5"></i> Delete';
  deleteLink.addEventListener("click", () =>
    deleteEmployee(employee.employeeId)
  );

  dropdownMenu.appendChild(editLink);
  dropdownMenu.appendChild(deleteLink);

  profileAction.appendChild(actionIcon);
  profileAction.appendChild(dropdownMenu);

  const userName = document.createElement("h4");
  userName.classList.add("user-name", "m-t-10", "mb-0", "text-ellipsis");
  userName.innerHTML = `<a href="profile.html?id=${employee.employeeId}">${
    employee.employeefirstName || "No Name"
  }</a>`;

  const designation = document.createElement("div");
  designation.classList.add("small", "text-muted");
  designation.innerText = employee.employeeDesignation || "No Designation";

  profileWidget.appendChild(profileImg);
  profileWidget.appendChild(profileAction);
  profileWidget.appendChild(userName);
  profileWidget.appendChild(designation);

  employeeCard.appendChild(profileWidget);
  document.querySelector(".staff-grid-row").appendChild(employeeCard);
}

// Function to delete an employee
function deleteEmployee(employeeId) {
  fetch(`http://localhost:8081/api/employee/${employeeId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (response.ok) {
        // Remove the employee card from the DOM
        const employeeCard = document.querySelector(
          `div[data-employee-id="${employeeId}"]`
        );
        if (employeeCard) {
          employeeCard.remove(); // Remove the employee card
        }
        // alert("Employee deleted successfully!");
      } else {
        throw new Error("Failed to delete employee");
      }
    })
    .catch((error) => {
      alert("Error: " + error.message);
      console.error("Error deleting employee: ", error);
    });
}

// function editEmployee(employeeId) {
//   // Fetch employee data from the server
//   fetch(`http://localhost:8081/api/employee/${employeeId}`)
//     .then(response => response.json())
//     .then(employee => {
//       // Populate the modal with employee data
//       document.getElementById("editedfirstname").value = employee.employeefirstName;
//       document.getElementById("editedLastName").value = employee.employeeLastName;
//       document.getElementById("editedusername").value = employee.employeeUsername;
//       document.getElementById("editedemail").value = employee.employeeEmail;
//       document.getElementById("editedpassword").value = employee.employeePassword;
//       document.getElementById("editednumber").value = employee.employeePhonenumber;
//       document.getElementById("editedempid").value = employee.employeeId;
//       document.getElementById("editedcompany").value = employee.employeeCompany;
//       document.getElementById("editeddepartment").value = employee.employeeDepartment;
//       document.getElementById("editeddesignation").value = employee.employeeDesignation;
      
//       // Show the modal
//       const editModal = new bootstrap.Modal(document.getElementById('edit_employee'));
//       editModal.show();
//     })
//     .catch(error => {
//       console.error("Error fetching employee data: ", error);
//       alert("Failed to fetch employee details");
//     });
// }

// Function to handle the edit button click
function handleEditButtonClick(employeeId) {
  fetchEmployeeData(employeeId);
}

// Example usage: Call handleEditButtonClick with the employeeId when needed
 //handleEditButtonClick(employeeId);
