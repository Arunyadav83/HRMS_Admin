function fetchExperienceInformation() {
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
            const filteredExperienceDetails = employeeData.find(data => data.employeeId === Number(employeeId));

            return filteredExperienceDetails.exeperienceInformation[0] || []
        })
        .then((data) => {
            // Update display section with fetched data
            console.log("data in experince: ", data);
            updateExperienceInfoDisplay(data);
        })
        .catch(error => console.error("Error fetching education information:", error));


    function updateExperienceInfoDisplay(data) {
        document.getElementById('companyNameDisplay').innerText = data.company;
        document.getElementById('locationDisplay').innerText = data.location;
        document.getElementById('periodfromDisplay').innerText = formatDate(data.periodfrom);
        document.getElementById('periodtoDisplay').innerText = formatDate(data.periodto);
        document.getElementById('jopositionDisplay').innerText = data.jobposition;
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
        fetchExperienceInformation(); // Fetch education info when the page is loaded
    }, 500);
});
