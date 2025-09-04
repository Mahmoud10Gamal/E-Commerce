    document.getElementById("paymentForm").addEventListener("submit", function(e) {
      e.preventDefault();

      let cardNumber = document.getElementById("cardNumber").value.trim();
      let cardName = document.getElementById("cardName").value.trim();
      let expiryDate = document.getElementById("expiryDate").value.trim();
      let cvv = document.getElementById("cvv").value.trim();

      let valid = true;

      // Card Number: 16 digits
      if (!/^\d{16}$/.test(cardNumber)) {
        valid = false;
      }

      // Name: letters and spaces only
      if (!/^[A-Za-z\s]{3,}$/.test(cardName)) {
        valid = false;
      }

      // Expiry Date: MM/YY and valid month
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate)) {
        valid = false;
      }

      // CVV: 3 digits
      if (!/^\d{3}$/.test(cvv)) {
        valid = false;
      }

      if (!valid) {
        document.getElementById("errorAlert").classList.remove("d-none");
        document.getElementById("successAlert").classList.add("d-none");
        return;
      }

      // Hide error, show success
      document.getElementById("errorAlert").classList.add("d-none");
      document.getElementById("successAlert").classList.remove("d-none");

      // Redirect after delay
      setTimeout(() => {
        window.location.href = "cart.html";
      }, 2000);
    });