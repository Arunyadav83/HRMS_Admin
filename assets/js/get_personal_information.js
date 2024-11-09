// Fetch personal information using employee ID from localStorage
function fetchPersonalInformation() {
  const employeeId = localStorage.getItem('employeeId');
  if (!employeeId) {
    console.error("No employee ID found in localStorage.");
    return;
  }

  // Fetch personal information from the backend using employeeId
  fetch(`http://localhost:8081/api/personal/${employeeId}`, { // Corrected 'personalId' to 'employeeId'
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`, // If authorization is required
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  })
  .then(response => {
    if (!response.ok) throw new Error('Network response was not ok.');
    return response.json();
  })
  .then(data => {
    // Update the modal form fields with the fetched data
    document.getElementById("passportNo").value = data.passportNo || '';
    document.getElementById("passportExpirydate").value = formatDateToDisplay(data.passportExpirydate) || ''; 
    document.getElementById("telephone").value = data.telephone || '';
    document.getElementById("nationality").value = data.nationality || '';
    document.getElementById("religion").value = data.religion || '';
    document.getElementById("maritalStatus").value = data.maritalStatus || '-'; // Fixed 'martialStatus' typo
    document.getElementById("employmentOfSpouse").value = data.employmentOfSpouse || ''; // Fixed 'employeementofspouse' typo
    document.getElementById("noOfChildren").value = data.noOfChildren || ''; // Fixed 'noofchildren' typo

    // Update display section with fetched data
    updatePersonalInfoDisplay(data);
  })
  .catch(error => console.error("Error fetching personal information:", error));
}

// Update display fields with fetched data
function updatePersonalInfoDisplay(data) {
  document.getElementById("passportNoDisplay").textContent = data.passportNo || 'N/A';
  document.getElementById("passportExpDateDisplay").textContent = formatDateToDisplay(data.passportExpirydate) || 'N/A';
  document.getElementById("telephoneDisplay").textContent = data.telephone || 'N/A';
  document.getElementById("nationalityDisplay").textContent = data.nationality || 'N/A';
  document.getElementById("religionDisplay").textContent = data.religion || 'N/A';
  document.getElementById("maritalstatusDisplay").textContent = data.maritalStatus || 'N/A'; // Fixed typo
  document.getElementById("employmentOfSpouseDisplay").textContent = data.employmentOfSpouse || 'N/A'; // Fixed typo
  document.getElementById("noOfChildrenDisplay").textContent = data.noOfChildren || 'N/A'; // Fixed typo
}

// Function to format date as 'dd-MM-yyyy'
function formatDateToDisplay(dateStr) {
  if (!dateStr) return 'N/A';
  const [year, month, day] = dateStr.split('-');
  return `${day}-${month}-${year}`;
}

// Call this function after edit to refresh personal info
function refreshPersonalInfoAfterEdit() {
  // Fetch the updated personal information and display it
  fetchPersonalInformation();
}

// Add event listener to your refresh button to trigger the refresh
document.getElementById('refreshButton').addEventListener('click', function() {
  refreshPersonalInfoAfterEdit();
});

// No need for manual cache clearing since 'Cache-Control' headers prevent caching
window.addEventListener("load", function () {
  // Get the employee ID from the URL
  const urlParams = new URLSearchParams(window.location.search);
  const employeeId = urlParams.get("id");
  
  if (employeeId) {
    // Store employeeId in localStorage
    localStorage.setItem('employeeId', employeeId);

    // Replace this with your actual backend API endpoint
    const apiUrl = `http://localhost:8081/api/employee/${employeeId}`; // Corrected 'personalId' to 'employeeId'

    // Make an API call to fetch employee details by employeeId
    fetch(apiUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(employee => {
        if (employee) {
          // Populate profile page with employee details fetched from the API
          document.getElementById("passportNo").innerText = employee.passportNo || ''; // Fixed to correct field name
          document.getElementById("lastname").innerText = employee.employeeLastName || '';
          document.getElementById("email").innerText = employee.employeeEmail || '';
          document.getElementById("designation").innerText = employee.employeeDesignation || '';
          document.getElementById("empid").innerText = employee.employeeId;
          document.getElementById("date").innerText = `Date of Join: ${employee.employeeJoiningDate}`; // Fixed to 'employeeJoiningDate'
          document.getElementById("phonenumber").innerText = employee.employeePhoneNumber || ''; // Fixed to 'employeePhoneNumber'
          document.getElementById("dateofbirth").innerText = employee.dateOfBirth || ''; // Fixed 'dateofbirth' typo
          document.getElementById("address").innerText = employee.address || 'Address not available';
          document.getElementById("gender").innerText = employee.gender || 'Not specified';

        } else {
          console.error("Employee not found.");
        }
      })
      .catch(error => {
        console.error("Error fetching employee data:", error);
      });
  } else {
    console.error("No employee ID provided.");
  }
});
