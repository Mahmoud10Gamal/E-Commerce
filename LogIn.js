var emailInputElement = document.querySelector(".login-card input#email-input");
var passwordInputElement = document.querySelector(".login-card input#password-input");
var loginButtonElement = document.querySelector("button#Login");
var signUpWord = document.querySelector("p#Sign-Up a");
var cardElement = emailInputElement.closest(".login-card");
const warningMsgElement = document.querySelector(".warning-Msg");
const loginInputs = Array.from(document.querySelectorAll("input"));
let allAccounts = JSON.parse(localStorage.getItem("Accounts")) || [];

function isLoginInputsNotEmpty(emailInput, passwordInput) {
  let isEmptyEmailInput = true;
  let isEmptyPasswordInput = true;

  if (emailInput.value === "") {
    emailInput.classList.add("is-invalid");
    emailInput.nextElementSibling.classList.replace("d-none", "d-block");
  } else {
    emailInput.classList.remove("is-invalid");
    emailInput.nextElementSibling.classList.replace("d-block", "d-none");
    isEmptyEmailInput = false;
  }

  if (passwordInput.value === "") {
    passwordInput.classList.add("is-invalid");
    passwordInput.nextElementSibling.classList.replace("d-none", "d-block");
  } else {
    passwordInput.classList.remove("is-invalid");
    passwordInput.nextElementSibling.classList.replace("d-block", "d-none");
    isEmptyPasswordInput = false;
  }

  return isEmptyEmailInput === false && isEmptyPasswordInput === false;
}

function isValidAccount(email, password) {
  if (!isLoginInputsNotEmpty(email, password)) {
    return;
  }

  if (email.value.toLowerCase() === "admin@admin.com") {
    if (password.value === "admin.2025") {
      warningMsgElement.classList.replace("d-block", "d-none");
      localStorage.setItem("userRole", JSON.stringify("admin"));
      window.location.href = "/admin.html";
    } else {
      warningMsgElement.classList.replace("d-none", "d-block");
      warningMsgElement.innerHTML = "Wrong Email or Password !";
    }
    return;
  }

  let isNotExistAccount = true;
  // let userInfo = []
  for (let i = 0; i < allAccounts.length; i++) {
    if (email.value.toLowerCase() === allAccounts[i].email) {
      isNotExistAccount = false;
      if (password.value === allAccounts[i].password) {
        warningMsgElement.classList.replace("d-block", "d-none");
        localStorage.setItem("userID", JSON.stringify(allAccounts[i].id));
        localStorage.setItem("userRole" , JSON.stringify(allAccounts[i].role))
        if (allAccounts[i].role === "user") {
          window.location.href = "/home.html";
        } else if (allAccounts[i].role === "seller") {
          window.location.href = "/seller.html";
        }
      } else {
        warningMsgElement.classList.replace("d-none", "d-block");
        warningMsgElement.innerHTML = "Wrong Password!";
      }
      return;
    }
  }

  if (isNotExistAccount) {
    warningMsgElement.classList.replace("d-none", "d-block");
    warningMsgElement.innerHTML = "This Email Does Not Exist";
  }
}

cardElement.addEventListener("click", function (e) {
  if (e.target === loginButtonElement) {
    isValidAccount(emailInputElement, passwordInputElement);
  }
});