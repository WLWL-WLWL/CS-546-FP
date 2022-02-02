(function ($) {
    let loginForm = $('#signup-form')
    let firstNameInput = $('#firstName');
    let lastNameInput = $('#lastName');
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

       let firstName=firstNameInput.val().trim();
       let lastName=lastNameInput.val().trim();
        let username = usernameInput.val().trim();
        let password = passwordInput.val().trim();
        let hasErrors = false;
        if (!firstName|| !lastName||!username || !password) {
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