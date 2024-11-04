document.addEventListener("DOMContentLoaded", function () {
    // Fetch all designations when the page loads
    fetchDesignations();
});

function fetchDesignations() {
    fetch("http://localhost:8081/api/designation", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((response) => {
            if (response.ok) {
                return response.json(); // Parse the JSON response
            } else {
                throw new Error("Failed to fetch designations");
            }
        })
        .then((designations) => {
          //  console.log(designations);
            displayDepartments(designations);
        })
        .catch((error) => {
            alert("Error: " + error.message);
            console.error("Error fetching designations: ", error);
        });
}
function displayDepartments(designations) {
    const tbody = document.querySelector('.datatable tbody');
    tbody.innerHTML = ''; // Clear existing rows

    designations.forEach((designation, index) => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${designation.designationName}</td>
            <td>${designation.department ? designation.department.departmentName : 'No Department Assigned'}</td> <!-- Check if department exists -->
            <td class="text-end">
                <div class="dropdown dropdown-action">
                    <a href="#" class="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"><i class="material-icons">more_vert</i></a>
                    <div class="dropdown-menu dropdown-menu-right">
                        <a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#edit_designation"><i class="fa-solid fa-pencil m-r-5"></i> Edit</a>
                        <a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#delete_designation"><i class="fa-regular fa-trash-can m-r-5"></i> Delete</a>
                    </div>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}


