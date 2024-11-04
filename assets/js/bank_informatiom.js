const editedBankForm = document.querySelector('#editBankForm'); // Use querySelector to select the form by ID
// const modal = document.querySelector('#editBankInfoModal');

if (editedBankForm) {
    // Attach the event listener to the submit button using querySelector for the .btn.btn-primary class
    const submitButton = document.querySelector('.btn-primary');

    submitButton.addEventListener("click", function (e) {
        e.preventDefault(); // Prevent form submission

        // Form data
        const bankInfoData = {
            bankName: document.getElementById("modal-bankName").value,
            bankAccountNo: document.getElementById("modal-accountNumber").value,
            ifscCode: document.getElementById("modal-ifscCode").value,
            panNo: document.getElementById("modal-panNumber").value
        };
        const employeeId = localStorage.getItem('employeeId');
        console.log(employeeId);

        // API call to submit data
        fetch(`http://localhost:8081/api/bankinformation/${employeeId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bankInfoData)
        })
            .then(response => response.json())
            .then(data => {
                console.log('Bank information updated:', data);

                // Show a confirmation message
                alert("Bank information successfully saved!");

                location.reload()

                // Optionally refresh the bank information list or table on the page
                // refreshBankInfoList(); // This would be a function that refreshes the UI
            })
            .catch(error => {
                console.error('Error:', error);
                alert("An error occurred while saving bank information.");
            });
    });
}

