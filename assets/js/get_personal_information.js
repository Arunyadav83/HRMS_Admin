// Fetch personal information using employee ID from localStorage
function fetchPersonalInformation() {
  const employeeId = localStorage.getItem('employeeId');
  if (!employeeId) {
    console.error("No employee ID found in localStorage.");
    return;
  }

  // Fetch personal information from the backend using employeeId
  fetch(`http://localhost:8082/api/employee`)
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
// Function to format date from dd-MM-yyyy to ISO (yyyy-MM-dd)
function formatDateToISO(dateStr) {
    const [day, month, year] = dateStr.split('-');
    return `${year}-${month}-${day}`;
}

// Retrieve employee ID from URL and store it in localStorage if not already present
function getEmployeeIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const employeeId = urlParams.get("id");

    if (employeeId) {
        localStorage.setItem('employeeId', employeeId); // Store it in localStorage
        return employeeId;
    }
    return localStorage.getItem('employeeId'); // Return from localStorage if already set
}

// Add event listener to the form for submission
document.getElementById("personalInfoForm").addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent form from reloading the page

    // Collect form data
    const personalInfo = {
        passportNo: document.getElementById("passportNoDisplay").value,
        passportExpirydate: formatDateToISO(document.getElementById("passportExpDateDisplay").value),
        telephone: document.getElementById("telephoneDisplay").value,
        nationality: document.getElementById("nationalityDisplay").value,
        religion: document.getElementById("religionDisplay").value,
        maritalStatus: document.getElementById("maritalStatusDisplay").value,
        employmentOfSpouse: document.getElementById("employmentOfSpouseDisplay").value,
        noOfChildren: document.getElementById("noOfChildrenDisplay").value,
    };

    // Retrieve employee ID
    const employeeId = getEmployeeIdFromUrl();
    if (!employeeId) {
        console.error("Employee ID not found.");
        return;
    }

    // Send data to the server
    fetch(`http://localhost:8082/api/personal/${employeeId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(personalInfo),
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to post personal information.');
        return response.json();
    })
    .then(data => {
        console.log("Personal details added successfully:", data);
        document.getElementById("personalInfoForm").reset(); // Reset the form

        // Close the offcanvas after successful submission
        const offcanvas = new bootstrap.Offcanvas(document.getElementById('personalInfoOffcanvas'));
        offcanvas.hide();

        // Update the display with the new values
        updatePersonalInfoDisplay(personalInfo);
    })
    .catch(error => {
        console.error("Error:", error);
    });
});

// Fetch personal information using employee ID from localStorage
function fetchPersonalInformation() {
    const employeeId = localStorage.getItem('employeeId');
    if (!employeeId) {
        console.error("No employee ID found in localStorage.");
        return;
    }

    // Fetch personal information from the backend using employeeId
    fetch(`http://localhost:8082/api/employee/${employeeId}`)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok.');
            return response.json();
        })
        .then(employeeData => {
            if (!employeeData.personal_information) {
                console.error("No personal information found for this employee.");
                return;
            }
            const personalInfo = employeeData.personal_information[0];
            updatePersonalInfoDisplay(personalInfo);
        })
        .catch(error => console.error("Error fetching personal information:", error));
}

// Update display fields with fetched data
function updatePersonalInfoDisplay(data) {
    document.getElementById("passportNoDisplay").value = data.passportNo || '';
    document.getElementById("passportExpDateDisplay").value = formatDateToDisplay(data.passportExpirydate) || '';
    document.getElementById("telephoneDisplay").value = data.telephone || '';
    document.getElementById("nationalityDisplay").value = data.nationality || '';
    document.getElementById("religionDisplay").value = data.religion || '';
    document.getElementById("maritalStatusDisplay").value = data.maritalStatus || '';
    document.getElementById("employmentOfSpouseDisplay").value = data.employmentOfSpouse || '';
    document.getElementById("noOfChildrenDisplay").value = data.noOfChildren || '';
}

// Function to format date as 'dd-MM-yyyy'
function formatDateToDisplay(dateStr) {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}-${month}-${year}`;
}

// Call fetchPersonalInformation when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
    const employeeId = getEmployeeIdFromUrl();
    if (employeeId) {
        fetchPersonalInformation();
    } else {
        console.error("Employee ID not found in URL or localStorage.");
    }
});
