document.querySelector('.submit-btn').addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent default form submission

    // Function to format the date from dd-MM-yyyy to yyyy-MM-dd
    function formatDate(dateString) {
        if (!dateString) return '';
        const parts = dateString.split("-");
        if (parts.length === 3) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`; // Reformat as year-month-day
        }
        return dateString; // Return original string if invalid format
    }

    // Capture form values
    const institution = document.getElementById('institution').value || '';
    const subject = document.getElementById('subject').value || '';
    const startingDate = formatDate(document.getElementById('startDate').value) || '';
    const completeDate = formatDate(document.getElementById('endDate').value) || '';
    const degree = document.getElementById('Degree').value || '';
    const grade = document.getElementById('Grade').value || '';

    // Create a form data object
    const formData = {
        institution,
        subject,
        startingDate,
        completeDate,
        degree,
        grade
    };

    console.log('Form Data:', formData); // Debugging output

    // Retrieve employee ID from localStorage (assuming it's already saved there)
    const employeeId = localStorage.getItem('employeeId');
    if (!employeeId) {
        alert('Employee ID not found in local storage.');
        return;
    }

    try {
        // Send POST request to backend
        const response = await fetch(`http://localhost:8081/api/educationInformation/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (response.ok) {
            alert('Education information saved successfully!');
            // Redirect to profile page
            window.location.href = `profile.html?id=${employeeId}`;
        } else {
            alert('Error saving education information: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while saving education information.');
    }
});
