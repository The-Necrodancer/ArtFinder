$(document).ready(() => {
  // Edit blog functionality
  const editBlogForm = $("#edit-blog-form");
  if (editBlogForm.length) {
    editBlogForm.on("submit", (e) => {
      e.preventDefault();
      const blogId = editBlogForm.data("blogId");
      const formData = new FormData(editBlogForm[0]);

      $.ajax({
        url: `/blogs/update/${blogId}`,
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({
          title: formData.get("title"),
          content: formData.get("content"),
        }),
        success: () => {
          window.location.href = "/blogs";
        },
        error: (xhr) => {
          alert(xhr.responseJSON?.error || "Failed to update blog");
        },
      });
    });
  }
  // Delete blog functionality
  $(".delete-blog-btn").on("click", function (e) {
    e.preventDefault();

    if (
      !confirm(
        "Are you sure you want to delete this blog post? This action cannot be undone."
      )
    ) {
      return;
    }

    const blogId = $(this).data("blogId");
    $.ajax({
      url: `/blogs/delete/${blogId}`,
      method: "POST",
      contentType: "application/json",
      success: () => {
        window.location.href = "/blogs";
      },
      error: (xhr) => {
        alert(xhr.responseJSON?.error || "Failed to delete blog");
      },
    });
  });

  // Toggle edit form visibility
  const editToggleButtons = document.querySelectorAll(".toggle-edit-form");
  editToggleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const form = document.getElementById("edit-blog-form");
      const content = document.querySelector(".blog-content");

      if (form.style.display === "none") {
        form.style.display = "block";
        content.style.display = "none";
        button.textContent = "Cancel Edit";
      } else {
        form.style.display = "none";
        content.style.display = "block";
        button.textContent = "Edit Post";
      }
    });
  });
});
