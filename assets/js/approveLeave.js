const LEAVES_API_URL = "http://localhost:8082/api/leaves"; // Base URL for leave API

// Function to fetch all leave applications for the admin dashboard
async function fetchAllLeaveApplications() {
    try {
        const response = await fetch(LEAVES_API_URL);
        if (!response.ok) throw new Error("Failed to fetch leave applications.");

        const leaveApplications = await response.json();
        displayLeaveApplications(leaveApplications); // Display all leave applications
    } catch (error) {
        console.error("Error fetching all leave applications:", error);
    }
}

// Function to fetch leave applications for a specific employee based on employeeId
async function fetchEmployeeLeaveApplications() {
    const employeeId = localStorage.getItem("employeeId");
    if (!employeeId) {
        console.error("Employee ID not found in local storage.");
        return;
    }

    try {
        const response = await fetch(`${LEAVES_API_URL}/employee/${employeeId}`);
        if (!response.ok) throw new Error("Failed to fetch employee leave applications.");

        const employeeLeaves = await response.json();
        displayLeaveApplications(employeeLeaves); // Display specific employee leave applications
    } catch (error) {
        console.error("Error fetching employee leave applications:", error);
    }
}

// Dynamically display leave applications in the admin dashboard
function displayLeaveApplications(leaves) {
    const leaveTableBody = document.getElementById("leaves-table-body");
    leaveTableBody.innerHTML = ""; // Clear previous entries

    leaves.forEach(leave => {
        const row = `
            <tr>
                <td>${leave.employeefirstName} ${leave.employeelastName}</td>
                <td>${leave.leaveType}</td>
                <td>${leave.startDate} - ${leave.endDate}</td>
                <td>${leave.reason}</td>
                <td>
                    <button class="btn btn-success" onclick="approveLeave(${leave.id})">Approve</button>
                    <button class="btn btn-danger" onclick="declineLeave(${leave.id})">Decline</button>
                </td>
            </tr>
        `;
        leaveTableBody.innerHTML += row;
    });
}

// Function to approve a leave application
async function approveLeave(leaveId) {
    const adminId = localStorage.getItem("adminId"); // Replace with the actual admin ID
    if (!adminId) {
        alert("Admin ID is missing. Please log in as an admin.");
        return;
    }

    try {
        const response = await fetch(`${LEAVES_API_URL}/${leaveId}/approve/${adminId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log("Leave approved successfully:", data);
            alert("Leave approved successfully!");

            // Update the UI or refresh the list
            fetchAllLeaveApplications(); // Refresh the leave applications list
        } else {
            throw new Error("Failed to approve the leave.");
        }
    } catch (error) {
        console.error("Error approving leave:", error);
        alert("Failed to approve the leave. Please try again.");
    }
}

// Function to decline a leave application
async function declineLeave(leaveId) {
    const adminId = localStorage.getItem("adminId"); // Replace with the actual admin ID
    if (!adminId) {
        alert("Admin ID is missing. Please log in as an admin.");
        return;
    }

    try {
        const response = await fetch(`${LEAVES_API_URL}/${leaveId}/decline/${adminId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log("Leave declined successfully:", data);
            alert("Leave declined successfully!");

            // Update the UI or refresh the list
            fetchAllLeaveApplications(); // Refresh the leave applications list
        } else {
            throw new Error("Failed to decline the leave.");
        }
    } catch (error) {
        console.error("Error declining leave:", error);
        alert("Failed to decline the leave. Please try again.");
    }
}

// Call fetchAllLeaveApplications on page load for the admin dashboard
window.onload = fetchAllLeaveApplications;
