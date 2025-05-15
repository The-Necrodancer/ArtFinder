// Add event listeners to all password toggle buttons
document.addEventListener("DOMContentLoaded", () => {
  const passwordToggles = document.querySelectorAll(".password-toggle");

  const hidePassword = (input, icon, button) => {
    if (input.type === "text") {
      input.type = "password";
      icon.classList.remove("fa-eye-slash");
      icon.classList.add("fa-eye");
      button.setAttribute("aria-label", "Show password");
      button.setAttribute("aria-pressed", "false");
    }
  };

  passwordToggles.forEach((toggle) => {
    toggle.addEventListener("click", (e) => {
      const button = e.currentTarget;
      const container = button.closest(".password-container");
      const input = container.querySelector("input");
      const icon = button.querySelector("i");

      // Clear any existing timeout
      if (input.hideTimeout) {
        clearTimeout(input.hideTimeout);
      }

      // Toggle password visibility
      if (input.type === "password") {
        input.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
        button.setAttribute("aria-label", "Hide password");
        button.setAttribute("aria-pressed", "true");

        // Set timeout to automatically hide password after 10 seconds
        input.hideTimeout = setTimeout(() => {
          hidePassword(input, icon, button);
        }, 10000);
      } else {
        hidePassword(input, icon, button);
      }
    });

    // Clear timeout if user starts typing while password is visible
    const container = toggle.closest(".password-container");
    const input = container.querySelector("input");

    input.addEventListener("input", () => {
      if (input.type === "text" && input.hideTimeout) {
        clearTimeout(input.hideTimeout);
        input.hideTimeout = setTimeout(() => {
          hidePassword(input, toggle.querySelector("i"), toggle);
        }, 10000);
      }
    });
  });
});
