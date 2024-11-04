// Fetch personal information using employee ID from localStorage
function fetchPersonalInformation() {
  const employeeId = localStorage.getItem('employeeId');
  if (!employeeId) {
    console.error("No employee ID found in localStorage.");
    return;
  }

  // Fetch personal information from the backend using employeeId
  fetch(`http://localhost:8081/api/employee`)
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok.');

      return response.json();
    })
    .then((employeeData) => {
      const filteredPersonalDetails = employeeData.find(data => data.employeeId === Number(employeeId));

      return filteredPersonalDetails.personal_information[0] || []
    })
    .then((data) => {
      // Update display section with fetched data
      // console.log("data in personal: ", data);
      updatePersonalInfoDisplay(data);
    })
    .catch(error => console.error("Error fetching personal information:", error));
}

// Update display fields with fetched data
function updatePersonalInfoDisplay(data) {
  document.getElementById("passportNoDisplay").innerText = data.passportNo || '';
  document.getElementById("passportExpDateDisplay").innerText = formatDateToDisplay(data.passportExpirydate) || '';
  document.getElementById("telephoneDisplay").innerText = data.telephone || '';
  document.getElementById("nationalityDisplay").innerText = data.nationality || '';
  document.getElementById("religionDisplay").innerText = data.religion || '';
  document.getElementById("maritalStatusDisplay").innerText = data.martialStatus || '-'; // Fixed 'martialStatus' typo
  document.getElementById("employmentOfSpouseDisplay").innerText = data.employeementofspouse || ''; // Fixed 'employeementofspouse' typo
  document.getElementById("noOfChildrenDisplay").innerText = data.noofchildren || ''; // Fixed 'noofchildren' typo
}

// Function to format date as 'dd-MM-yyyy'
function formatDateToDisplay(dateStr) {
  if (!dateStr) return 'N/A';
  const [year, month, day] = dateStr.split('-');
  return `${day}-${month}-${year}`;
}

// // Call this function after edit to refresh personal info
// function refreshPersonalInfoAfterEdit() {
//   // Fetch the updated personal information and display it
//   fetchPersonalInformation();
// }

// // Add event listener to your refresh button to trigger the refresh
// document.getElementById('refreshButton').addEventListener('click', function () {
//   refreshPersonalInfoAfterEdit();
// });

// Call fetchBankInformation when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  setTimeout(() => {
    fetchPersonalInformation(); // Fetch bank info when the page is loaded
  }, 500);
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
