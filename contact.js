// Contact form validation — about.html only
(function () {
  const contactForm = document.getElementById("contactForm");
  if (!contactForm) return;

  const phoneInput = document.getElementById("phone");
  const fullNameInput = document.getElementById("fullName");
  const formError = document.getElementById("formError");
  const formSuccess = document.getElementById("formSuccess");

  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const phPhoneRegex = /^(09|\+639)\d{9}$/;
    const isValidPhone = phPhoneRegex.test(phoneInput.value.trim());
    const fullName = fullNameInput.value.trim();
    const isValid = Boolean(fullName) && isValidPhone;

    formError.classList.toggle("hidden", isValid);
    formSuccess.classList.add("hidden");
    phoneInput.classList.toggle("invalid", !isValidPhone);

    if (isValid) {
      formSuccess.classList.remove("hidden");
      contactForm.reset();

      setTimeout(() => {
        formSuccess.classList.add("hidden");
      }, 3000);
    }
  });
})();
