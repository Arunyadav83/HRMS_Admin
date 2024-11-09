 // Function to add the new department to the department list in the UI
 function addDepartmentToList(department) {
    const departmentList = document.getElementById('departmentList');

    // Create a new row for the added department
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${departmentList.children.length + 1}</td>
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

    // Append the new row to the department list
    departmentList.appendChild(row);
}

// Event listener for adding a new department
document.querySelector("#add_department_form").addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent the default form submission

    // Get the department name from the form field
    const departmentName = document.getElementById("departmentName").value.trim();

    // Validate the department name
    if (!departmentName) {
        alert("Department name cannot be empty.");
        return;
    }

    // Create the department object
    const department = {
        departmentName: departmentName,
    };

    // Fetch request to add the department
    fetch(`http://localhost:8082/api/department/add`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(department)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Network response was not ok: " + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        console.log("Department Added:", data);
        alert("Department added successfully!");

        // Hide the modal after successful submission
        $('#add_department').modal('hide'); // Correct the modal ID here

        // Reset the form fields
        document.getElementById('add_department_form').reset(); // Ensure you're targeting the form element correctly

        // Directly update the UI to show the newly added department
        addDepartmentToList(data); // Pass the newly added department data
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
        alert('Error adding department: ' + error.message); // Show user-friendly error
    });
});

document.addEventListener('DOMContentLoaded', () => {
    // All your JavaScript code here...
});



// Function to update the department list in the UI
function updateDepartmentList(department) {
    // Assuming you have a <ul> or <table> to display the departments
    const departmentList = document.getElementById('departmentList'); // Adjust the ID to your department list element

    // Create a new list item or table row based on your structure
    const newDepartmentItem = document.createElement('li'); // Change 'li' to 'tr' if using a table
    newDepartmentItem.textContent = department.departmentName; // Adjust according to your department object structure

    // Append the new department to the list
    departmentList.appendChild(newDepartmentItem);
}

// Function to open the delete modal and set the department ID
function openDeleteModal(departmentId) {
    localStorage.setItem('departmentId', departmentId);
    const deleteModal = new bootstrap.Modal(document.getElementById("delete_department"));
    deleteModal.show();
}

// Event listener for the delete button in the modal
document.getElementById("confirmDeleteDepartment").addEventListener("click", function () {
    const departmentId = localStorage.getItem('departmentId');

    if (!departmentId) {
        console.error("No department ID provided");
        alert("No department ID provided for deletion.");
        return;
    }

    const deleteButton = document.getElementById("confirmDeleteDepartment");
    deleteButton.disabled = true;

    fetch(`http://localhost:8082/api/department/${departmentId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to delete department");
        }
        alert("Department deleted successfully");
        const deleteModal = bootstrap.Modal.getInstance(document.getElementById("delete_department"));
        deleteModal.hide();
        loadDepartments(); // Call to refresh the department list after deletion
    })
    .catch(error => {
        console.error('Error:', error);
        alert("Error deleting department: " + error.message);
    })
    .finally(() => {
        deleteButton.disabled = false;
    });
});
