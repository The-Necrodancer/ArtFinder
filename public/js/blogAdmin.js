document.addEventListener("DOMContentLoaded", () => {
  // Edit blog functionality
  const editBlogForm = document.getElementById("edit-blog-form");
  if (editBlogForm) {
    editBlogForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const blogId = editBlogForm.dataset.blogId;
      const formData = new FormData(editBlogForm);

      try {
        const response = await fetch(`/blogs/${blogId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: formData.get("title"),
            content: formData.get("content"),
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to update blog");
        }
        window.location.href = "/blogs";
      } catch (error) {
        alert(error.message);
      }
    });
  }

  // Delete blog functionality
  const deleteBlogButtons = document.querySelectorAll(".delete-blog-btn");
  deleteBlogButtons.forEach((button) => {
    button.addEventListener("click", async (e) => {
      e.preventDefault();

      if (
        !confirm(
          "Are you sure you want to delete this blog post? This action cannot be undone."
        )
      ) {
        return;
      }

      const blogId = button.dataset.blogId;
      try {
        const response = await fetch(`/blogs/${blogId}?_method=DELETE`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        // Server will handle the redirect, we just need to check for errors
        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.error || "Failed to delete blog");
        }
      } catch (error) {
        alert(error.message);
      }
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
