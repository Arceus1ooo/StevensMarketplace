(function ($) {
  // We get the form element id here
  var loginForm = $("#login-form");

  // Add event listener here for when we submit
  loginForm.submit(function (event) {
    // Prevent default page reload
    event.preventDefault();

    // Get username and password inputs
    var username = $("#username").val();
    var password = $("#password").val();

    var errorList = [];

    // Username error checking
    if (username === undefined || username === null)
      errorList.push("You must provide your username!");
    if (typeof username !== "string")
      errorList.push("Username must be of type string!");
    username = username.trim();
    if (username === "") errorList.push("Username cannot be empty!");
    const usernameREGEX = /[ 	]/;
    if (usernameREGEX.test(username))
      errorList.push("Username must not contain any whitespace characters!");

    // Paswword error checking
    if (password === undefined || username === null)
      errorList.push("You must provide your password!");
    if (typeof password !== "string")
      errorList.push("Password must be of type string!");
    password = password.trim();
    if (password === "") errorList.push("Password cannot be empty!");

    // Now we check and see if there were any errors
    if (errorList.length > 0) {
      // Create a ul element to hold any errors
      var errors = $('<ul class="error">');
      // Then, we add each error as an li element
      errorList.forEach((error) => {
        var errElement = $("<li>");
        errElement.text(error);
        errElement.appendTo(errors);
      });
      // Append errors to main after the form
      loginForm.after(errors);
    } else {
      var loginMsg = $("<p>");
      loginMsg.text("One moment, we are now logging you in...");
      loginForm.after(loginMsg);

      var requestConfig = {
        method: "POST",
        url: "",
        contentType: "application/json",
        data: JSON.stringify({
          username,
          password,
        }),
        error: function (e) {
          loginMsg.hide();
          var errorMsg = $("#login-error");
          errorMsg.text(e.responseJSON.error);
          errorMsg.show();
        },
      };
      $.ajax(requestConfig).then(function (res) {
        loginMsg.hide();
        if (res.message === "success") {
          location.href = "/";
        }
      });
    }
  });
})(window.jQuery);
