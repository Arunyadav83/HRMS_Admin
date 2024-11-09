window.addEventListener("load", function () {
    // Get the employee ID from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const employeeId = urlParams.get("id");
    // Store employeeId in localStorage
       localStorage.setItem('employeeId', employeeId);


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
                    document.getElementById("firstname").innerText = employee.employeefirstName ;
                    document.getElementById("lastname").innerText = employee.employeeLastName || ''; // Ensure you have this in your HTML
                    document.getElementById("email").innerText = employee.employeeEmail || '';
                    document.getElementById("designation").innerText = employee.employeeDesignation ;
                  document.getElementById("empid").innerText = employee.employeeId;
                    document.getElementById("date").innerText = `Date of Join: ${employee.employeeJoiningdate }`;
                    document.getElementById("phonenumber").innerText = employee.employeePhonenumber ;
                    document.getElementById("dateofbirth").innerText = employee.dateofbirth; // Corrected the ID here
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
        window.location.href = `profile.html?id=${employeeId}`;
       
        console.error("No employee ID provided.");
    }
});
