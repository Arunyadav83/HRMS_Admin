document.getElementById('emergency_contact').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission
  
    const personalId=localStorage.getItem('personalId');
    console.log(personalId)
    // Fetch values from the form
    const primaryName = document.getElementById('primaryName').value;
    const primaryRelationship = document.getElementById('primaryRelationship').value;
    const primaryPhone = document.getElementById('primaryPhone').value;
  
    const secondaryName = document.getElementById('secondaryName').value;
    const secondaryRelationship = document.getElementById('secondaryRelationship').value;
    const secondaryPhone = document.getElementById('secondaryPhone').value;
  
    // Prepare the data to be sent to the server
    const data = {
      primaryName: primaryName,
      primaryRelationship: primaryRelationship,
      primaryPhone: primaryPhone,
      secondaryName: secondaryName,
      secondaryRelationship: secondaryRelationship,
      secondaryPhone: secondaryPhone
    };
  
    // Send the data to the server using POST method
    fetch(`http://localhost:8081/api/emergencycontact/addcontact/${personalId}`, {
      method: 'POST', // Use POST method to send the data
      headers: {
        'Content-Type': 'application/json' // Ensure the request content type is JSON
      },
      body: JSON.stringify(data) // Convert the data to JSON format for the request body
    })
    .then(response => response.json()) // Parse the JSON response
    .then(result => {
      // Handle successful response (e.g., update the DOM with new data)
      console.log('Success:', result);
  
      // Update the DOM with new values
      document.querySelector('.text-primary-name').textContent = primaryName;
      document.querySelector('.text-primary-relationship').textContent = primaryRelationship;
      document.querySelector('.text-primary-phone').textContent = primaryPhone;
  
      document.querySelector('.text-secondary-name').textContent = secondaryName;
      document.querySelector('.text-secondary-relationship').textContent = secondaryRelationship;
      document.querySelector('.text-secondary-phone').textContent = secondaryPhone;
  
      // Close the modal
      const modal = bootstrap.Modal.getInstance(document.getElementById('emergency_contact_modal'));
      modal.hide();
    })
    .catch(error => {
      // Handle any errors that occurred during the fetch
      console.error('Error:', error);
    });
  });
  