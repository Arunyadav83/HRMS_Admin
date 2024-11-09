// Add event listener to the form for submission
<<<<<<< HEAD
document.getElementById("personal_information").addEventListener("submit", function (event) {
=======
document.getElementById("personalInfoForm").addEventListener("submit", function (event) {
>>>>>>> 869f502711416de6674617e5397e5c2ffac979bc
    event.preventDefault(); // Prevent form from reloading the page

    // Function to format date from dd-MM-yyyy to ISO (yyyy-MM-dd)
    function formatDateToISO(dateStr) {
        const [day, month, year] = dateStr.split('-');
        return `${year}-${month}-${day}`;
    }

    // Collect form data
    const personalInfo = {
        passportNo: document.getElementById("passportNo").value,
        passportExpirydate: formatDateToISO(document.getElementById("passportExpirydate").value),
        telephone: document.getElementById("telephone").value,
        nationality: document.getElementById("nationality").value,
        religion: document.getElementById("religion").value,
        martialStatus: document.getElementById("maritalStatus").value,
        employeementofspouse: document.getElementById("employmentOfSpouse").value,
        noofchildren: document.getElementById("noOfChildren").value,
    };

    // Retrieve employee ID (make sure it's already stored in localStorage)
    const employeeId = localStorage.getItem('employeeId');
    console.log("Employee ID: ", employeeId);

    // Send data to the server
<<<<<<< HEAD
    fetch(`http://localhost:8081/api/personal/${employeeId}`, {
=======
    fetch(`http://localhost:8082/api/personal/${employeeId}`, {
>>>>>>> 869f502711416de6674617e5397e5c2ffac979bc
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Ensure authorization token is sent
        },
        body: JSON.stringify(personalInfo),
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to post personal information.');
        return response.json();
    })
    .then(data => {
        console.log("Personal details added successfully:", data);
        document.getElementById("personal_information").reset(); // Reset the form

        // Close the modal after successful submission
        const modal = bootstrap.Modal.getInstance(document.getElementById('personal_info_modal'));
        modal.hide();  // Bootstrap 5 method to hide modal

        // Update the display with the new values
        updatePersonalInfoDisplay(personalInfo);
    })
    .catch(error => {
        console.error("Error:", error);
    });
});
