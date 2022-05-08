(function ($) {
    // We get the form element id here
    var loginForm = $('#login-form');

    // Add event listener here for when we submit
    loginForm.submit(function (event) {
        // Prevent default page reload
        event.preventDefault();

        // Get email and password inputs
        var email = $('#email').val();
        var password = $('#password').val();

        var errorList = [];

        // Email error checking
        if (email === undefined || email === '') throw 'An email is required!';
        if (typeof email !== 'string') throw 'Email must be of type string!';
        email = email.trim();
        if (email === '') throw 'Email cannot be empty!';
        const emailREGEX = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;
        if (!emailREGEX.test(email)) throw 'Email must abide by the following format example: example@domain.suffix';

        // Password error checking
        if (password === undefined || password === null) errorList.push('You must provide your password!');
        if (typeof password !== 'string') errorList.push('Password must be of type string!');
        password = password.trim();
        if (password === '') errorList.push('Password cannot be empty!');

        // Now we check and see if there were any errors
        if (errorList.length > 0) {
            // Create a ul element to hold any errors
            var errors = $('<ul class="error">');
            // Then, we add each error as an li element
            errorList.forEach((error) => {
                var errElement = $('<li>');
                errElement.text(error);
                errElement.appendTo(errors);
            });
            // Append errors to main after the form
            loginForm.after(errors);
        } else {
            var loginMsg = $('<p>');
            loginMsg.text('One moment, we are now logging you in...');
            loginForm.after(loginMsg);

            var requestConfig = {
                method: 'POST',
                url: '/login',
                contentType: 'application/json',
                data: JSON.stringify({
                    email,
                    password
                }),
                error: function (e) {
                    loginMsg.hide();
                    var errorMsg = $('#login-error');
                    errorMsg.text(e.responseJSON.error);
                    errorMsg.show();
                }
            };
            $.ajax(requestConfig).then(function (res) {
                loginMsg.hide();
                if (res.message === 'success') {
                    location.href = '/';
                }
            })
        }
    })
})(window.jQuery);