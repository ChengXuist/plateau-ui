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
            <button @click="setDrawingMode(true)" class="btn btn-outline-secondary me-2">
                <i class="fas fa-paint-brush"></i>
            </button>
            <button @click="setDrawingMode(false)" class="btn btn-outline-secondary me-2">
                <i class="fas fa-eraser"></i>
            </button>
            <button @click="clearCanvas" class="btn btn-outline-secondary">
                <i class="fas fa-trash-alt"></i>
            </button>
            <button @click="saveCanvas" class="btn btn-outline-secondary">
                <i class="fas fa-save"></i>
            </button>
        </div>

        <canvas ref="editorCanvas" class="editor-canvas" width="100%" height="auto" @mousedown="beginDrawing" @mousemove="keepDrawing" @mouseup="stopDrawing" @wheel="zoomCanvas"></canvas>
        <!-- <vue-drawing-canvas ref="VueCanvasDrawing" v-model:image="image" :canvasId="myCanvas" :width="canvasWidth" :height="400" :stroke-type="strokeType" :line-cap="lineCap" :line-join="lineJoin" :fill-shape="fillShape" :eraser="eraser" :lineWidth="line" :color="color" :background-color="backgroundColor" :background-image="backgroundImage" :watermark="watermark" :initial-image="initialImage" saveAs="png" :styles="{
            border: 'solid 1px #000',
          }" :lock="disabled" @mousemove="getCoordinate($event)" @wheel="handleScroll" :additional-images="additionalImages" /> -->
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
// import VueDrawingCanvas from "vue-drawing-canvas";
// import config from "@/assets/configuration/map-configuration.json"; // Import configuration
export default {
    // components: {
    //     VueDrawingCanvas,
    // },
    data() {
        return {
            selectedMode: 'obstacle-editor', // Default mode
            isDrawing: false,
            canvasWidth: 400,
            backgroundImage: './maps/first_map.png',
            scaleRate: 1.0,

        };
    },
    methods: {
        setDrawingMode(mode) {
            this.isDrawing = mode;
        },
        // startDrawing(event) {
        //     this.isDrawing = true;
        //     // this.draw(event); // Call draw once to start drawing immediately
        //     this.isDrawing = true; // Start drawing
        //     this.lastX = event.offsetX; // Get the mouse position
        //     this.lastY = event.offsetY;
        // },
        // stopDrawing() {
        //     this.isDrawing = false;
        //     const ctx = this.$refs.editorCanvas.getContext('2d');
        //     ctx.beginPath(); // Reset the current drawing path
        // },
        // handleScroll(event) {
        //     const delta = event.deltaY; // Positive or negative value
        //     if (delta > 0) {
        //         // Scrolling down, decrease canvas width
        //         if (this.canvasWidth > 100) {
        //             this.canvasWidth -= 10; // Decrease width by 10px
        //         }
        //     } else {
        //         // Scrolling up, increase canvas width
        //         this.canvasWidth += 10; // Increase width by 10px
        //     }
        //     this.$refs.VueCanvasDrawing.redraw();
        // },
        // draw(event) {
        //     event;
        //     if (!this.isDrawing) return;

        //     const canvas = this.$refs.editorCanvas;
        //     const ctx = canvas.getContext('2d');
        //     const rect = canvas.getBoundingClientRect();
        //     const x = event.clientX - rect.left;
        //     const y = event.clientY - rect.top;

        //     console.log("event.clientX: ", event.clientX);
        //     console.log("event.clientY: ", event.clientY);

        //     ctx.fillStyle = this.drawingMode === 'draw' ? 'black' : 'white'; // Adjust colors as needed
        //     ctx.strokeStyle = this.drawingMode === 'draw' ? 'black' : 'white';
        //     ctx.lineWidth = 1; // Adjust line width as needed

        //     ctx.lineTo(x, y);
        //     ctx.stroke();
        //     ctx.beginPath();
        //     ctx.moveTo(x, y);

        //     //         const canvasZoom = canvas.getZoom();
        //     //         if (!this.isDrawing) return; // If not drawing, do nothing

        //     //  // Get the canvas element using the ref we added earlier

        //     //         console.log("event.clientX: ", (event.clientX - rectLeft)* canvasZoom);
        //     //         // console.log("rect.offsetLeft: ", rectLeft);
        //     //         console.log("event.clientY: ", event.clientY - rect.top);
        //     //         // console.log("rect.top: ", rect.top);
        //     // // Start drawing a line
        //     // ctx.beginPath();
        //     // ctx.moveTo(50, 50);  // Starting point (x, y)
        //     // ctx.lineTo(100, 100); // Ending point (x, y)
        //     // ctx.strokeStyle = 'blue'; // Set line color
        //     // ctx.lineWidth = 2; // Set line width
        //     // ctx.stroke(); // Draw the line
        // },

        getCoordinate(event) {
            let coordinates = this.$refs.VueCanvasDrawing.getCoordinates(event);
            this.x = coordinates.x;
            this.y = coordinates.y;
        },

        clearCanvas() {
            const ctx = this.$refs.editorCanvas.getContext('2d');
            ctx.clearRect(0, 0, this.$refs.editorCanvas.width, this.$refs.editorCanvas.height);
        },
        saveCanvas() {

            const canvas = this.$refs.editorCanvas;
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
        loadEditorImage() {
            const canvas = this.$refs.editorCanvas;
            const ctx = canvas.getContext("2d");
            const img = new Image();

            img.onload = () => {
                // Set canvas size based on the image size
                canvas.width = img.width;
                canvas.height = img.height;

                ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
                ctx.scale(this.scaleRate, this.scaleRate);
                ctx.drawImage(img, 0, 0); // Draw the image at the center
            };

            img.src = './maps/first_map.png'; // Provide the image path here
        },

        drawLine(x1, y1, x2, y2) {
            let ctx = this.$refs.editorCanvas.getContext('2d');
            ctx.beginPath();
            ctx.strokeStyle = this.isDrawing ? 'white' : 'black';
            ctx.lineWidth = 2;
            ctx.moveTo(x1/this.scaleRate, y1/this.scaleRate);
            ctx.lineTo(x2/this.scaleRate, y2/this.scaleRate);
            ctx.stroke();
            ctx.closePath();
        },
        beginDrawing(e) {
            this.x = e.offsetX;
            this.y = e.offsetY;
            this.isDrawing = true;
        },
        keepDrawing(e) {
            if (this.isDrawing === true) {
                this.drawLine(this.x, this.y, e.offsetX, e.offsetY);
                this.x = e.offsetX;
                this.y = e.offsetY;
            }
        },
        stopDrawing(e) {
            if (this.isDrawing === true) {
                this.drawLine(this.x, this.y, e.offsetX, e.offsetY);
                this.x = 0;
                this.y = 0;
                this.isDrawing = false;
            }
        },
        zoomCanvas(event) {
            event.preventDefault();

            // Adjust the scale (zoom level) based on scroll direction
            const zoomFactor = 0.1;
            if (event.deltaY > 0.5) {
                // Zoom out
                this.scaleRate = Math.max(0.5, this.scaleRate - zoomFactor);
            } else {
                // Zoom in
                this.scaleRate = Math.min(3, this.scaleRate + zoomFactor);
            }

            this.loadEditorImage();
        },

    },
    mounted() {
        this.loadEditorImage();

    }
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

.editor-canvas {
    border: 1px solid #ccc;

}

.image-canvas {
    border: 1px solid #ccc;
    width: 100%;
    height: auto;
    width: 600px;
    height: 400px;
    /* Allow it to adjust based on image dimensions */
}
</style>
