// Fetch all holidays when the page loads
loadHolidays();

function formatDate(dateString) {
    const date = new Date(dateString);

    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    return `${padZero(day)}-${padZero(month)}-${year}`;
}

function formatDateHardcoded(inputDate) {
    const day = inputDate.slice(0, 2);
    const month = inputDate.slice(3, 5);
    const year = inputDate.slice(6);

    return `${year}-${padZero(month)}-${padZero(day)}`;
}

function padZero(number) {
    if (number < 10) {
        return `0${number}`
    }
    else {
        return number
    }
}

// Function to dynamically update the day based on selected date
function updateDay() {
    const dateInput = document.getElementById("holidayDate").value;
    const dayInput = document.getElementById("holidayDay");

    if (dateInput) {
        const date = new Date(dateInput);
        const options = { weekday: 'long' };
        const dayName = date.toLocaleDateString('en-US', options);
        dayInput.value = dayName;
    } else {
        dayInput.value = "";
    }
}

// Function to dynamically update the day based on selected date
function updateEditDay() {
    const dateInput = document.getElementById("editHolidayDate").value;
    const dayInput = document.getElementById("editHolidayDay");

    if (dateInput) {
        const date = new Date(dateInput);
        const options = { weekday: 'long' };
        const dayName = date.toLocaleDateString('en-US', options);
        dayInput.value = dayName;
    } else {
        dayInput.value = "";
    }
}

// Add event listener for form submission
document.getElementById('addHolidayButton').addEventListener("click", function (e) {
    e.preventDefault(); // Prevent default form submission

    // Create holiday object
    const holiday = {
        holidayName: document.getElementById('holidayName').value,
        holidayDate: formatDate(document.getElementById('holidayDate').value),
        day: document.getElementById('holidayDay').value
    };

    // console.log("Adding Holiday:", holiday); // Log the holiday object

    // Send POST request to add holiday
    fetch("http://localhost:8082/api/holiday", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(holiday),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok: " + response.statusText);
            }
            return response.json();
        })
        .then((data) => {
            document.getElementById('add_holiday_form').reset();
            $('#add_holiday').modal('hide'); // Hide the modal

            loadHolidays(); // Refresh the holiday list
            // alert("Holiday added successfully: ", data);
        })
        .catch((error) => {
            console.error('Error adding holiday:', error);
            alert("Error adding holiday: " + error.message);
        });
});

// Function to load holidays
function loadHolidays() {
    fetch('http://localhost:8082/api/holiday')
        .then(res => {
            if (!res.ok) {
                throw new Error('Failed to fetch holiday data');
            }
            return res.json();
        })
        .then(response => {
            const holidayTable = document.querySelector('#holiday-table tbody');
            holidayTable.innerHTML = ''; // Clear existing rows

            response.forEach((holiday, index) => {
                holidayTable.innerHTML += `
                    <tr class="holiday-upcoming" data-id="${holiday.id}">
                        <td>${index + 1}</td>
                        <td>${holiday.holidayName}</td>
                        <td>${holiday.holidayDate}</td>
                        <td>${holiday.day}</td>
                        <td class="text-end">
                            <div class="dropdown dropdown-action">
                                <a href="#" class="action-icon dropdown-toggle" data-bs-toggle="dropdown"
                                    aria-expanded="false"><i class="material-icons">more_vert</i></a>
                                <div class="dropdown-menu dropdown-menu-right">
                                    <a class="dropdown-item edit-holiday" href="#" data-bs-toggle="modal" data-bs-target="#edit_holiday">
                                        <i class="fa-solid fa-pencil m-r-5"></i> Edit
                                    </a>
                                    <a class="dropdown-item delete-holiday" href="#" data-bs-toggle="modal" data-bs-target="#delete_holiday">
                                        <i class="fa-regular fa-trash-can m-r-5"></i> Delete
                                    </a>
                                </div>
                            </div>
                        </td>
                    </tr>`;
            });

            addHolidayEventListeners(); // Add event listeners for edit and delete buttons
        })
        .catch((error) => {
            console.error('Error fetching holiday data:', error);
        });
}

// Function to add event listeners for edit and delete actions
function addHolidayEventListeners() {
    document.querySelectorAll('.edit-holiday').forEach(button => {
        button.addEventListener('click', (event) => {
            const row = event.target.closest('tr');
            const holidayId = row.dataset.id;
            const holidayName = row.cells[1].textContent;
            const holidayDate = row.cells[2].textContent;
            const holidayDay = row.cells[3].textContent;

            document.getElementById('editHolidayName').value = holidayName;
            document.getElementById('editHolidayDate').value = formatDateHardcoded(holidayDate);
            document.getElementById('editHolidayDay').value = holidayDay;
            document.getElementById('holidayId').value = holidayId;
        });
    });

    document.querySelectorAll('.delete-holiday').forEach(button => {
        button.addEventListener('click', (event) => {
            const row = event.target.closest('tr');
            document.getElementById('deleteHolidayId').value = row.dataset.id;
        });
    });
}

document.getElementById('edit_holiday_form').addEventListener('submit', function (e) {
    e.preventDefault();

    const holidayId = document.getElementById('holidayId').value;

    if (!holidayId) {
        alert('Holiday ID is required for updating.');
        return;
    }

    const holidayDate = new Date(document.getElementById('editHolidayDate').value);

    const updatedHoliday = {
        holidayName: document.getElementById('editHolidayName').value,
        holidayDate: formatDate(holidayDate),
        day: document.getElementById('editHolidayDay').value,
    };

    // console.log('Sending update request with data:', updatedHoliday);  // Log the data being sent

    fetch(`http://localhost:8082/api/holiday/${holidayId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedHoliday),
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.message || 'Failed to update holiday');
                });
            }
            return response.json();
        })
        .then(data => {
            loadHolidays();  // Refresh the holidays list
            $('#edit_holiday').modal('hide'); // Hide the modal
            document.getElementById('edit_holiday_form').reset();

            // alert('Holiday updated successfully');
            // console.log('Update response:', data);  // Log the response from the server
        })
        .catch(error => {
            console.error('Error updating holiday:', error);
            alert('Error updating holiday: ' + error.message);
        });
});

// Delete holiday
document.getElementById('deleteHoliday').addEventListener('click', function (e) {
    e.preventDefault();
    const holidayId = document.getElementById('deleteHolidayId').value;

    if (!holidayId) {
        alert('No holiday ID found. Please try again.');
        return;
    }

    fetch(`http://localhost:8082/api/holiday/${holidayId}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.message || 'Failed to delete holiday');
                });
            }
            // Check if the response is plain text
            return response.text();
        })
        .then(data => {
            $('#delete_holiday').modal('hide'); // Hide the modal 
            loadHolidays(); // Refresh the holiday list after deletion

            // console.log("Delete Response:", data);
            // alert(data || 'Holiday deleted successfully'); // Show response message
        })
        .catch(error => {
            console.error('Error deleting holiday:', error);
            alert('Error deleting holiday: ' + error.message);
        });
});

document.getElementById('cancelDelete').addEventListener('click', () => {
    $('#delete_holiday').modal('hide'); // Hide the modal
})