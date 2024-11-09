const LEAVES_API_URL = "http://localhost:8082/api/leaves"; // Replace with your actual API URL

async function applyLeave() {
    const leaveType = document.getElementById("leaveType").value;
    const startDate = document.getElementById("startDate").value;
    const session1 = document.getElementById("session1").value;
    const endDate = document.getElementById("endDate").value;
    const session2 = document.getElementById("session2").value;
    const noofdays = document.getElementById("noOfDays").value;
    const remainingLeaves = document.getElementById("remainingLeaves").value;
    const leaveReason = document.getElementById("leaveReason").value;

    // Validate the form data (you can add more validations as needed)
    if (leaveType === "Select Leave Type" || !startDate || !endDate || !leaveReason) {
        alert("Please fill in all required fields.");
        return;
    }

    // Fetch the employee ID and authorization token
    const employeeId = getCurrentEmployeeId();
    const authToken = getAuthToken();

    if (!employeeId || !authToken) {
        alert("User authentication failed. Please log in.");
        return;
    }

    // Create the leave application object
    const leaveData = {
        leaveType: leaveType,
        startDate: startDate,
        session1: session1,
        endDate: endDate,
        session2: session2,
        noofdays: parseInt(noofdays),
        remainingLeaves: parseInt(remainingLeaves),
        reason: leaveReason,
        status: "PENDING",
        employeeId: employeeId,
        appliedDate: new Date().toISOString() // ISO string format for dates
    };

    try {
        // Send POST request to the API
        const response = await fetch(`${LEAVES_API_URL}/apply`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify(leaveData)
        });

        if (response.ok) {
            // Send notification to admin
            await notifyAdmin(leaveData);
            alert("Leave application submitted successfully! Waiting for admin approval.");
            document.getElementById("applyLeaveForm").reset();
        } else {
            console.error("Failed to apply leave:", response.statusText);
            alert("Error applying leave. Please try again.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred. Please try again.");
    }
}

// Helper function to notify admin
async function notifyAdmin(leaveData) {
    const authToken = getAuthToken();

    try {
        const response = await fetch(`${LEAVES_API_URL}/notify-admin`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify(leaveData)
        });

        if (!response.ok) {
            console.error("Failed to notify admin:", response.statusText);
        }
    } catch (error) {
        console.error("Error notifying admin:", error);
    }
}

// Helper function to get current employee ID (implement based on your auth system)
function getCurrentEmployeeId() {
    // Return the logged-in employee's ID from local storage or any other storage
    return localStorage.getItem("employeeId") || "";
}

// Helper function to get auth token (implement based on your auth system)
function getAuthToken() {
    // Return the authentication token from local storage or any other storage
    return localStorage.getItem("authToken") || "";
}
