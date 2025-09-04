//* Get html Elements
var nameInputElement=document.querySelector(".sign-up input#name-input")
var emailInputElement=document.querySelector(".sign-up input#email-input")
var PasswordInputElement=document.querySelector(".sign-up input#password-input")
var signupButtonElement=document.querySelector("button#sign-up")
var errorMessageElement=document.querySelector("p.error-message")
let userRole = ""
const allInputs = document.querySelectorAll('input:not([type="radio"])')
const allRadios = Array.from(document.querySelectorAll("input[type=radio]"))
const radiosErrMsg = document.querySelector(".radiosErrMsg")
console.log(radiosErrMsg);



let allAccounts=[]
var allRejexs={
    //? name rejix the name cosist of on word or more every word at least 3 letters
    nameRejex:/^[A-Za-z]{3,}(?:\s[A-Za-z]{3,})*$/g ,
    emailRejex: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/g,
    passwordRejex:/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/gm
}







 if (localStorage.getItem("Accounts")) {
    allAccounts=JSON.parse(localStorage.getItem("Accounts"))
 }

//* ========================= ? functions ? ===================================== 
//?=====================================> ? ADD FUNCTION ? <=============================================

// Helper function to generate unique ID
function generateId() {
  return 'u' +  Math.floor(Math.random() * 1000);
}

// ===========================> ADD FUNCTION <==============================
function addAccount() {
  if (isValidInput) {
    var userAccount = {
      id: generateId(),   
      name: nameInputElement.value,
      email: emailInputElement.value,
      password: PasswordInputElement.value,
      role: userRole,
      cart:[]
    };

    allAccounts.push(userAccount);
    localStorage.setItem("Accounts", JSON.stringify(allAccounts));
    console.log(allAccounts);
  }
}
//?=====================================> ? Isempty inputs FUNCTION ? <=====================================
function isEmptyInputs(nameInput, emailInput, passwordInput) {
    if (nameInput.value=="" & emailInput.value=="" & passwordInput.value=="") {
        allInputs.forEach((input)=>{
            input.classList.add("is-invalid")
        })
        errorMessageElement.classList.replace("d-none" , "d-block")
        errorMessageElement.innerHTML="All inputs is required !"
        return true
}
else if(!(nameInput.value=="" & emailInput.value=="" & passwordInput.value=="")){
     allInputs.forEach((input)=>{
            input.classList.remove("is-invalid")
        })
        errorMessageElement.classList.replace("d-block" , "d-none")
        errorMessageElement.innerHTML=""
        return false
}

}
//?=====================================> ? Isempty inputs FUNCTION ? <=====================================
function checkradios(allRadios ) {
 
   let isCheckedRadio = false

   for (let i = 0; i < allRadios.length; i++) {
        if (allRadios[i].checked === true) {
            userRole = allRadios[i].value
            isCheckedRadio = true
            radiosErrMsg.classList.replace("block" , "d-none")
            break ;
        }
   }
     if (isCheckedRadio === false) {
            radiosErrMsg.classList.replace(  "d-none" , "block")
        }

        return isCheckedRadio;
}
//?=====================================> ? validatiom with rejex  FUNCTION ? <====================================
function isValidInput(inputElement , rejex) {
    if (rejex.test(inputElement.value)) {
    //   console.log("valid input");
      inputElement.classList.add("is-valid")
      inputElement.classList.remove("invalid")
      if (inputElement.nextElementSibling) {
        inputElement.nextElementSibling.classList.replace("d-block","d-none")
      }
      return true
    }
    else if(!(rejex.test(inputElement.value)))
    {
        inputElement.classList.remove("is-valid")
        inputElement.classList.add("invalid")
        inputElement.nextElementSibling.classList.replace("d-none","d-block")
        return false
    }
    errorMessageElement.classList.replace("d-block" , "d-none")
}


//?=====================================> ? IsExsistAccount FUNCTION ? <=====================================
function IsExsistAccount(emailInput ) {
   
    var flag=true
        if (allAccounts.length==0)
        {
            addAccount()
             errorMessageElement.classList.replace("d-none" , "d-block")
             errorMessageElement.classList.replace("text-danger" , "text-success")
             errorMessageElement.innerHTML="success"
             console.log("first Account");
              window.location.href = "/index.html";
             flag=false
        }
        else if(allAccounts.length>0)
        {
            for (var i = 0; i < allAccounts.length; i++)
            {
                if (allAccounts[i].email==emailInput.value) 
                {
                    console.log(allAccounts[i].email);
                    errorMessageElement.classList.replace("d-none" , "d-block")
                    errorMessageElement.classList.replace("text-success" , "text-danger")
                    errorMessageElement.innerHTML="Email Is arleady Exist !"
                    flag=false
                }
            }
            if (flag) {
                errorMessageElement.classList.replace("d-none" , "d-block")
                errorMessageElement.classList.replace("text-danger" , "text-success")
                errorMessageElement.innerHTML="success"
                addAccount()
                window.location.href = "/index.html";
                
                
            }
        }         
    }  

 
//?=====================================> ? CLEAR FUNCTION ? <====================================

 function clearInputs() {
    nameInputElement.value=""
    emailInputElement.value=""
    PasswordInputElement.value=""
  
    
 }

 //* ================================ ? Events ? ===========================

signupButtonElement.addEventListener("click" , function(e){
   
       if (( isEmptyInputs(nameInputElement , emailInputElement , PasswordInputElement)==false) & (checkradios(allRadios))) {
             IsExsistAccount(emailInputElement)
       }

 })

nameInputElement.addEventListener("blur" , function (e) {
    isValidInput(e.target , allRejexs.nameRejex)
    
})
emailInputElement.addEventListener("blur" , function (e) {
    isValidInput(e.target , allRejexs.emailRejex)
})
PasswordInputElement.addEventListener("blur" , function (e) {
    isValidInput(e.target , allRejexs.passwordRejex)
})




