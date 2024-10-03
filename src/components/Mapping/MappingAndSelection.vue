<template>
    <div class="container">
      <!-- Title at the top -->
      <h1 class="title">{{ $t('mapping') }}</h1>
  
      <!-- Toggle between Mapping and Map Selection -->
      <div class="toggle-container">
        <button
          class="toggle-button"
          :class="{ active: selectedMode === 'mapping' }"
          @click="selectedMode = 'mapping'"
        >
          {{ $t('mapping') }}
        </button>
        <button
          class="toggle-button"
          :class="{ active: selectedMode === 'map-selection' }"
          @click="selectedMode = 'map-selection'"
        >
          {{ $t('mapSelection') }}
        </button>
      </div>
  
      <!-- Content for Mapping -->
      <div v-if="selectedMode === 'mapping'" class="mapping-options">
        <button class="action-button">{{ $t('newMapCreation') }}</button>
        <button class="action-button">{{ $t('continueMapping') }}</button>
      </div>
  
      <!-- Content for Map Selection -->
      <div v-else-if="selectedMode === 'map-selection'" class="photo-browser">
        <div class="photos">
          <div class="photo" v-for="photo in photos" :key="photo.id">
            <img :src="photo.url" alt="Map Photo" />
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'MappingAndSelection',
    data() {
      return {
        selectedMode: 'mapping', // Default to mapping
        photos: [
          { id: 1, url: 'photo1.jpg' },
          { id: 2, url: 'photo2.jpg' },
          { id: 3, url: 'photo3.jpg' },
          // Add more photos here
        ],
      };
    },
  };
  </script>
  
  <style scoped>
  /* Container for the entire page */
  .container {
    display: flex;
    flex-direction: column;
    justify-content: flex-start; /* Align content at the top */
    align-items: flex-start;
    height: 100vh;
    background-color: white; /* Set the background to white */
    padding: 20px;
    width: 100vh;
  }
  
  /* Title */
  .title {
    font-size: 2rem;
    margin-bottom: 20px;
    color: #333;
  }
  
  /* Toggle button container */
  .toggle-container {
    display: flex;
    justify-content: flex-start; /* Align buttons to the left */
    margin-bottom: 20px;
    background-color: #f0f0f0;
    border-radius: 8px;
    padding: 1px;
    width: fit-content;
  }
  
  /* Toggle buttons for Mapping and Map Selection */
  .toggle-button {
    background-color: #f0f0f0; /* Light gray for unselected state */
    color: black;
    border: none;
    padding: 10px 20px;
    margin: 5px;
    border-radius: 8px;
    cursor: pointer;
  }
  
  .toggle-button.active {
    background-color: white; /* White for selected state */
    color: black;
    border: 2px solid white; /* Optional: add a border for the selected button */
  }
  
  /* Buttons for New Map Creation and Continue Mapping */
  .action-button {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 10px 20px;
    margin: 10px;
    border-radius: 8px;
    cursor: pointer;
    width: 200px;
  }
  
  /* Photo browser grid */
  .photo-browser {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
    height: 50vh; /* Half the screen height */
  }
  
  .photos {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start; /* Align photos to the left */
  }
  
  .photo {
    width: 45%; /* Adjust the size to fit half the screen width */
    margin: 10px;
    background-color: #ddd;
  }
  
  .photo img {
    width: 100%;
    height: auto;
    border-radius: 8px;
  }
  </style>
  