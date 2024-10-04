<template>
<div class="container">
    <!-- Title at the top -->
    <h1 class="title">{{ $t('mapping') }}</h1>

    <!-- Toggle between Mapping and Map Selection -->
    <div class="toggle-container">
        <button class="toggle-button" :class="{ active: selectedMode === 'mapping' }" @click="selectedMode = 'mapping'">
            {{ $t('mapping') }}
        </button>
        <button class="toggle-button" :class="{ active: selectedMode === 'map-selection' }" @click="selectedMode = 'map-selection'">
            {{ $t('mapSelection') }}
        </button>
    </div>

    <!-- Mapping Options -->
    <div v-if="selectedMode === 'mapping'" class="mapping-options">
        <button class="action-button">{{ $t('newMapCreation') }}</button>
        <button class="action-button">{{ $t('continueMapping') }}</button>
    </div>

    <!-- Map Selection -->
    <div v-else-if="selectedMode === 'map-selection'" class="photo-browser">
        <div v-if="photos.length > 0">
            <button class="select-map-button" @click="openFileDialog">
                {{ $t('selectMap') }}
            </button>
            <input type="file" ref="fileInput" accept="image/*" style="display: none" @change="handleFileSelect" />
            <div v-for="(photo, index) in photos" :key="index" class="photo-item">
                <img :src="photo" alt="Map Image" class="map-image" />
            </div>
        </div>
        <div v-else>
            <p>No maps available for selection</p>
        </div>
    </div>
</div>
</template>

<script>
import config from "@/assets/configuration/map-configuration.json"; // Import configuration

export default {
    data() {
        return {
            selectedMode: 'mapping', // State for the current mode
            photos: [], // Array to hold selected images
            mapConfig: config // Load configuration from JSON
        };
    },
    mounted() {
        this.loadMapImages(); // Load initial map images on mount
    },
    methods: {
        // Load images from the initial configuration
        loadMapImages() {
            const availableMaps = [this.mapConfig.selectedMap]; // Use the path from the configuration
            this.photos = availableMaps; // Set the photos array
        },
        // Open the file dialog
        openFileDialog() {
            this.$refs.fileInput.click(); // Simulate click on hidden input
        },
        // Handle the selected file and update the displayed image
        handleFileSelect(event) {
            const file = event.target.files[0]; // Get the selected file
            if (file) {
                const reader = new FileReader(); // Create a new FileReader instance
                reader.onload = (e) => {
                    // Update photos array with selected image
                    this.photos = [e.target.result];

                    // Update the configuration with the new file name
                    this.mapConfig.selectedMap = file.name; // Optionally, update the path or filename here
                    console.log("Updated configuration:", this.mapConfig); // Log the updated configuration
                };
                reader.readAsDataURL(file); // Read the file as a data URL
            }
        },
    },
};
</script>

<style scoped>
/* Container for the entire page */
.container {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    height: 100vh;
    background-color: white;
    /* Set background to white */
    padding: 20px;
}

/* Title */
.title {
    font-size: 1.7rem;
    margin-bottom: 12px;
    color: #333;
}

/* Toggle button container */
.toggle-container {
    display: flex;
    justify-content: flex-start;
    /* Align buttons to the left */
    margin-bottom: 5px;
    background-color: #f0f0f0;
    border-radius: 8px;
    padding: 1px;
    width: fit-content;
}

/* Toggle buttons for Mapping and Map Selection */
.toggle-button {
    background-color: #f0f0f0;
    color: black;
    border: none;
    padding: 5px 20px;
    margin: 5px;
    border-radius: 8px;
    cursor: pointer;
}

.toggle-button.active {
    background-color: white;
    color: black;
    border: 2px solid white;
}

/* Buttons for New Map Creation and Continue Mapping */
.action-button {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 10px 10px;
    margin: 5px;
    border-radius: 8px;
    cursor: pointer;
    width: 200px;
}

/* Grid for photo browser */
.photo-browser {
    display: flex;
    justify-content: center;
    align-items: center;
}

.photo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    width: 100vh;
}

/* Image container */
.photo-item {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f0f0f0;
    width: 75vh;
    overflow: hidden;
}

/* Image styling to fit proportionally */
.map-image {
    width: 75vh;
    height: 75vh;
    object-fit: contain;
    /* Ensure the image fits within the container without being distorted */
}

/* Button for selecting a new map */
.select-map-button {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 10px 10px;
    margin: 5px;
    border-radius: 8px;
    cursor: pointer;
    width: 200px;
}
</style>
