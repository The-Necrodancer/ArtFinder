document.addEventListener("DOMContentLoaded", function () {
  const filterButtons = document.querySelectorAll(".filter-btn");
  const messageCards = document.querySelectorAll(".message-card");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Update active button
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      // Filter messages
      const filter = button.dataset.filter;
      messageCards.forEach((card) => {
        if (filter === "inbox") {
          card.style.display =
            !card.classList.contains("archived") &&
            card.dataset.type === "received"
              ? "block"
              : "none";
        } else if (filter === "sent") {
          card.style.display = card.dataset.type === "sent" ? "block" : "none";
        } else if (filter === "archived") {
          card.style.display = card.classList.contains("archived")
            ? "block"
            : "none";
        }
      });
    });
  });
});
