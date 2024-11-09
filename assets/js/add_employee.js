// Form submission event listener for the employee form
document
  .getElementById("employee_form")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent default form submission

    // Function to format the date from dd-MM-yyyy to yyyy-MM-dd
   function formatDate(dateString) {
  // Split the date string into components
  const parts = dateString.split("-");
  // Create a new date string in the "yyyy-MM-dd" format
  return `${parts[2]}-${parts[1]}-${parts[0]}`; // year-month-day
}

    // Fetch form data
    const firstname = document.getElementById("firstname").value;
    const lastname = document.getElementById("lastname").value;
    const empid = document.getElementById("empid").value;
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const date = formatDate(document.getElementById("date").value); // Joining date
    const phonenumber = document.getElementById("phonenumber").value; // Phone number
    const password = document.getElementById("password").value;
    const cpassword = document.getElementById("cpassword").value;
    const company = document.getElementById("company").value;
    const designation = document.getElementById("designation").value;
    const dateofbirth = formatDate(document.getElementById("dateofbirth").value);
    const Gender = document.getElementById("gender").value;
    const Address = document.getElementById("address").value;
    const department = document.getElementById("department").value;
    // const  adminId= localStorage.getItem("adminId")
    // console.log(adminId);
    // Create new employee object with the form data
    const newEmployee = {
      employeeId: empid,
      employeefirstName: firstname,
      employeeLastName: lastname,
      employeeEmail: email,
      employeeUsername: username,
      employeePassword: password,
      employeeConfirmpassword: cpassword,
      employeeJoiningdate: date,
      employeeCompany: company,
      employeeDesignation: designation,
      employeeDepartment: department,
      employeePhonenumber: phonenumber,
      dateofbirth: dateofbirth,
      address: Address,
      gender : Gender,
      // admin:adminId
        };

    // Log the employee data (optional for debugging)
    console.log(newEmployee);
    
    
    // Send POST request with the employee data to the backend
    fetch("http://localhost:8082/api/employee", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Send data as JSON
      },
      body: JSON.stringify(newEmployee),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Employee added:", data);
        appendEmployeeCard(data); // Append the new employee card to the grid
        document.getElementById("employee_form").reset(); // Reset the form
        const modalElement = bootstrap.Modal.getInstance(document.getElementById('add_employee'));
        modalElement.hide();
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });

// Function to append employee card layout to the UI
function appendEmployeeCard(employee) {
  // Create a div for the employee card
  const employeeCard = document.createElement("div");

  // Add classes to style the employee card
  employeeCard.classList.add(
    "employee-card",
    "col-md-4",
    "col-sm-6",
    "col-12",
    "col-lg-4",
    "col-xl-3"
  );

  // Create the card body div
  const employeeCardBody = document.createElement("div");
  employeeCardBody.classList.add("profile-widget");
  employeeCard.appendChild(employeeCardBody);

  // Create and append the profile image
  const profileImage = document.createElement("img");
  profileImage.src = "default-profile.png"; // Add default profile image
  profileImage.alt = "Profile Image"; // Add alt attribute for accessibility
  employeeCardBody.appendChild(profileImage);

  // Create and append the name element
  const nameElement = document.createElement("h2");
  nameElement.style.fontWeight = "bold";
  nameElement.innerText = employee.employeefirstName || "No Name"; // Fallback if no name
  employeeCardBody.appendChild(nameElement);

  // Create and append the designation element
  const designationElement = document.createElement("p");
  designationElement.style.fontWeight = "bold";
  designationElement.innerText =
    employee.employeeDesignation || "No Designation"; // Fallback if no designation
  employeeCardBody.appendChild(designationElement);

  // Append the employee card to the grid layout
  document.querySelector(".staff-grid-row").appendChild(employeeCard);

  // Add event listener for navigating to the profile page
  employeeCard.addEventListener("click", function () {
    window.location.href = `profile.html?id=${employee.employeeId}`;
  });
}

// Load employees from local storage and display them on page load
window.addEventListener("load", function () {
  const employees = JSON.parse(localStorage.getItem("newEmployee")) || [];

  if (employees.length > 0) {
    employees.forEach((employee) => {
      appendEmployeeCard(employee);
    });
  }
});
