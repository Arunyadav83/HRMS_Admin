// Function to load departments from the API
function loadDepartments() {
    fetch('http://localhost:8081/api/department')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error fetching departments: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(departments => {
            console.log("Fetched departments:", departments); // Log fetched departments

            const departmentList = document.getElementById('departmentList');
            departmentList.innerHTML = ''; // Clear existing entries

            // Check if departments are returned
            if (departments.length === 0) {
                const noDataRow = document.createElement('tr');
                noDataRow.innerHTML = `<td colspan="3" class="text-center">No departments found</td>`;
                departmentList.appendChild(noDataRow);
                return;
            }

            // Iterate over each department and create table rows
            departments.forEach((department, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${department.departmentName}</td>
                    <td class="text-end">
                        <div class="dropdown dropdown-action">
                            <a href="#" class="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                                <i class="material-icons">more_vert</i>
                            </a>
                            <div class="dropdown-menu dropdown-menu-right">
                                <a class="dropdown-item" href="#" onclick="openEditModal(${department.departmentId})">
                                    <i class="fa-solid fa-pencil m-r-5"></i> Edit
                                </a>
                                <a class="dropdown-item" href="#" onclick="openDeleteModal(${department.departmentId})">
                                    <i class="fa-regular fa-trash-can m-r-5"></i> Delete
                                </a>
                            </div>
                        </div>
                    </td>
                `;
                departmentList.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error fetching departments:', error);
            alert("Error loading departments: " + error.message);
        });
}

// Call loadDepartments to populate the list on page load
document.addEventListener('DOMContentLoaded', loadDepartments);

// Open the edit modal and populate current department details
function openEditModal(departmentId) {
    fetch(`http://localhost:8081/api/department/${departmentId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error fetching department details: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(department => {
            document.getElementById("editDepartmentName").value = department.departmentName;
            document.getElementById("editDepartmentId").value = department.departmentId;

            localStorage.setItem('departmentId', departmentId);

            const editModal = new bootstrap.Modal(document.getElementById("edit_department"));
            editModal.show();
        })
        .catch(error => {
            console.error('Error fetching department details:', error);
            alert("Error loading department details: " + error.message);
        });
}

// Event listener for the edit department form submission
document.getElementById("editDepartmentForm").addEventListener('submit', function (e) {
    e.preventDefault();

    const departmentId = localStorage.getItem('departmentId');
    const departmentName = document.getElementById("editDepartmentName").value;

    const updatedDepartment = {
        departmentName: departmentName
    };

    fetch(`http://localhost:8081/api/department/update/${departmentId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedDepartment)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to update department: ${response.status} ${response.statusText}`);
        }
        alert("Department updated successfully!");

        const editModal = bootstrap.Modal.getInstance(document.getElementById("edit_department"));
        editModal.hide();

        loadDepartments();
    })
    .catch(error => {
        console.error('Error updating department:', error);
        alert("Error updating department: " + error.message);
    });
});
