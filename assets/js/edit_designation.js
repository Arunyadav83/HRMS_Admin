// document.addEventListener("DOMContentLoaded", function () {
//     fetchDesignations();
// });

// function fetchDesignations() {
//     fetch("http://localhost:8081/api/designation", {
//         method: "GET",
//         headers: {
//             "Content-Type": "application/json",
//         },
//     })
//     .then((response) => {
//         if (response.ok) {
//             return response.json();
//         } else {
//             throw new Error("Failed to fetch designations");
//         }
//     })
//     .then((designations) => {
//         displayDesignations(designations);
//     })
//     .catch((error) => {
//         alert("Error: " + error.message);
//         console.error("Error fetching designations: ", error);
//     });
// }

// function displayDesignations(designations) {
//     const tbody = document.querySelector('.datatable tbody');
//     tbody.innerHTML = '';

//     designations.forEach((designation, index) => {
//         const row = document.createElement('tr');

//         row.innerHTML = `
//             <td>${index + 1}</td>
//             <td>${designation.designationName}</td>
//             <td>${designation.department ? designation.department.departmentName : "No Department Assigned"}</td>
//             <td class="text-end">
//                 <div class="dropdown dropdown-action">
//                     <a href="#" class="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"><i class="material-icons">more_vert</i></a>
//                     <div class="dropdown-menu dropdown-menu-right">
//                         <a class="dropdown-item" href="#" onclick="openEditModal(${designation.id})"><i class="fa-solid fa-pencil m-r-5"></i> Edit</a>
//                         <a class="dropdown-item" href="#" onclick="deleteDesignation(${designation.id})"><i class="fa-regular fa-trash-can m-r-5"></i> Delete</a>
//                     </div>
//                 </div>
//             </td>
//         `;
//         tbody.appendChild(row);
//     });
// }

function openEditModal(designationId) {
    // Fetch the designation by ID to populate modal fields
    fetch(`http://localhost:8081/api/designation/${designationId}`)
        .then((response) => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error("Failed to fetch designation details");
            }
        })
        .then((designation) => {
            // Populate the modal with designation details
            document.getElementById("editDesignationId").value = designation.id;
            document.getElementById("editDesignationName").value = designation.designationName;
            document.getElementById("editDepartmentName").value = designation.department ? designation.department.departmentName : "";
            // Show the modal
            new bootstrap.Modal(document.getElementById("edit_designation")).show();
        })
        .catch((error) => {
            alert("Error: " + error.message);
            console.error("Error fetching designation details: ", error);
        });
}

function saveDesignation() {
    const designationId = document.getElementById("editDesignationId").value;
    const designationName = document.getElementById("editDesignationName").value;
    const departmentName = document.getElementById("editDepartmentName").value;
    console.log(designationId)
    const data = {
        designationName: designationName,
        department: { departmentName: departmentName }
    };

    fetch(`http://localhost:8081/api/designation/${designationId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })
    .then((response) => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error("Failed to update designation");
        }
    })
    .then((updatedDesignation) => {
        // Close the modal and refresh the table
        alert("Designation updated successfully");
        fetchDesignations();
        bootstrap.Modal.getInstance(document.getElementById("edit_designation")).hide();
    })
    .catch((error) => {
        alert("Error: " + error.message);
        console.error("Error updating designation: ", error);
    });
}

// function deleteDesignation(designationId) {
//     // Confirm delete action
//     if (!confirm("Are you sure you want to delete this designation?")) return;

//     // Make DELETE request
//     fetch(`http://localhost:8081/api/designation/${designationId}`, {
//         method: "DELETE",
//         headers: {
//             "Content-Type": "application/json",
//         },
//     })
//     .then((response) => {
//         if (response.ok) {
//             alert("Designation deleted successfully");
//             fetchDesignations(); // Refresh the list of designations
//         } else {
//             throw new Error(`Failed to delete designation. Status: ${response.status}`);
//         }
//     })
//     .catch((error) => {
//         alert("Error deleting designation: " + error.message);
//         console.error("Error deleting designation: ", error);

//         // Additional logging for diagnostics
//         console.log("Error details:", {
//             designationId: designationId,
//             apiEndpoint: `http://localhost:8081/api/designation/${designationId}`,
//             headers: {
//                 "Content-Type": "application/json",
//             },
//         });
//     });
// }


