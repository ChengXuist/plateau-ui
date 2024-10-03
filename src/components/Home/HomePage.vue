<template>
  <div>
    <!-- Language Selection Dropdown -->
    <div class="language-menu" @click="toggleDropdown">
      <span class="selected-language">
        <img :src="getFlag(selectedLanguage)" alt="" class="flag-icon" />
        {{ selectedLanguage.toUpperCase() }}
      </span>
      <div v-if="dropdownVisible" class="dropdown">
        <div
          class="dropdown-item"
          v-for="lang in languages"
          :key="lang.code"
          @click="selectLanguage(lang.code)"
        >
          <img :src="getFlag(lang.code)" alt="" class="flag-icon" />
          {{ lang.name }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "HomePage",
  data() {
    return {
      selectedLanguage: 'en', // Default selected language
      dropdownVisible: false,
      languages: [
        { code: 'en', name: 'English' },
        { code: 'fr', name: 'French' },
        { code: 'es', name: 'Spanish' },
        { code: 'de', name: 'German' },
        { code: 'zh', name: 'Chinese' },
      ],
    };
  },
  methods: {
    toggleDropdown() {
      this.dropdownVisible = !this.dropdownVisible;
    },
    selectLanguage(langCode) {
      this.selectedLanguage = langCode;
      this.dropdownVisible = false; // Hide dropdown after selection
      // Here you can also trigger a language change in your i18n setup
    },
    getFlag(langCode) {
      return `./flags/${langCode}.svg`; // Adjust the path to your flag images
    },
    handleClickOutside(event) {
      // Check if the click is outside the dropdown
      const dropdown = this.$el.querySelector('.language-menu');
      if (!dropdown.contains(event.target)) {
        this.dropdownVisible = false; // Close the dropdown
      }
    },
  },
  mounted() {
    // Add event listener for clicks outside the dropdown
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeUnmount() {
    // Remove event listener when the component is destroyed
    document.removeEventListener('click', this.handleClickOutside);
  }
};
</script>

<style scoped>
.language-menu {
  position: relative;
  cursor: pointer;
}

.selected-language {
  display: flex;
  align-items: center;
}

.flag-icon {
  width: 20px; /* Adjust size as necessary */
  height: auto;
  margin-right: 5px; /* Space between flag and text */
}

.dropdown {
  position: absolute;
  background-color: white;
  border: 1px solid #ccc;
  z-index: 1000;
  width: 150px; /* Adjust width as necessary */
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 5px 10px;
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: #f0f0f0; /* Hover effect */
}
</style>
