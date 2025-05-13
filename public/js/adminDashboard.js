document.addEventListener("DOMContentLoaded", function () {
  const filterButtons = document.querySelectorAll(".filter-btn");
  const reportCards = document.querySelectorAll(".report-card");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Update active button
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      // Filter reports
      const filter = button.dataset.filter.toLowerCase();
      reportCards.forEach((card) => {
        if (filter === "all") {
          card.style.display = "block";
        } else if (filter === "deleted") {
          card.style.display = card.classList.contains("deleted")
            ? "block"
            : "none";
        } else {
          const matchesFilter = card.classList.contains(filter);
          const isNotDeleted = !card.classList.contains("deleted");
          card.style.display = matchesFilter && isNotDeleted ? "block" : "none";
        }
      });
    });
  });
});
