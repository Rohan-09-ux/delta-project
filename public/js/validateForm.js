// Client-side validation for both new.ejs and edit.ejs
(function() {
    'use strict';
    
    // Get all forms with class 'needs-validation'
    const forms = document.querySelectorAll('.needs-validation');
    
    Array.prototype.slice.call(forms).forEach(function(form) {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        }, false);
    });

    // Custom validation for title (3+ chars, letters/numbers/spaces only)
    const titleInputs = document.querySelectorAll('input[name="listing[title]"]');
    titleInputs.forEach(input => {
        input.addEventListener('input', function() {
            const value = this.value.trim();
            const titleFeedback = this.parentNode.querySelector('.invalid-feedback');
            
            if (value === '') {
                this.setCustomValidity('Title is required!');
            } else if (value.length < 3) {
                this.setCustomValidity('Title must be at least 3 characters!');
            } else if (!/^[a-zA-Z0-9\s\-_]+$/.test(value)) {
                this.setCustomValidity('Title can only contain letters, numbers, spaces, -, _');
            } else {
                this.setCustomValidity('');
            }
            
            this.reportValidity();
        });
    });

    // Price validation
    const priceInputs = document.querySelectorAll('input[name="listing[price]"]');
    priceInputs.forEach(input => {
        input.addEventListener('input', function() {
            const value = parseFloat(this.value);
            const feedback = this.parentNode.querySelector('.invalid-feedback');
            
            if (this.value === '') {
                this.setCustomValidity('Price is required!');
            } else if (value <= 0) {
                this.setCustomValidity('Price must be greater than 0!');
            } else if (value > 1000000) {
                this.setCustomValidity('Price too high (max 1,000,000)!');
            } else {
                this.setCustomValidity('');
            }
            
            this.reportValidity();
        });
    });

    // Location & Country (min 2 chars)
    const textInputs = document.querySelectorAll('input[name="listing[location]"], input[name="listing[country]"], textarea[name="listing[description]"]');
    textInputs.forEach(input => {
        input.addEventListener('input', function() {
            const value = this.value.trim();
            const minLength = this.name.includes('description') ? 10 : 2;
            
            if (value === '') {
                this.setCustomValidity(this.name.includes('description') ? 'Description is required!' : 'This field is required!');
            } else if (value.length < minLength) {
                this.setCustomValidity(`${this.name.includes('description') ? 'Description' : 'Field'} must be at least ${minLength} characters!`);
            } else {
                this.setCustomValidity('');
            }
            
            this.reportValidity();
        });
    });

})();