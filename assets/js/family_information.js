document.querySelector('.submit-btn2').addEventListener('click', function (e) {
    // Prevent the default form submission behavior
    e.preventDefault();

    // function formatDate(dateString) {
    //     if (!dateString) {
    //         return '';  // Return an empty string if the date is not provided
    //     }
    //     // Split the date string into components
    //     const parts = dateString.split("-");
    //     // Create a new date string in the "dd-MM-yyyy" format
    //     return `${parts[2]}-${parts[1]}-${parts[0]}`; // day-month-year
    // }

    // Get form data
    const familyName = document.getElementById('familyName').value.trim();
    const relationship = document.getElementById('relationship').value.trim();
    const dateofbirth = document.getElementById('birthday').value;

    // if (!dateInput) {
    //     alert('Please provide a valid date of birth.');
    //     return;
    // }

   // const dateofbirth = formatDate(dateInput); // Format date from the input

    const phone = document.getElementById('phone').value.trim();
    const employeeId = localStorage.getItem('employeeId');
    
    console.log("EmployeeId:", employeeId);

    // Basic validation to check if all required fields are filled
    // if (!familyName || !relationship || !dateofbirth || !phone) {
    //     alert('Please fill all the fields');
    //     return;
    // }

    // Create the request body as JSON
    const requestData = {
        name: familyName,
        relationship: relationship,
        dateofbirth: dateofbirth,
        phone: phone
    };
    console.log(requestData);
    
    // Send POST request using fetch
    fetch(`http://localhost:8081/api/familyinformation/${employeeId}`, {  // Replace with your actual endpoint
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
    })
    
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Success:', data);
        alert("Family information saved successfully!");

        // Clear the form fields
        document.getElementById('familyInfoTableBody').reset();

        // Close the modal after submission
        const modalElement = bootstrap.Modal.getInstance(document.getElementById('family_info_modal'));
        modalElement.hide();
    //    window.location.href = `profile.html?id=${family.id}`;
        
        // Fetch the updated family information and update the table
        fetchFamilyInformation();  // Call the function to fetch and update the table
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});
 const family = JSON.parse(localStorage.getItem("requestedData")) || [];
