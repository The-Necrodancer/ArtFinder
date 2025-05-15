const possibleTagsList = [
"2D",
"3D",
"Abstract",
"Animals",
"Anime",
"Architecture",
"Black/White",
"Calligraphy",
"Caricature",
"Cartoon",
"Chibi",
"Classical",
"Comic",
"Concept Art",
"Cyberpunk",
"Doodle",
"Fan Art",
"Fantasy",
"Fashion",
"Food & Drink",
"Game",
"Gothic",
"Graffiti",
"Historical",
"Horror",
"Isometric",
"Mythology",
"Nature",
"Pixel Art",
"Pop",
"Post-Apocalytic",
"Realistic",
"Retro",
"Sci-Fi",
"Sketch",
"Sports",
"Steampunk",
"Technical"];

document
  .getElementById("search-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const artist = document.getElementById("search-input").value.trim();
    const styleSelect = document.getElementById("style-select");
    const styles = Array.from(styleSelect.selectedOptions).map(opt => opt.value).filter(v => v);
    const minPriceInput = document.getElementById("min-price");
    const maxPriceInput = document.getElementById("max-price");
    const minRatingInput = document.getElementById("min-rating");
    const maxRatingInput = document.getElementById("max-rating");
    const minCommissionInput = document.getElementById("min-commission-number");
    const maxCommissionInput = document.getElementById("max-commission-number");
    const availability = document.getElementById("availability-select").value.trim();
    const sortMethodInput = document.getElementById("sorting-method-select").value.trim();

    const lowPrice = minPriceInput.value.trim();
    const highPrice = maxPriceInput.value.trim();
    const lowRating = minRatingInput.value.trim();
    const highRating = maxRatingInput.value.trim();
    const minCommission = minCommissionInput.value.trim();
    const maxCommission = maxCommissionInput.value.trim();
    // https:stackoverflow.com/questions/21937353/javascript-passing-an-encoded-url-to-window-location-href/21937720
    // Redirect to the search results page with the search input and type as query parameters
    const params = new URLSearchParams();
    if (artist) params.append("artist", artist);
    if (styles.length > 0) {
      styles.forEach(style => params.append("style", style));
    }
    params.append("low-price", lowPrice);
    params.append("high-price", highPrice);
    params.append("low-rating", lowRating);
    params.append("high-rating", highRating);
    params.append("available", availability);
    params.append("min-commission", minCommission);
    params.append("max-commission", maxCommission);
    params.append("sort", sortMethodInput);
    // Redirect with all query parameters
    window.location.href = `/search?${params.toString()}`;
  });
document
  .addEventListener("DOMContentLoaded", () => {
  const styleSelect = document.querySelector('select[name="tags"]');
  const searchButton = document.getElementById("search-button");
  const availability = document.getElementById("availability-select");
  const searchInput = document.getElementById("search-input");
  const params = new URLSearchParams(window.location.search);
  const selectedStyles = params.getAll('style').concat(params.getAll('tags'));
  styleSelect.innerHTML = '';

  // add default option
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Any Style";
  defaultOption.selected = selectedStyles.length === 0;
  styleSelect.appendChild(defaultOption);

  // create options from tag list
  possibleTagsList.forEach(tag => {
    const option = document.createElement("option");
    option.value = tag;
    option.textContent = tag;
    if (selectedStyles.includes(tag)) {
      option.selected = true;
    }
    styleSelect.appendChild(option);
  });

  const minPriceInput = document.getElementById("min-price");
  const maxPriceInput = document.getElementById("max-price");
  const minPriceValue = document.getElementById("min-price-value");
  const maxPriceValue = document.getElementById("max-price-value");
  
  function updatePriceLabels() {
    let minVal = parseInt(minPriceInput.value);
    let maxVal = parseInt(maxPriceInput.value);

    // Basic math to prevent negative range for min/max
    if (minVal > maxVal) {
      minVal = maxVal;
      minPriceInput.value = minVal;
    } else if (maxVal < minVal) {
      maxVal = minVal;
      maxPriceInput.value = maxVal;
    }

    minPriceValue.textContent = minVal;
    maxPriceValue.textContent = maxVal;

    toggleSearchButton();
  }

  const minRatingInput = document.getElementById("min-rating");
  const maxRatingInput = document.getElementById("max-rating");
  const minRatingValue = document.getElementById("min-rating-value");
  const maxRatingValue = document.getElementById("max-rating-value");
  
  function updateRatingLabels() {
    let minVal = parseFloat(minRatingInput.value);
    let maxVal = parseFloat(maxRatingInput.value);

    // Basic math to prevent negative range for min/max
    if (minVal > maxVal) {
      minVal = maxVal;
      minRatingInput.value = minVal;
    } else if (maxVal < minVal) {
      maxVal = minVal;
      maxRatingInput.value = maxVal;
    }

    minRatingValue.textContent = minVal;
    maxRatingValue.textContent = maxVal;

    toggleSearchButton();
  }

  const minCommissionInput = document.getElementById("min-commission-number");
  const maxCommissionInput = document.getElementById("max-commission-number");
  const minCommissionValue = document.getElementById("min-commission-number-value");
  const maxCommissionValue = document.getElementById("max-commission-number-value");

  function updateCommissionLabels() {
    let minVal = parseInt(minCommissionInput.value);
    let maxVal = parseInt(maxCommissionInput.value);

    if (minVal > maxVal) {
      minVal = maxVal;
      minCommissionInput.value = minVal;
    } else if (maxVal < minVal) {
      maxVal = minVal;
      maxCommissionInput.value = maxVal;
    }

    minCommissionValue.textContent = minVal;
    maxCommissionValue.textContent = maxVal;
    toggleSearchButton()
  }
  function toggleSearchButton() {
    const artist = searchInput.value.trim();
    const styles = Array.from(styleSelect.selectedOptions).map(opt => opt.value).filter(v => v);
    const lowPrice = minPriceInput.value.trim();
    const highPrice = maxPriceInput.value.trim();
    const lowRating = minRatingInput.value.trim();
    const highRating = maxRatingInput.value.trim();
    const available = availability.value.trim();
    const minCommission = minCommissionInput.value.trim();
    const maxCommission = maxCommissionInput.value.trim();
    const sortMethodInput = document.getElementById("sorting-method-select").value.trim();
    searchButton.disabled = artist === "" && styles.length === 0 && lowPrice === "0" && highPrice === "1000" && lowRating === "0" && highRating === "5" && available === ""
    && minCommission === 0 && maxCommission === 100 && sortMethodInput === "";
  }
  // Activate on startup
  updatePriceLabels();
  updateRatingLabels();
  updateCommissionLabels();
  toggleSearchButton()

  searchInput.addEventListener("input", toggleSearchButton);
  styleSelect.addEventListener("change", toggleSearchButton);
  minPriceInput.addEventListener("input", updatePriceLabels);
  maxPriceInput.addEventListener("input", updatePriceLabels);
  minRatingInput.addEventListener("input", updateRatingLabels);
  maxRatingInput.addEventListener("input", updateRatingLabels);
  availability.addEventListener("input", toggleSearchButton);
  minCommissionInput.addEventListener("input", updateCommissionLabels);
  maxCommissionInput.addEventListener("input", updateCommissionLabels);
});