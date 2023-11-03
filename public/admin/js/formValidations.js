function showFormValidAlert() {
  console.log("alert fun called...");
  $("#FormAlert").fadeIn();

  setTimeout(function () {
    $("#FormAlert").fadeOut();
  }, 5000);
}

function validateCouponForm() {
  // Get form input values
  var code = document.getElementById("exampleInputName1").value;
  var discountAmount = parseFloat(
    document.getElementsByName("discount_amount")[0].value
  );
  var validFrom = new Date(document.getElementsByName("validFrom")[0].value);
  var validTo = new Date(document.getElementsByName("validTo")[0].value);
  var minimumSpend = parseFloat(
    document.getElementsByName("minimumSpend")[0].value
  );
  var maxUsers = parseInt(document.getElementsByName("maxUsers")[0].value);
  var description = document.getElementById("exampleTextarea1").value;
  var ValidErrMess = document.getElementById("ValidErrMess");

  // Check for blank space in all fields
  if (code.trim() === "" || description.trim() === "") {
    // alert("All fields must be filled out.");
    ValidErrMess.innerHTML = "All fields must be filled out.";
    showFormValidAlert();
    return false;
  }

  // Check for negative discount amount, minimum spend, and max users
  if (discountAmount < 0 || minimumSpend < 0 || maxUsers < 1) {
    // alert("Negative values are not allowed.");
    ValidErrMess.innerHTML = "Negative values are not allowed.";
    showFormValidAlert();
    return false;
  }

  // Check if validFromDate and validToDate have the correct format (yyyy-mm-dd)
  // if (!isValidDate(validFromDate) || !isValidDate(validToDate)) {
  //   // alert("Valid Date From and Valid Date To must be in yyyy-mm-dd format.");
  //   ValidErrMess.innerHTML = "Valid Date From and Valid Date To must be in yyyy-mm-dd format.";
  //   showFormValidAlert();
  //   return false;
  // }

  

  // Check if validFrom is after or equal to validTo
  if (validFrom >= validTo) {
    // alert("Valid Date From must be earlier than Valid Date To.");
    ValidErrMess.innerHTML =
      "Valid Date From must be earlier than Valid Date To.";
    showFormValidAlert();
    return false;
  }

  // Check if maxUsers is a non-decimal number
  if (!Number.isInteger(maxUsers)) {
    // alert("Max Users cannot have decimal points.");
    ValidErrMess.innerHTML = "Max Users cannot have decimal points.";
    showFormValidAlert();
    return false;
  }

  // Additional validation rules can be added here as needed.
  

  // If all validation checks pass, allow form submission
  return true;
}


// Function to validate the date format (yyyy-mm-dd)
// Function to validate the date format (yyyy-mm-dd)
// function isValidDate(dateString) {
//   var regEx = /^\d{4}-\d{2}-\d{2}$/;
//   if (!dateString.match(regEx)) {
//       alert("Date format must be yyyy-mm-dd.");
//       return false;
//   }

//   var dateParts = dateString.split("-");
//   var year = parseInt(dateParts[0]);
//   var month = parseInt(dateParts[1]);
//   var day = parseInt(dateParts[2]);

//   // Check if year, month, and day are within valid ranges
//   if (
//       year < 1000 || year > 9999 || // Year should be 4 digits
//       month < 1 || month > 12 ||    // Month should be between 1 and 12
//       day < 1 || day > 31          // Day should be between 1 and 31
//   ) {
//       alert("Invalid date components.");
//       return false;
//   }

//   // Check if the date is a real date
//   var parsedDate = new Date(dateString);
//   if (isNaN(parsedDate)) {
//       alert("Invalid date.");
//       return false;
//   }

//   return true;
// }