document.getElementById("addProject").addEventListener('submit', function (e) {
    e.preventDefault();
    function formatDate(dateString) {
        // Split the date string into components
        const parts = dateString.split("-");
        // Create a new date string in the "yyyy-MM-dd'T'HH:mm:ss" format (with time set to 00:00:00)
        return `${parts[2]}-${parts[1]}-${parts[0]}T00:00:00`; // year-month-dayT00:00:00
    }

    const employeeId = localStorage.getItem('employeeId');
    if (!employeeId) {
        console.error("No employee ID found in localStorage.");
        return;
    }
    console.log(employeeId);
    const adminId = localStorage.getItem('adminId');
    if (!adminId) {
        console.error("No admin ID found in localStorage.");
        return;
    }
    console.log(adminId)
    const projectData = {
        projectName: document.getElementById("projectName").value,
        projectDescription: document.getElementById("editor").value,
        addProjectLeader: document.getElementById("projectlead").value,
        priority: document.getElementById("priority").value,
        paymentInfo: document.getElementById("paymentforproject").value,
        clientName: document.getElementById("client").value,
        assignee: document.getElementById("team-members").value,
        createDate: formatDate(document.getElementById("startDate").value),
        deadline: formatDate(document.getElementById("endDate").value)
    }

    console.log(projectData.projectDescription);

    fetch(`http://localhost:8081/api/project/addproject/${employeeId}/${adminId}`, {  // Replace with your actual endpoint
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),

    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);
            alert("Project  added  successfully!");

            // Clear the form fields
            document.getElementById('addProject').reset();
            // window.location.href= `profile.html?id=${adminId}`;
            // Close the modal after submission
            const modalElement = bootstrap.Modal.getInstance(document.getElementById('create_project_offcanvas'));
            modalElement.hide();
        })
})