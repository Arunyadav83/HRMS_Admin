window.addEventListener("load", function () {
    // Get the employee ID from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const employeeId = urlParams.get("id");

    // Store employeeId in localStorage
    localStorage.setItem('employeeId', employeeId);
    console.log('Stored employeeId:', employeeId);

    if (employeeId) {
        // Replace this with your actual backend API endpoint
        const apiUrl = `http://localhost:8082/api/employee/${employeeId}`;

        // Make an API call to fetch employee details by employeeId
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(employee => {
                if (employee) {
                    // Populate profile page with employee details fetched from the API
                    document.getElementById("firstname").innerText = employee.employeefirstName;
                    document.getElementById("lastname").innerText = employee.employeeLastName || ''; 
                    document.getElementById("email").innerText = employee.employeeEmail || '';
                    document.getElementById("designation").innerText = employee.employeeDesignation;
                    document.getElementById("empid").innerText = employee.employeeId;
                    document.getElementById("date").innerText = `Date of Join: ${employee.employeeJoiningdate}`;
                    document.getElementById("phonenumber").innerText = employee.employeePhonenumber;
                    document.getElementById("dateofbirth").innerText = employee.dateofbirth;
                    document.getElementById("address").innerText = employee.address || '1861 Bayonne Ave, Manchester Township, NJ, 08759';
                    document.getElementById("gender").innerText = employee.gender || 'Male';

                    console.log('Employee data loaded successfully');
                } else {
                    console.error("Employee not found.");
                }
            })
            .catch(error => {
                console.error("Error fetching employee data:", error);
            });
    } else {
        console.error("No employee ID provided in URL.");
        // Check if we have an ID in localStorage as fallback
        const storedEmployeeId = localStorage.getItem('employeeId');
        if (storedEmployeeId) {
            window.location.href = `profile.html?id=${storedEmployeeId}`;
        } else {
            console.error("No employee ID found in localStorage either.");
        }
    }
});

// Add this function to handle form submissions
function handleFormSubmit(formData) {
    const employeeId = localStorage.getItem('employeeId');
    if (!employeeId) {
        console.error('No employeeId found in localStorage');
        return;
    }
    
    // Add employeeId to form data
    formData.append('employeeId', employeeId);
    
    // Continue with form submission
    return fetch('your-api-endpoint', {
        method: 'POST',
        body: formData
    });
}

// Add this to handle the case when user refreshes the page
window.addEventListener('beforeunload', function() {
    // Preserve the employeeId
    const currentEmployeeId = localStorage.getItem('employeeId');
    if (currentEmployeeId) {
        sessionStorage.setItem('tempEmployeeId', currentEmployeeId);
    }
});

// Check for stored ID when page loads
window.addEventListener('load', function() {
    const tempEmployeeId = sessionStorage.getItem('tempEmployeeId');
    if (tempEmployeeId && !localStorage.getItem('employeeId')) {
        localStorage.setItem('employeeId', tempEmployeeId);
        sessionStorage.removeItem('tempEmployeeId');
    }
});
