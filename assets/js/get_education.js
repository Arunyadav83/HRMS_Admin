function fetchEducationInformation() {
    const employeeId = localStorage.getItem('employeeId');
    if (!employeeId) {
        console.error("No employee ID found in localStorage.");
        return;
    }

    // Fetch education information from the backend using employeeId
    fetch(`http://localhost:8082/api/employee`)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok.');

            return response.json();
        })
        .then((employeeData) => {
            const filteredPersonalDetails = employeeData.find(data => data.employeeId === Number(employeeId));

            return filteredPersonalDetails.educationInformation[0] || []
        })
        .then((data) => {
            // Update display section with fetched data
            // console.log("data in education: ", data);
            updateEducationInfoDisplay(data);
        })
        .catch(error => console.error("Error fetching education information:", error));


    function updateEducationInfoDisplay(data) {
        document.getElementById('institutionDisplay').innerText = data.institution;
        document.getElementById('subject').innerText = data.subject;
        document.getElementById('startDateDisplay').innerText = formatDate(data.startingdate);
        document.getElementById('endDateDisplay').innerText = formatDate(data.completedate);
        document.getElementById('degreeDisaply').innerText = data.degree
        document.getElementById('gradeDisplay').innerText = data.grade;
    }

    // Function to format the date from dd-MM-yyyy to yyyy-MM-dd
    function formatDate(dateString) {
        if (!dateString) return '';
        const parts = dateString.split("-");
        if (parts.length === 3) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`; // Reformat as year-month-day
        }
        return dateString; // Return original string if invalid format
    }
}

document.addEventListener("DOMContentLoaded", function () {
    setTimeout(() => {
        fetchEducationInformation(); // Fetch education info when the page is loaded
    }, 500);
});


// // Create a form data object
// const formData = {
//     institution,
//     subject,
//     startingDate,
//     completeDate,
//     degree,
//     grade
// };

// console.log('Form Data:', formData); // Debugging output

// // Retrieve employee ID from localStorage (assuming it's already saved there)
// const employeeId = localStorage.getItem('employeeId');
// if (!employeeId) {
//     alert('Employee ID not found in local storage.');
//     return;
// }

// try {
//     // Send POST request to backend
//     const response = await fetch(`http://localhost:8082/api/educationInformation/${id}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(formData),
//     });

//     const result = await response.json();

//     if (response.ok) {
//         alert('Education information saved successfully!');
//         // Redirect to profile page
//         window.location.href = `profile.html?id=${employeeId}`;
//     } else {
//         alert('Error saving education information: ' + result.message);
//     }
// } catch (error) {
//     console.error('Error:', error);
//     alert('An error occurred while saving education information.');
// }