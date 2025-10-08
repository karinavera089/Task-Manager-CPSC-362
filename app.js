document.getElementById("loginForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const userName = document.getElementById("user").value;
  const password = document.getElementById("pass").value;

  //hardcoded check
  if (userName === "admin" && password === "1234") {
    localStorage.setItem("loggedIn", "yes");
    window.location = "task-manager.html";
  } else {
    document.getElementById("msg").textContent = "Invalid credentials.";
  }
});
