document.addEventListener("DOMContentLoaded", () => {
  // Edit blog functionality
  const editBlogForm = document.getElementById("edit-blog-form");
  if (editBlogForm) {
    editBlogForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const blogId = editBlogForm.dataset.blogId;
      const formData = new FormData(editBlogForm);

      try {
        const response = await fetch(`/blogs/update/${blogId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: formData.get("title"),
            content: formData.get("content"),
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update blog");
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

      if (!confirm("Are you sure you want to delete this blog post? This action cannot be undone.")) {
        return;
      }

      const blogId = button.dataset.blogId;
      try {
        const response = await fetch(`/blogs/delete/${blogId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          }
        });

        if (!response.ok) {
          throw new Error("Failed to delete blog");
        }
        
        // Redirect to blogs list
        window.location.href = "/blogs";
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
