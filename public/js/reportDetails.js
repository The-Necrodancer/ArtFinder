$(document).ready(function () {
  const commentForm = $(".comment-form");
  const statusForm = $(".status-form");
  const resolveForm = $(".resolve-form");
  const deleteBtn = $(".delete-report-btn");

  // Handle delete button
  if (deleteBtn.length) {
    deleteBtn.on("click", function (e) {
      e.preventDefault();

      if (
        !confirm(
          "Are you sure you want to delete this report? This action cannot be undone."
        )
      ) {
        return;
      }

      const reportId = window.location.pathname.split("/")[2];

      $.ajax({
        url: `/reports/${reportId}`,
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
        success: function () {
          window.location.href = "/reports";
        },
        error: function (xhr) {
          const errorMsg =
            xhr.responseJSON?.error ||
            "Failed to delete report. Please try again.";
          console.error("Error:", errorMsg);
          alert(errorMsg);
        },
      });
    });
  }
  // Handle comment submission
  if (commentForm.length) {
    commentForm.on("submit", function (e) {
      e.preventDefault();
      const reportId = window.location.pathname.split("/")[2];
      const commentText = $(this).find("#comment").val();

      $.ajax({
        url: `/reports/${reportId}/comment`,
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({ comment: commentText }),
        success: function (result) {
          // Add new comment to the page
          const commentsSection = $(".comments-section");
          const newComment = $("<div>").addClass("comment").html(`
            <div class="comment-content">${commentText}</div>
            <div class="comment-meta">
                By ${result.username} on ${new Date().toLocaleString()}
            </div>
          `);

          commentsSection.prepend(newComment);
          commentForm[0].reset();
        },
        error: function (xhr) {
          const errorMsg =
            xhr.responseJSON?.error ||
            "Failed to submit comment. Please try again.";
          console.error("Error:", errorMsg);
          alert(errorMsg);
        },
      });
    });
  }
  // Handle status updates
  if (statusForm.length) {
    statusForm.on("submit", function (e) {
      e.preventDefault();
      const reportId = window.location.pathname.split("/")[2];
      const newStatus = $(this).find("#status").val();

      $.ajax({
        url: `/reports/${reportId}/status`,
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({ status: newStatus }),
        success: function () {
          // Update status badge
          const statusBadge = $(".report-status");
          statusBadge.text(newStatus);
          statusBadge.attr("class", `report-status ${newStatus.toLowerCase()}`);

          // If status is Resolved, hide the forms
          if (newStatus === "Resolved") {
            $(".admin-actions").hide();
            commentForm.hide();
          }
        },
        error: function (xhr) {
          const errorMsg =
            xhr.responseJSON?.error ||
            "Failed to update status. Please try again.";
          console.error("Error:", errorMsg);
          alert(errorMsg);
        },
      });
    });
  }
  // Handle resolution submission
  if (resolveForm.length) {
    resolveForm.on("submit", function (e) {
      e.preventDefault();
      const reportId = window.location.pathname.split("/")[2];
      const resolution = $(this).find("#resolution").val();

      $.ajax({
        url: `/reports/${reportId}/resolve`,
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({ resolution }),
        success: function () {
          // Add resolution section
          const reportDetails = $(".report-details");
          const resolutionSection = $("<div>").addClass("resolution-section")
            .html(`
            <h3>Resolution</h3>
            <div class="resolution-content">
                ${resolution}
            </div>
            <p class="resolution-date"><strong>Resolved on:</strong> ${new Date().toLocaleString()}</p>
          `);

          // Insert before comments section
          const commentsSection = $(".comments-section");
          resolutionSection.insertBefore(commentsSection);

          // Hide admin actions and comment form
          $(".admin-actions").hide();
          commentForm.hide();
        },
        error: function (xhr) {
          const errorMsg =
            xhr.responseJSON?.error ||
            "Failed to submit resolution. Please try again.";
          console.error("Error:", errorMsg);
          alert(errorMsg);
        },
      });
    });
  }
});
