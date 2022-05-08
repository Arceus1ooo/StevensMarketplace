(function($) {
    // We get the form element id here
    var signUpForm = $('#signup-form');

    // Add event listener here for when we submit
    signUpForm.submit(function (event) {
        // Prevent default page reload
        event.preventDefault();

        // Get error list element
        var errors = $('#signup-input-errors');
        errors.empty();

        // Get all inputs
        var email = $('#email').val().toLowerCase();
        var password = $('#password').val();

        var errorList = [];

        // Error check email
        try {
            if (email === undefined || email === '') throw 'An email is required!';
            if (typeof email !== 'string') throw 'Email must be of type string!';
            email = email.trim();
            if (email === '') throw 'Email cannot be empty!';
            if (email.length > 254) throw 'Email cannot contain more than 128 characters!';
            const emailREGEX = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;
            if (!emailREGEX.test(email)) throw 'Email must abide by the following format example: example@domain.suffix';
        } catch (e) {
            errorList.push(e);
        }

        // Error check password
        try {
            if (password === undefined || password === '') throw 'A password is required!';
            if (typeof password !== 'string') throw 'Password must be of type string!';
            if (password.length < 8) throw 'Password must contain at least 8 characters!';
            const passwordNumREGEX = /[0-9]+/;
			const passwordLettersREGEX = /[a-zA-Z]+/;
            if (!passwordNumREGEX.test(password) || !passwordLettersREGEX.test(password)) throw 'Password must contain at least 1 letter and 1 number!';
        } catch (e) {
            errorList.push(e);
        }

        // Check if there were errors. If there were, then print each error as a new element li
        if (errorList.length > 0) {
            // Add each error as a new li element to errors
            errorList.forEach((errorStr) => {
                // Create the li element
                var errElement = $('<li>');
                // Add error text
                errElement.text(errorStr);
                // Append to errors var
                errElement.appendTo(errors);
            });
            errors.show()
        } else {
            // Render new p element telling user that their account is being created
            var accountCreationMsg = $('<p>');
            accountCreationMsg.text('One moment, your account is being created...');
            signUpForm.after(accountCreationMsg);
            errors.hide();

            // Submit an ajax request to POST
            var requestConfig = {
                method: 'POST',
                url: '/signup',
                contentType: 'application/json',
                data: JSON.stringify({
                    email,
                    password
                }),
                error: function(e) {
                    // Hide our account creation message...
                    accountCreationMsg.hide();
                    var errorMsg = $('<p>');
                    errorMsg.text(e.responseJSON.error);
                    errorMsg.appendTo(errors);
                    errors.show();
                }
            };
            $.ajax(requestConfig).then(function (res) {
                accountCreationMsg.hide();
                if (res.message === 'success') {
                    // Redirect to home route
                    location.href = '/';
                }
            });
        }
    })
})(window.jQuery);