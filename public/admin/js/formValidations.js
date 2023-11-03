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

  //check code is valid using ajax with pass code
 
 

  // If all validation checks pass, allow form submission
  return true;
}

