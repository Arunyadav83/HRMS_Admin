document.getElementById("personal-submit-button").addEventListener("click", handlePersonalInfoSubmit);

function handlePersonalInfoSubmit(event) {
  event.preventDefault();

  // Get the stored employeeId and personalId from sessionStorage
  const employeeId = sessionStorage.getItem("employeeId");
  const personalId = sessionStorage.getItem("personalId");

  if (!employeeId || !personalId) {
    alert("Employee or Personal ID not found in session.");
    return;
  }

  const personalInfo = {
    passportNo: document.getElementById("passportNo").value,
    passportExpirydate: document.getElementById("passportExpirydate").value,
    telephone: document.getElementById("telephone").value,
    nationality: document.getElementById("nationality").value,
    religion: document.getElementById("religion").value,
    maritalStatus: document.getElementById("maritalStatus").value,
    employmentOfSpouse: document.getElementById("employmentOfSpouse").value,
    noOfChildren: document.getElementById("noOfChildren").value,
  };

  // Add simple validation
  if (!personalInfo.passportNo || !personalInfo.nationality || !personalInfo.maritalStatus) {
    alert("Please fill out all required fields.");
    return;
  }

  fetch(`http://localhost:8080/api/employees/${employeeId}/personal/${personalId}`, {
    method: "PUT", // Changed to PUT for updating data
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(personalInfo),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      console.log("Success:", data);
      alert("Personal information updated successfully!");
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("There was an error updating personal information.");
    });
}
