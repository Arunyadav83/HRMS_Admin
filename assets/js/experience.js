document.getElementById('experienceInfo').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent default form submission
    // Function to format the date from dd-MM-yyyy to yyyy-MM-dd
   function formatDate(dateString) {
    // Split the date string into components
    const parts = dateString.split("-");
    // Create a new date string in the "yyyy-MM-dd" format
    return `${parts[2]}-${parts[1]}-${parts[0]}`; // year-month-day
  }
  
    // Gather experience data from the modal form
    const experienceData = {
      company: document.getElementById("companyName").value,
      jobposition: document.getElementById("jobPosition").value,
      periodfrom: formatDate(document.getElementById("periodFrom").value),
      periodto:formatDate( document.getElementById("periodTo").value),
      location: document.getElementById("location").value
    };
    console.log(experienceData);
    
    const employeeId = localStorage.getItem('employeeId');
    console.log(employeeId);

    // Send POST request to the backend API
    fetch(`http://localhost:8081/api/experience/${employeeId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(experienceData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        console.log('Experience added:', data);
        // Close the modal
        alert("Experience information saved successfully!");
        $('#experience_info').modal('hide');
        // Reset the form fields
        document.getElementById('experienceInfo').reset();
        // Redirect to the profile page
        window.location.href = `profile.html?id=${employeeId}`;
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
        alert('Error adding experience: ' + error.message); // Show user-friendly error
    });
});
