document.addEventListener("DOMContentLoaded", function () {
    const id = localStorage.getItem('id'); // Assuming you get the employeeId from localStorage

    // Function to fetch existing emergency contact data
    async function fetchEmergencyContact() {
        try {
            const response = await fetch(`http://localhost:8081/api/emergencycontact/${id}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            // Populate the form fields with fetched data
            document.getElementById('primaryName').value = data.primaryName;
            document.getElementById('primaryRelationship').value = data.primaryRelationship;
            document.getElementById('primaryPhone').value = data.primaryPhone;
            document.getElementById('secondaryName').value = data.secondaryName;
            document.getElementById('secondaryRelationship').value = data.secondaryRelationship;
            document.getElementById('secondaryPhone').value = data.secondaryPhone;
        } catch (error) {
            alert('Error fetching emergency contact data: ' + error.message);
        }
    }

    // Call fetchEmergencyContact when modal opens
    const modalElement = document.getElementById('emergency_contact_modal');
    modalElement.addEventListener('show.bs.modal', function () {
        fetchEmergencyContact(); // Fetch the data when the modal is shown
    });

    // Handle form submission for updating emergency contact
    const emergencyContactForm = document.getElementById('emergency_contact');
    emergencyContactForm.addEventListener('submit', async function (event) {
        event.preventDefault(); // Prevent default form submission

        const emergencyData = {
            primaryName: document.getElementById('primaryName').value,
            primaryRelationship: document.getElementById('primaryRelationship').value,
            primaryPhone: document.getElementById('primaryPhone').value,
            secondaryName: document.getElementById('secondaryName').value,
            secondaryRelationship: document.getElementById('secondaryRelationship').value,
            secondaryPhone: document.getElementById('secondaryPhone').value
        };

        // Use PUT method to update emergency contact data
        try {
            const response = await fetch(`http://localhost:8081/api/emergencycontact/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(emergencyData), // Send the updated data
            });

            if (!response.ok) {
                throw new Error('Failed to update emergency contact');
            }
            const updatedData = await response.json();
            alert('Emergency contact updated successfully!'); // Notify the user
            // Optionally, update the displayed data on the page
            updateDisplayedData(updatedData);
        } catch (error) {
            alert('Error updating emergency contact data: ' + error.message);
        }
    });

    // Function to update displayed data (optional)
    function updateDisplayedData(data) {
        document.querySelector('.text-primary-name').textContent = data.primaryName;
        document.querySelector('.text-primary-relationship').textContent = data.primaryRelationship;
        document.querySelector('.text-primary-phone').textContent = data.primaryPhone;
        document.querySelector('.text-secondary-name').textContent = data.secondaryName;
        document.querySelector('.text-secondary-relationship').textContent = data.secondaryRelationship;
        document.querySelector('.text-secondary-phone').textContent = data.secondaryPhone;
    }
});
