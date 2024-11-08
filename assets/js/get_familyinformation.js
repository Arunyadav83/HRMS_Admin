function fetchFamilyInformation() {
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
            const filteredExperienceDetails = employeeData.find(data => data.employeeId === Number(employeeId));

            return filteredExperienceDetails.familyinformation[0] || []
        })
        .then((data) => {
            // Update display section with fetched data
            console.log("data in familyInfo: ", data);
            updateFamilyInfoDisplay(data);
        })
        .catch(error => console.error("Error fetching education information:", error));


    function updateFamilyInfoDisplay(data) {
        document.getElementById('nameDisplay').innerText = data.name;
        document.getElementById('relationshipDisplay').innerText = data.relationship;
        document.getElementById('birthdayDisplay').innerText = formatDate(data.dateofbirth);
        document.getElementById('phoneDisplay').innerText = data.phone
        // document.getElementById('gradeDisplay').innerText = data.grade;
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
        fetchFamilyInformation(); // Fetch education info when the page is loaded
    }, 500);
});
