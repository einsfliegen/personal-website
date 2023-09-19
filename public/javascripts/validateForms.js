        // Example starter JavaScript for disabling form submissions if there are invalid fields
        (function () {
            'use strict'

            // Fetch all the forms we want to apply custom Bootstrap validation styles to
            var forms = document.querySelectorAll('.validated-form');
            let username = document.querySelector("#username");

            // Loop over them and prevent submission
            Array.from(forms)
                .forEach(function (form) {
                    form.addEventListener('submit', function (event) {

                        if (!form.checkValidity()) {
                            event.preventDefault()
                            event.stopPropagation()
                        }

                        form.classList.add('was-validated')
                    }, false)
                })

                username?.addEventListener('input', (event) => {
                    let isValid = /^[a-zA-Z0-9_]+$/.test(event.target.value);
                    if (!isValid) {
                        username.setCustomValidity("Username can only contain letters, numbers and underscores.");
                    }
                    else{
                        username.setCustomValidity("");
                    }
                })

        })()