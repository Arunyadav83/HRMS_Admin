// Function to fetch and populate the department dropdown
function populateDepartments() {
    fetch('http://localhost:8081/api/department') // Ensure this endpoint is correct
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(departments => {
            const departmentSelect = document.getElementById('departmentName');
            departmentSelect.innerHTML = '<option value="0">Select Department</option>'; // Clear existing options

            departments.forEach(department => {
                const option = document.createElement('option');
                option.value = department.departmentId; // Use the department ID
                option.textContent = department.departmentName; // Display the department name
                departmentSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error fetching departments:', error);
        });
}

// Call populateDepartments on page load or when needed
document.addEventListener('DOMContentLoaded', populateDepartments);

// Event listener for when the modal is shown
document.getElementById('add_designation').addEventListener('show.bs.modal', function () {
    populateDepartments(); // Populate the departments when the modal opens
});

// Event listener for adding a new designation
document.getElementById("addDesignation").addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent the default form submission

    // Get the selected department ID from the dropdown
    const departmentId = document.getElementById("departmentName").value;

    const designationData = {
        designationName: document.getElementById("designationName").value,
        departmentId: departmentId // Include the selected department ID
    };

    console.log("Designation Data: ", designationData); // Log the data for debugging

    fetch(`http://localhost:8081/api/designation/addDepartment/${departmentId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(designationData), // Send the designation data
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        return response.json();
    })
    .then(data => {
        console.log("Data Added: ", data);
        alert("Designation added successfully");
        document.getElementById('addDesignation').reset(); // Reset the form

        // Optionally close the modal
        $('#add_designation').modal('hide');

        // Refresh the designations list
        fetchAndStoreDesignations(); // Fetch designations again to update the list
    })
    .catch((error) => {
        console.error('Error:', error);
        alert("Error adding designation: " + error.message); // Show error message
    });
});

// Function to fetch and store designations in localStorage
function fetchAndStoreDesignations() {
    fetch('http://localhost:8081/api/designation')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(designations => {
            // Store the entire array of designations in localStorage
            localStorage.setItem('designations', JSON.stringify(designations));
            console.log('Designations stored in localStorage:', designations);

            // Display the designations on the page
            displayDesignations(designations);
        })
        .catch(error => {
            console.error('Error fetching designations:', error);
        });
}

// Function to display designations and add click event for each to set ID in localStorage
function displayDesignations(designations) {
    const designationList = document.getElementById('designationList');
    designationList.innerHTML = ''; // Clear existing designations

    console.log('Fetched designations:', designations); // Log the fetched designations

    designations.forEach(designation => {
        const listItem = document.createElement('li');
        listItem.textContent = designation.designationName; // Use the correct variable here

        // When clicking a designation, store its ID in localStorage
        listItem.addEventListener('click', () => {
            console.log(`Clicked on designation: ${designation.designationName}, ID: ${designation.id}`); // Log clicked designation
            localStorage.setItem('designationId', designation.id); // Store the selected ID as 'actualDesignationId'
            console.log(`Designation ID ${designation.id} stored as 'actualDesignationId' in localStorage`);
            $('#delete_designation').modal('show'); // Open the delete confirmation modal
        });

        designationList.appendChild(listItem);
    });
}

// Function to delete the selected designation using 'actualDesignationId'
function deleteDesignation() {
    const actualDesignationId = localStorage.getItem('actualDesignationId'); // Retrieve 'actualDesignationId' from localStorage
    console.log(`Attempting to delete designation ID: ${actualDesignationId}`); // Log ID for deletion

    if (actualDesignationId) {
        fetch(`http://localhost:8081/api/designation/${actualDesignationId}`, {
            method: 'DELETE',
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            console.log('Designation deleted successfully');

            // Remove 'actualDesignationId' from localStorage
            localStorage.removeItem('actualDesignationId');
            console.log(`Designation ID ${actualDesignationId} removed from localStorage`); // Log removal

            // Show a confirmation message
            alert(`Designation with ID ${actualDesignationId} deleted successfully.`);

            // Close the delete modal
            $('#delete_designation').modal('hide');

            // Refresh the designation list after deletion
            fetchAndStoreDesignations();
        })
        .catch(error => {
            console.error('Error:', error);
            alert("Error deleting designation: " + error.message); // Show error message
        });
    } else {
        alert("No designation selected for deletion."); // Handle case where no ID is found
    }
}

// Ensure the confirmDelete button event listener is attached only after the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const confirmDeleteButton = document.getElementById('confirmDelete');
    if (confirmDeleteButton) {
        confirmDeleteButton.addEventListener('click', deleteDesignation);
    }
});
