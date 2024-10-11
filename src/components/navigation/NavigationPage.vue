<template>
<div class="container">
    <!-- Title at the top -->
    <h1 class="title">{{ $t('navigation') }}</h1>

    <!-- Action buttons -->
    <div class="button-container">
        <button class="action-button" @click="moveTo">{{ $t('moveTo') }}</button>
        <button class="action-button" @click="backToHome">{{ $t('backToHome') }}</button>
    </div>

    <!-- Canvas to display the image -->
    <div class="map-container">
        <canvas ref="imageCanvas" @click="getCanvasCoordinates"></canvas>
    </div>

    <!-- Popup for coordinates -->
    <div v-if="showPopup" class="popup" :style="{ top: popupY + 'px', left: popupX + 'px' }">
        <p>Coordinates on canvas:</p>
        <p>X: {{ canvasX }}, Y: {{ canvasY }}</p>
        <button @click="closePopup">Close</button>
    </div>
</div>
</template>

<script>
export default {
    name: "NavigationPage",
    data() {
        return {
            showPopup: false, // Controls the visibility of the popup
            canvasX: 0, // Stores the X coordinate on the canvas
            canvasY: 0, // Stores the Y coordinate on the canvas
            popupX: 0, // X position of the popup on the screen
            popupY: 0 // Y position of the popup on the screen
        };
    },
    methods: {
        moveTo() {
            // Add your logic for "Move To" action here
            alert("Move to action triggered!");
        },
        backToHome() {
            // Logic for navigating back to home, e.g., using Vue Router
            this.$router.push({
                name: 'home'
            });
        },
        loadImage(imagePath) {
            const canvas = this.$refs.imageCanvas;
            const ctx = canvas.getContext("2d");
            const img = new Image();

            img.onload = () => {
                // Set canvas size based on the image size
                canvas.width = img.width;
                canvas.height = img.height;

                ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
                ctx.drawImage(img, 0, 0); // Draw the image at the center
            };

            img.src = imagePath; // Provide the image path here
        },
        getCanvasCoordinates(event) {
            const canvas = this.$refs.imageCanvas;
            const rect = canvas.getBoundingClientRect();

            // Get the click coordinates relative to the canvas
            this.canvasX = event.clientX - rect.left;
            this.canvasY = event.clientY - rect.top;

            // Set popup position (relative to window)
            this.popupX = event.clientX;
            this.popupY = event.clientY;

            // Show the popup
            this.showPopup = true;
        },
        closePopup() {
            this.showPopup = false;
        }
    },
    mounted() {
        // Call the loadImage method with the desired image path when the component is mounted
        const imagePath = './maps/first_map.png'; // Replace with your image path
        this.loadImage(imagePath);
        
    },

};
</script>

<style scoped>
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

.map-container {
    position: relative;
    width: 100%;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
}

canvas {
    display: block;
    /* Remove extra whitespace */
    width: 100%;
    height: 100%;
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

/* Title */
.title {
    font-size: 1.7rem;
    margin-bottom: 12px;
    color: #333;
}

/* Popup Styling */
.popup {
    position: absolute;
    background-color: white;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    z-index: 100;
}

.popup button {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 5px 10px;
    margin-top: 10px;
    cursor: pointer;
    border-radius: 3px;
}

.popup button:hover {
    background-color: #0056b3;
}
</style>
