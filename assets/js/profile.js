window.addEventListener("load", function () {
    // Get the employee ID from the URL
    window.onload = function() {
        const urlParams = new URLSearchParams(window.location.search);
        const employeeId = urlParams.get("employeeId");
        const personalId = urlParams.get("id");
      
        if (employeeId && personalId) {
          sessionStorage.setItem("employeeId", employeeId);
          sessionStorage.setItem("personalId", personalId);
        }
      };

    if (employeeId) {
        // Replace this with your actual backend API endpoint
        const apiUrl = `http://localhost:8081/api/employee/${employeeId}`;

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
                    document.getElementById("firstname").innerText = employee.employeefirstName || 'John Doe';
                    document.getElementById("lastname").innerText = employee.employeeLastName || ''; // Ensure you have this in your HTML
                    document.getElementById("email").innerText = employee.employeeEmail || '';
                    document.getElementById("designation").innerText = employee.employeeDesignation || 'Web Designer';
                    document.getElementById("empid").innerText = employee.employeeId;
                    document.getElementById("date").innerText = `Date of Join: ${employee.employeeJoiningdate || '1st Jan 2013'}`;
                    document.getElementById("phonenumber").innerText = employee.employeePhonenumber || '9876543210';
                    document.getElementById("dateofbirth").innerText = employee.birthday || '24th July'; // Corrected the ID here
                    document.getElementById("address").innerText = employee.address || '1861 Bayonne Ave, Manchester Township, NJ, 08759';
                    document.getElementById("gender").innerText = employee.gender || 'Male';

                    // Optionally remove any sections not needed
                    // document.getElementById("department").style.display = 'none';
                } else {
                    console.error("Employee not found.");
                }
            })
            .catch(error => {
                console.error("Error fetching employee data:", error);
            });
    } else {
        console.error("No employee ID provided.");
    }
});
