// Fetch bank information using employee ID from localStorage
function fetchBankInformation() {
    const employeeId = localStorage.getItem('employeeId'); // Retrieve employeeId from localStorage
    console.log(employeeId);


    if (!employeeId) {
        console.error("No employee ID found in localStorage.");
        return;
    }

    // API call to get the bank information for the employee
    fetch(`http://localhost:8082/api/employee`, {
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
        .then((employeesData) => {
            // Find the bank details that match the given employeeId
            const filteredBankDetails = employeesData.find(data => data.employeeId === Number(employeeId));

            return filteredBankDetails.bankinformation[0] || []
        })
        .then(data => {
            // Populate the form fields with the fetched bank information
            document.getElementById("bankName").innerText = data.bankName || '';
            document.getElementById("accountNumber").innerText = data.bankAccountNo || '';
            document.getElementById("ifscCode").innerText = data.ifscCode || '';
            document.getElementById("panNumber").innerText = data.panNo || '';
            // console.log("Bank information fetched successfully:", data);
        })
        .catch(error => {
            console.error("Error fetching bank information:", error);
        });
}

// Call fetchBankInformation when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
    setTimeout(() => {
        fetchBankInformation(); // Fetch bank info when the page is loaded
    }, 500);
});
