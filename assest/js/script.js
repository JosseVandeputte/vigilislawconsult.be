document.addEventListener('DOMContentLoaded', function() {
    emailjs.init("2vP5WPGg6ucRCVHYs");
    const form = document.querySelector('#contact-form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const naam = document.querySelector('#Naam').value;
        const telefoonnummer = document.querySelector('#Telefoonnummer').value;
        const email = document.querySelector('#Email').value;
        const bericht = document.querySelector('#Bericht').value;
        const templateParams = {
            from_name: naam,
            reply_to: email,
            to_name: telefoonnummer,
            message: bericht,
        };
        emailjs.send('service_p7vxvxv', 'template_fecl5ui', templateParams).then(
            (response) => {
              console.log('SUCCESS!', response.status, response.text);
            },
            (error) => {
              console.log('FAILED...', error);
            },
        );
        form.classList.add('hidden');
        const confirmation = document.querySelector('#confirmation-section');
        confirmation.classList.remove('hidden');
    });
});