document.addEventListener("DOMContentLoaded", () => {
  const allTags = [
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

  let availableTags = [...allTags];
  let selectedTags = [];

  const tagDropdown = document.getElementById('tag-dropdown');
  const addTagButton = document.getElementById('add-tag-button');
  const selectedTagsDiv = document.getElementById('selected-tags');
  const tagsHiddenInput = document.getElementById('tags-hidden');

  function populateDropdown() {
    tagDropdown.innerHTML = '<option value="" disabled selected>Select a tag</option>';
    availableTags.forEach(tag => {
      const option = document.createElement('option');
      option.value = tag;
      option.textContent = tag;
      tagDropdown.appendChild(option);
    });
  }

  function renderSelectedTags() {
    selectedTagsDiv.innerHTML = '';
    selectedTags.forEach(tag => {
      const tagElem = document.createElement('span');
      tagElem.className = 'selected-tag';
      tagElem.textContent = tag + ' ';
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.textContent = '✕';
      removeBtn.onclick = () => removeTag(tag);
      tagElem.appendChild(removeBtn);
      selectedTagsDiv.appendChild(tagElem);
    });
    tagsHiddenInput.value = selectedTags.join(',');
  }

  addTagButton.onclick = function() {
    const selected = tagDropdown.value;
    if (selected && !selectedTags.includes(selected)) {
      selectedTags.push(selected);
      availableTags = availableTags.filter(tag => tag !== selected);
      populateDropdown();
      renderSelectedTags();
    }
  };

  function removeTag(tag) {
    selectedTags = selectedTags.filter(t => t !== tag);
    if (!availableTags.includes(tag)) {
      availableTags.push(tag);
      availableTags.sort();
    }
    populateDropdown();
    renderSelectedTags();
  }

  // Initial population
  populateDropdown();
  renderSelectedTags();
});