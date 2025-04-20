document
  .getElementById("search-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const searchInput = document.getElementById("search-input").value;
    const searchType = document.querySelector(
      'input[name="search-type"]:checked'
    ).value;

    // https:stackoverflow.com/questions/21937353/javascript-passing-an-encoded-url-to-window-location-href/21937720
    // Redirect to the search results page with the search input and type as query parameters
    window.location.href = `/search?query=${encodeURIComponent(
      searchInput
    )}&type=${encodeURIComponent(searchType)}`;
  });
document.getElementById("search-input").addEventListener("input", function () {
  const searchInput = document.getElementById("search-input").value;
  const searchButton = document.getElementById("search-button");

  // Enable the search button only if there is input in the search field
  searchButton.disabled = searchInput.trim() === "";
});
