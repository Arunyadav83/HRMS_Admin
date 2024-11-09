function fetchLeaveApplications() {
    const employeeId=localStorage.getItem('employeeId');
    fetch(`http://localhost:8081/api/leaves/employee/${employeeId}`)
    .then(response => response.json())
    .then(data => {
        // Assuming 'data' is a list of leave applications
        displayLeaveApplications(data);
    })  
    .catch(error => {
        console.error("Error fetching leave applications:", error);
    });
}
 
// Dynamically display leave applications in the admin dashboard
// function displayLeaveApplications(leaves) {
//     const leaveTableBody = document.getElementById('leaveTableBody');
//     leaveTableBody.innerHTML = ''; // Clear previous entries
 
//     // leaves.forEach(leave => {
//     //     const row = `
//     //         <tr>
//     //             <td>${leave.employeeName}</td>
//     //             <td>${leave.leaveType}</td>
//     //             <td>${leave.fromDate} - ${leave.toDate}</td>
//     //             <td>${leave.leaveReason}</td>
//     //             <td>
//     //                 <button class="btn btn-success" onclick="approveLeave(${leave.id})">Approve</button>
//     //                 <button class="btn btn-danger" onclick="declineLeave(${leave.id})">Decline</button>
//     //             </td>
//     //         </tr>
//     //     `;
//     //     leaveTableBody.innerHTML += row;
//     // });
// }
 
// Call fetchLeaveApplications on page load
window.onload = fetchLeaveApplications;
 
document.querySelector('.continue-btn').addEventListener('click', function() {
    // Assuming `leaveId` and `adminId` are available in the scope
    const id = localStorage.getItem('id'); // Replace with the actual leave ID
    const adminId = localStorage.getItem('adminId'); // Replace with the actual admin ID
 
    fetch(`http://localhost:8081/api/leaves/${id}/approve/${adminId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error("Failed to approve the leave.");
        }
    })
    .then(data => {
        console.log("Leave approved successfully:", data);
        alert("Leave approved successfully!");
 
        // Optional: Update the UI, refresh leave status on the dashboard, or close modal
        $('#approve_leave').modal('hide'); // Hide the modal
        // You can add more logic here to update the leave status on the dashboard
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Failed to approve the leave. Please try again.");
    });
});