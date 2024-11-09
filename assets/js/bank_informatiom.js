document.addEventListener("DOMContentLoaded", function () {
    // Attach the event listener to the edited bank form after DOM is fully loaded
    const editedBankForm = document.querySelector('#editBankForm'); // Use querySelector to select the form by ID

    if (editedBankForm) {
        // Attach the event listener to the submit button using querySelector for the .btn.btn-primary class
        const submitButton = document.querySelector('.btn-primary'); 

        submitButton.addEventListener("click", function (e) {
            e.preventDefault(); // Prevent default button click behavior

            // Gather bank information data from the form inputs
            const bankInfoData = {
                bankName: document.getElementById("bankName").value, // Use querySelector for form elements
                bankAccountNo: document.getElementById("accountNumber").value,
                ifscCode: document.getElementById("ifscCode").value,
                panNo: document.getElementById("panNumber").value
            };
            console.log(bankInfoData); // Log bank info data to console

            const employeeId = localStorage.getItem('employeeId');
            if (!employeeId) {
                console.error('Employee ID not found in localStorage');
                return;
            }

            console.log(employeeId); // Log employee ID to console

            // API call to save bank information
            fetch(`http://localhost:8081/api/bankinformation/${employeeId}`, {
                method: 'POST', // Use POST or PUT as needed
                headers: {
                    'Content-Type': 'application/json',
                     'Access-Control-Allow-Origin': 'http://127.0.0.1:5500'
                },
                body: JSON.stringify(bankInfoData)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Bank information updated:', data);

                // Close the modal (if applicable)
                const modal = bootstrap.Modal.getInstance(document.querySelector('#editBankInfoModal'));
                modal.hide();
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
        });
    } else {
        console.error("Edited bank form not found in the DOM.");
    }
});
