// Comments management
$(document).ready(() => {
  const commentsSection = $(".comments-section");
  if (!commentsSection.length) return;

  const targetId = commentsSection.data("targetId");
  const targetType = commentsSection.data("targetType");

  // Load comments
  loadComments();

  // Comment form submission
  const commentForm = $("#comment-form");
  if (commentForm.length) {
    commentForm.on("submit", (e) => {
      e.preventDefault();
      const content = commentForm.find("textarea").val();

      $.ajax({
        url: "/comments",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({ content, targetId, targetType }),
        success: () => {
          commentForm[0].reset();
          loadComments();
        },
        error: (xhr) => {
          console.error(
            "Error posting comment:",
            xhr.responseJSON?.error || xhr.statusText
          );
        },
      });
    });
  }
  // Load comments function
  function loadComments() {
    $.ajax({
      url: `/comments/${targetId}?targetType=${targetType}`,
      method: "GET",
      success: (comments) => {
        renderComments(comments);
      },
      error: (xhr) => {
        console.error(
          "Error loading comments:",
          xhr.responseJSON?.error || xhr.statusText
        );
      },
    });
  }

  // Render comments
  function renderComments(comments) {
    const commentsList = document.querySelector(".comment-list");
    if (!commentsList) return;

    commentsList.innerHTML = comments
      .map(
        (comment) => `
      <div class="comment" data-comment-id="${comment._id}">
        <div class="comment-header">
          <span class="comment-author">${comment.username}</span>
          <span class="comment-date">${formatDate(comment.createdAt)}</span>
        </div>
        <div class="comment-content">${comment.content}</div>
        <div class="comment-actions">
          <button onclick="likeComment('${comment._id}')">
            Like (${comment.likes})
          </button>
          <button onclick="toggleReplyForm('${comment._id}')">Reply</button>
          ${
            comment.userId === currentUserId
              ? `
            <button onclick="editComment('${comment._id}')">Edit</button>
            <button onclick="deleteComment('${comment._id}')">Delete</button>
          `
              : ""
          }
        </div>
        <div class="replies">
          ${renderReplies(comment.replies)}
        </div>
        <form class="reply-form" id="reply-form-${comment._id}">
          <textarea required placeholder="Write a reply..."></textarea>
          <button type="submit">Post Reply</button>
        </form>
      </div>
    `
      )
      .join("");

    // Add event listeners for reply forms
    document.querySelectorAll(".reply-form").forEach((form) => {
      form.addEventListener("submit", handleReplySubmit);
    });
  }

  // Render replies
  function renderReplies(replies) {
    if (!replies?.length) return "";
    return replies
      .map(
        (reply) => `
      <div class="reply">
        <div class="comment-header">
          <span class="comment-author">${reply.username}</span>
          <span class="comment-date">${formatDate(reply.createdAt)}</span>
        </div>
        <div class="comment-content">${reply.content}</div>
        <div class="comment-actions">
          <button onclick="likeComment('${reply._id}')">
            Like (${reply.likes})
          </button>
        </div>
      </div>
    `
      )
      .join("");
  }

  // Handle reply submission
  async function handleReplySubmit(e) {
    e.preventDefault();
    const form = e.target;
    const commentId = form.id.replace("reply-form-", "");
    const content = form.querySelector("textarea").value;

    try {
      const response = await fetch(`/comments/${commentId}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error("Failed to post reply");
      form.reset();
      form.style.display = "none";
      await loadComments();
    } catch (err) {
      console.error("Error posting reply:", err);
    }
  }
});

// Helper functions
function toggleReplyForm(commentId) {
  const form = document.getElementById(`reply-form-${commentId}`);
  form.style.display = form.style.display === "none" ? "block" : "none";
}

async function likeComment(commentId) {
  try {
    const response = await fetch(`/comments/${commentId}/like`, {
      method: "POST",
    });
    if (!response.ok) throw new Error("Failed to like comment");
    await loadComments();
  } catch (err) {
    console.error("Error liking comment:", err);
  }
}

function editComment(commentId) {
  const comment = $(`[data-comment-id="${commentId}"]`);
  const content = comment.find(".comment-content");
  const currentText = content.text();

  content.html(`
    <form class="edit-form">
      <textarea required>${currentText}</textarea>
      <button type="submit">Save</button>
      <button type="button" onclick="cancelEdit('${commentId}', '${currentText}')">Cancel</button>
    </form>
  `);

  content.find("form").on("submit", function (e) {
    e.preventDefault();
    const newContent = $(this).find("textarea").val();

    $.ajax({
      url: `/comments/${commentId}`,
      method: "PUT",
      contentType: "application/json",
      data: JSON.stringify({ content: newContent }),
      success: () => {
        loadComments();
      },
      error: (xhr) => {
        console.error(
          "Error updating comment:",
          xhr.responseJSON?.error || xhr.statusText
        );
      },
    });
  });
}

function cancelEdit(commentId, originalContent) {
  const comment = document.querySelector(`[data-comment-id="${commentId}"]`);
  const content = comment.querySelector(".comment-content");
  content.textContent = originalContent;
}

async function deleteComment(commentId) {
  if (!confirm("Are you sure you want to delete this comment?")) return;
  try {
    const response = await fetch(`/comments/${commentId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete comment");
    await loadComments();
  } catch (err) {
    console.error("Error deleting comment:", err);
  }
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
