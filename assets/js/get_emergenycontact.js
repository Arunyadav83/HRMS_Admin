function fetchEmergencyContactInformation() {
    const employeeId = localStorage.getItem('employeeId');
    if (!employeeId) {
        console.error("No employee ID found in localStorage.");
        return;
    }

    // Fetch education information from the backend using employeeId
    fetch(`http://localhost:8081/api/employee`)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok.');

            return response.json();
        })
        .then((employeeData) => {
            const filteredEmergencyDetails = employeeData.find(data => data.employeeId === Number(employeeId));

            return filteredEmergencyDetails.emergencyContact[0] || []
        })
        .then((data) => {
            // Update display section with fetched data
            console.log("data in  emergencyCOntact: ", data);
            updateEmergencyContactDisplay(data);
        })
        .catch(error => console.error("Error fetching education information:", error));


    function  updateEmergencyContactDisplay(data) {
        document.getElementById('primaryNameDisplay').innerText = data.primaryName;
        document.getElementById('primaryRelationshipDisplay').innerText = data.primaryRelationship;
        document.getElementById('primaryphoneDisplay').innerText =data.primaryPhone
        document.getElementById('secondaryNameDisplay').innerText = data.secondaryName
        document.getElementById('secondaryRelationshipDisplay').innerText = data.secondaryRelationship;
        document.getElementById('secondaryPhoneDisplay').innerText = data.secondaryPhone
        
        // document.getElementById('gradeDisplay').innerText = data.grade;
    }

    // Function to format the date from dd-MM-yyyy to yyyy-MM-dd
    // function formatDate(dateString) {
    //     if (!dateString) return '';
    //     const parts = dateString.split("-");
    //     if (parts.length === 3) {
    //         return `${parts[2]}-${parts[1]}-${parts[0]}`; // Reformat as year-month-day
    //     }
    //     return dateString; // Return original string if invalid format
    // }
}

document.addEventListener("DOMContentLoaded", function () {
    setTimeout(() => {
        fetchEmergencyContactInformation(); // Fetch education info when the page is loaded
    }, 500);
});
