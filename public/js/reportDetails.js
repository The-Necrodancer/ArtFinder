document.addEventListener("DOMContentLoaded", function () {
  const commentForm = document.querySelector(".comment-form");
  const statusForm = document.querySelector(".status-form");
  const resolveForm = document.querySelector(".resolve-form");
  const deleteBtn = document.querySelector(".delete-report-btn");

  // Handle delete button
  if (deleteBtn) {
    deleteBtn.addEventListener("click", async function (e) {
      e.preventDefault();

      if (
        !confirm(
          "Are you sure you want to delete this report? This action cannot be undone."
        )
      ) {
        return;
      }

      const reportId = window.location.pathname.split("/")[2];

      try {
        const response = await fetch(`/reports/${reportId}`, {
          method: "DELETE",
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete report");
        }

        window.location.href = "/reports";
      } catch (error) {
        console.error("Error:", error);
        alert(error.message || "Failed to delete report. Please try again.");
      }
    });
  }

  // Handle comment submission
  if (commentForm) {
    commentForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const reportId = window.location.pathname.split("/")[2];
      const commentText = this.querySelector("#comment").value;

      try {
        const response = await fetch(`/reports/${reportId}/comment`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ comment: commentText }),
        });

        if (!response.ok) throw new Error("Failed to submit comment");

        const result = await response.json();

        // Add new comment to the page
        const commentsSection = document.querySelector(".comments-section");
        const newComment = document.createElement("div");
        newComment.className = "comment";
        newComment.innerHTML = `
                    <div class="comment-content">${commentText}</div>
                    <div class="comment-meta">
                        By ${result.username} on ${new Date().toLocaleString()}
                    </div>
                `;

        commentsSection.insertBefore(newComment, commentForm);
        this.reset();
      } catch (error) {
        console.error("Error:", error);
        alert("Failed to submit comment. Please try again.");
      }
    });
  }

  // Handle status updates
  if (statusForm) {
    statusForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const reportId = window.location.pathname.split("/")[2];
      const newStatus = this.querySelector("#status").value;

      try {
        const response = await fetch(`/reports/${reportId}/status`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        });

        if (!response.ok) throw new Error("Failed to update status");

        // Update status badge
        const statusBadge = document.querySelector(".report-status");
        statusBadge.textContent = newStatus;
        statusBadge.className = `report-status ${newStatus.toLowerCase()}`;

        // If status is Resolved, hide the forms
        if (newStatus === "Resolved") {
          document.querySelector(".admin-actions").style.display = "none";
          if (commentForm) commentForm.style.display = "none";
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Failed to update status. Please try again.");
      }
    });
  }

  // Handle resolution submission
  if (resolveForm) {
    resolveForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const reportId = window.location.pathname.split("/")[2];
      const resolution = this.querySelector("#resolution").value;

      try {
        const response = await fetch(`/reports/${reportId}/resolve`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ resolution }),
        });

        if (!response.ok) throw new Error("Failed to submit resolution");

        // Add resolution section
        const reportDetails = document.querySelector(".report-details");
        const resolutionSection = document.createElement("div");
        resolutionSection.className = "resolution-section";
        resolutionSection.innerHTML = `
                    <h3>Resolution</h3>
                    <div class="resolution-content">
                        ${resolution}
                    </div>
                    <p class="resolution-date"><strong>Resolved on:</strong> ${new Date().toLocaleString()}</p>
                `;

        // Insert before comments section
        const commentsSection = document.querySelector(".comments-section");
        reportDetails.insertBefore(resolutionSection, commentsSection);

        // Hide admin actions and comment form
        document.querySelector(".admin-actions").style.display = "none";
        if (commentForm) commentForm.style.display = "none";
      } catch (error) {
        console.error("Error:", error);
        alert("Failed to submit resolution. Please try again.");
      }
    });
  }
});
