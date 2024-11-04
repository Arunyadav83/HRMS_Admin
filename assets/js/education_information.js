document.getElementById('educationInfo').addEventListener('submit', async function (event) {
    event.preventDefault();

    // Function to format the date from dd-MM-yyyy to yyyy-MM-dd
    function formatDate(dateString) {
        if (!dateString) return '';
        // Split the date string into components (assuming input is in dd-MM-yyyy format)
        const parts = dateString.split("-");
        // Check if the date is valid before formatting
        if (parts.length === 3) {
            // Create a new date string in the "yyyy-MM-dd" format
            return `${parts[2]}-${parts[1]}-${parts[0]}`; // year-month-day
        }
        return dateString; // Return the original string if the format is invalid
    }

    // Check if form elements exist and capture their values
    const institution = document.getElementById('institution')?.value || '';
    const subject = document.getElementById('subject')?.value || '';
    const startingdate =formatDate( document.getElementById('startDate')?.value )|| '';
    const completedate = formatDate(document.getElementById('endDate')?.value )|| '';
    const degree = document.getElementById('Degree')?.value || ''; // Degree should not be formatted as a date
    const grade = document.getElementById('Grade')?.value || '';

    // Collect form data into an object
    const formData = {
        institution,
        subject,
        startingdate,
        completedate,
        degree,
        grade
    };

    console.log(formData);
    const employeeId = localStorage.getItem('employeeId');
    console.log(employeeId);

    try {
        // Send POST request to the backend API
        const response = await fetch(`http://localhost:8081/api/educationInformation/${employeeId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData),
        });

        // Parse the JSON response
        const result = await response.json();

        // Redirect to profile page after successful submission
        if (response.ok) {
            alert('Education information saved successfully!');
            window.location.href = `profile.html?id=${employeeId}`;
        } else {
            alert('Error saving education information: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while saving the education information.');
    }
});
