function fetchFamilyInformation() {
    const id = localStorage.getItem('id'); 
    // Assuming employeeId is stored in localStorage
    console.log(id);
    
    fetch(`http://localhost:8081/api/familyinformation/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(data => {
        const tableBody = document.getElementById('familyInfoTableBody');
        tableBody.innerHTML = '';  // Clear existing rows

        data.forEach(familyMember => {
            const newRow = tableBody.insertRow();

            const nameCell = newRow.insertCell(0);
            const relationshipCell = newRow.insertCell(1);
            const dobCell = newRow.insertCell(2);
            const phoneCell = newRow.insertCell(3);
            const actionCell = newRow.insertCell(4);

            nameCell.textContent = familyMember.name;
            relationshipCell.textContent = familyMember.relationship;
            dobCell.textContent = new Date(familyMember.dateofbirth).toLocaleDateString();
            phoneCell.textContent = familyMember.phone;

            // Action dropdown for Edit and Delete
            actionCell.className = 'text-end';
            const dropdown = document.createElement('div');
            dropdown.className = 'dropdown dropdown-action';
            dropdown.innerHTML = `
                <a aria-expanded="false" data-bs-toggle="dropdown" class="action-icon dropdown-toggle" href="#">
                    <i class="material-icons">more_vert</i>
                </a>
                <div class="dropdown-menu dropdown-menu-right">
                    <a href="#" class="dropdown-item edit-btn" data-id="${familyMember.id}">
                        <i class="fa-solid fa-pencil m-r-5"></i> Edit
                    </a>
                    <a href="#" class="dropdown-item delete-btn" data-id="${familyMember.id}">
                        <i class="fa-regular fa-trash-can m-r-5"></i> Delete
                    </a>
                </div>
            `;
            actionCell.appendChild(dropdown);
        });

        // Attach event listeners for edit and delete actions
        addFamilyInfoActions();
    })
    .catch(error => console.error('Error:', error));
}
function addFamilyInfoActions() {
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            const familyMemberId = this.getAttribute('data-id');
            console.log(`Edit family member with ID: ${familyMemberId}`);
            // Populate the modal with family member's details for editing
            window.location.href = `profile.html?id=${family.id}`;
            openEditModal(familyMemberId);
        });
    });

    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            const familyMemberId = this.getAttribute('data-id');
            console.log(`Delete family member with ID: ${familyMemberId}`);
            // Add logic to delete the family member from the backend
            deleteFamilyMember(familyMemberId);
        });
    });
}
