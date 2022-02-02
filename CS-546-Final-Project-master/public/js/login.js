(function ($) {
    let loginForm = $('#login-form')
    let usernameInput = $('#username');
    let passwordInput = $('#password');
    let submitBtn = $('#submit-btn');
    let error= $('.error');
    let errorMessage= $('.errorMessage');

    loginForm.submit((event) => {
        event.preventDefault();
        submitBtn.prop('disabled', true);
        error.hide();
        errorMessage.hide();

       
        let username = usernameInput.val().trim();
        let password = passwordInput.val().trim();
        let hasErrors = false;
        if (!username || !password) {
            hasErrors = true;
        }

        if (!hasErrors) {
            loginForm.unbind().submit();
            errorMessage.show();
        } else {
            submitBtn.prop('disabled', false);
            error.show();
        }
    });
})(jQuery);