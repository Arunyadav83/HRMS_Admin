// Fetch bank information using employee ID from localStorage
function fetchBankInformation() {
    const employeeId = localStorage.getItem('employeeId'); // Retrieve employeeId from localStorage

    if (!employeeId) {
        console.error("No employee ID found in localStorage.");
        return;
    }

    // API call to get the bank information for the employee
    fetch(`http://localhost:8081/api/bankinformation/${employeeId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        // Populate the form fields with the fetched bank information
        document.getElementById("bankName").value = data.bankName || '';
        document.getElementById("accountNumber").value = data.bankAccountNo || '';
        document.getElementById("ifscCode").value = data.ifscCode || '';
        document.getElementById("panNumber").value = data.panNo || '';
        console.log("Bank information fetched successfully:", data);
    })
    .catch(error => {
        console.error("Error fetching bank information:", error);
    });
}

// Call fetchBankInformation when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
    fetchBankInformation(); // Fetch bank info when the page is loaded
});
