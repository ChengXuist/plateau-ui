<template>
<div class="container">
    <!-- Title at the top -->
    <h1 class="title">{{ $t('mapEditor') }}</h1>

    <!-- Toggle between Mapping and Map Selection -->
    <div class="toggle-container">
        <button class="toggle-button" :class="{ active: selectedMode === 'obstacle-editor' }" @click="selectedMode = 'obstacle-editor'">
            {{ $t('obstacleEditor') }}
        </button>
        <button class="toggle-button" :class="{ active: selectedMode === 'path-editor' }" @click="selectedMode = 'path-editor'">
            {{ $t('pathEditor') }}
        </button>
    </div>

    <!-- Obstacle Editor -->
    <div v-if="selectedMode === 'obstacle-editor'" class="mapping-options">
        <div class="drawing-tools mb-3">
            <button @click="setDrawingMode('draw')" class="btn btn-outline-secondary me-2">
                <i class="fas fa-paint-brush"></i>
            </button>
            <button @click="setDrawingMode('erase')" class="btn btn-outline-secondary me-2">
                <i class="fas fa-eraser"></i>
            </button>
            <button @click="clearCanvas" class="btn btn-outline-secondary">
                <i class="fas fa-trash-alt"></i>
            </button>
            <button @click="saveCanvas" class="btn btn-outline-secondary">
                <i class="fas fa-save"></i>
            </button>
        </div>

        <canvas ref="canvas" class="drawing-canvas" @mousedown="startDrawing" @mouseup="stopDrawing" @mousemove="draw"></canvas>
    </div>
    <!-- Path Editor -->
    <div v-else-if="selectedMode === 'path-editor'" class="photo-browser">
        <h2>{{ $t('imageEditor') }}</h2>
        <!-- Implement image upload and editing here -->
        <input type="file" @change="loadImage" accept="image/*" />
        <canvas ref="imageCanvas" class="image-canvas"></canvas>
    </div>
</div>
</template>

<script>
// import config from "@/assets/configuration/map-configuration.json"; // Import configuration
export default {
    data() {
        return {
            selectedMode: 'obstacle-editor', // Default mode
            isDrawing: false,
            drawingMode: 'draw', // or 'erase'
        };
    },
    methods: {
        setDrawingMode(mode) {
            this.drawingMode = mode;
        },
        startDrawing(event) {
            this.isDrawing = true;
            this.draw(event); // Call draw once to start drawing immediately
        },
        stopDrawing() {
            this.isDrawing = false;
            const ctx = this.$refs.canvas.getContext('2d');
            ctx.beginPath(); // Reset the current drawing path
        },
        draw(event) {
            if (!this.isDrawing) return;

            const canvas = this.$refs.canvas;
            const ctx = canvas.getContext('2d');
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            ctx.fillStyle = this.drawingMode === 'draw' ? 'black' : 'white'; // Adjust colors as needed
            ctx.strokeStyle = this.drawingMode === 'draw' ? 'black' : 'white';
            ctx.lineWidth = 5; // Adjust line width as needed

            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y);
        },
        clearCanvas() {
            const ctx = this.$refs.canvas.getContext('2d');
            ctx.clearRect(0, 0, this.$refs.canvas.width, this.$refs.canvas.height);
        },
        saveCanvas() {
            const canvas = this.$refs.canvas;
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png'); // Specify the format you want (PNG)
            link.download = 'drawing.png'; // Default name for the downloaded file

            // Simulate a click to trigger the download
            link.click();
        },
        loadImage(event) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.src = "./maps/first_map.png";
                img.onload = () => {
                    const canvas = this.$refs.imageCanvas;
                    const ctx = canvas.getContext('2d');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                };
                img.src = e.target.result;
            };
            if (file) {
                reader.readAsDataURL(file);
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

.drawing-tools {
    margin-bottom: 10px;
    margin-right: 10px;
}

.drawing-canvas {
    border: 1px solid #ccc;
    width: 100%;
    height: 400px;
}

.image-canvas {
    border: 1px solid #ccc;
    width: 100%;
    height: auto;
    /* Allow it to adjust based on image dimensions */
}
</style>
