// Add event listeners to all password toggle buttons
document.addEventListener("DOMContentLoaded", () => {
  const passwordToggles = document.querySelectorAll(".password-toggle");

  passwordToggles.forEach((toggle) => {
    toggle.addEventListener("click", (e) => {
      const button = e.currentTarget;
      const container = button.closest(".password-container");
      const input = container.querySelector("input");
      const icon = button.querySelector("i");

      // Toggle password visibility
      if (input.type === "password") {
        input.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
        button.setAttribute("aria-label", "Hide password");
      } else {
        input.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
        button.setAttribute("aria-label", "Show password");
      }
    });
  });

  // Automatically hide password after 10 seconds if left visible
  const hidePassword = (input, icon, button) => {
    if (input.type === "text") {
      input.type = "password";
      icon.classList.remove("fa-eye-slash");
      icon.classList.add("fa-eye");
      button.setAttribute("aria-label", "Show password");
    }
  };

  passwordToggles.forEach((toggle) => {
    const container = toggle.closest(".password-container");
    const input = container.querySelector("input");
    const icon = toggle.querySelector("i");

    input.addEventListener("input", () => {
      if (input.type === "text") {
        clearTimeout(input.hideTimeout);
        input.hideTimeout = setTimeout(() => {
          hidePassword(input, icon, toggle);
        }, 10000); // 10 seconds
      }
    });
  });
});
