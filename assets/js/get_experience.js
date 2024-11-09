// Function to fetch experience data for the employee
function fetchExperience(employeeId) {
    fetch(`http://localhost:8081/api/experience/${employeeId}`)
        .then(response => {
            // Check if the response status is OK (200-299)
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log('Experience data retrieved:', data);
            displayExperience(data); // Call a function to display the experience data
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
            alert('Error retrieving experience: ' + error.message); // Show user-friendly error
        });
}

// Function to display the experience data (customize this function as needed)
function displayExperience(experienceData) {
    const experienceList = document.getElementById('experienceList'); // Assuming you have a container for the experience data
    experienceList.innerHTML = ''; // Clear existing content

    // Check if experienceData is an array
    if (Array.isArray(experienceData) && experienceData.length > 0) {
        experienceData.forEach(experience => {
            const listItem = document.createElement('li'); // Create a new list item for each experience
            listItem.textContent = `${experience.jobposition} at ${experience.company} (${experience.periodfrom} - ${experience.periodto}), Location: ${experience.location}`;
            experienceList.appendChild(listItem); // Add the list item to the experience list
        });
    } else {
        experienceList.textContent = 'No experience data available.'; // Message for no experience data
    }
}

// Call the fetchExperience function after the employeeId is retrieved from localStorage
const employeeId = localStorage.getItem('employeeId');
if (employeeId) {
    fetchExperience(employeeId); // Fetch experience data for the employee
} else {
    console.error('No employee ID found in local storage.');
}
