document.addEventListener("DOMContentLoaded", function () {
    // Fetch all employees when the page loads
    fetchListOfDepartments();
});

function fetchListOfDepartments() {
    fetch("http://localhost:8082/api/department", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((response) => {
            if (response.ok) {
                return response.json(); // Parse the JSON response
            } else {
                throw new Error("Failed to fetch departments");
            }
        })
        .then((departments) => {
            displayDepartments(departments)
        })
        .catch((error) => {
            alert("Error: " + error.message);
            console.error("Error fetching employees: ", error);
        });
}

function displayDepartments(departments) {
    const tbody = document.querySelector('.datatable tbody');
    tbody.innerHTML = ''; // Clear existing rows

    departments.forEach((dep, index) => {
        const row = document.createElement('tr');
         
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${dep.departmentName}</td>
            <td class="text-end">
                <div class="dropdown dropdown-action">
                    <a href="#" class="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="material-icons">more_vert</i>
                    </a>
                    <div class="dropdown-menu dropdown-menu-right">
                        <a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#edit_department">
                            <i class="fa-solid fa-pencil m-r-5"></i> Edit
                        </a>
                        <a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#delete_department">
                            <i class="fa-regular fa-trash-can m-r-5"></i> Delete
                        </a>
                    </div>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}
