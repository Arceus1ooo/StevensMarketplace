const validation = require('../../validations');

(function ($) {
    const loginForm = $('#loginForm');
    const emailInput = $('#emailInput');
    const passwordInput = $('#passwordInput');
    const errorOutput = $('#error');

    loginForm.submit((event) => {
        event.preventDefault();
        errorOutput.empty();
        errorOutput.hide();

        let email = emailInput.val();
        let password = passwordInput.val();
        try {
            email = validation.VerifyEmail(email);
        } catch (e) {
            errorOutput.html(e);
            errorOutput.show();
            return;
        }
        try {
            password = validation.VerifyPassword(password);
        } catch (e) {
            errorOutput.html(e);
            errorOutput.show();
            return;
        }

        loginForm.submit();
    });
})(window.jQuery);