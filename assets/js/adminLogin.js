document
  .getElementById("loginForm")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent default form submission

    const adminLogin = {
      email: document.getElementById("email").value,
      password: document.getElementById("password").value,
    };

<<<<<<< HEAD
    fetch("http://localhost:8081/api/admin/login", {
=======
    fetch("http://localhost:8082/api/admin/login", {
>>>>>>> 869f502711416de6674617e5397e5c2ffac979bc
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(adminLogin),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Unauthorized");
        }
      })
      .then((data) => {
        console.log("Login Successful:", data);

        // Optionally store data in local storage
         //localStorage.setItem("adminId", data.id); 

        window.location.href = "admin-dashboard.html"; // Redirect to the admin dashboard
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Login failed. Please check your credentials.");
      });
  });
