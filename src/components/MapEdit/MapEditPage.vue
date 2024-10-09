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
    <div v-if="selectedMode === 'obstacle-editor'" ref="mappingOptions" class="mapping-options">
        <div class="drawing-tools mb-3">
            <button @click="setPanningMode(true)" class="btn btn-outline-secondary me-2">
                <i class="fas fa-hand"></i>
            </button>
            <button @click="setDrawingMode(true)" class="btn btn-outline-secondary me-2">
                <i class="fas fa-paint-brush"></i>
            </button>
            <button @click="setDrawingMode(false)" class="btn btn-outline-secondary me-2">
                <i class="fas fa-eraser"></i>
            </button>
            <button @click="zoomOut" class="btn btn-outline-secondary">
                <i class="fas fa-plus"></i>
            </button>
            <button @click="zoomIn" class="btn btn-outline-secondary">
                <i class="fas fa-minus"></i>
            </button>
            <button @mousedown="startLongPress" @touchstart="startLongPress" @touchend="cancelLongPress" @click="undo" class="btn btn-outline-secondary">
                <i class="fas fa-rotate-left"></i>
            </button>
            <button @click="clearCanvas" class="btn btn-outline-secondary">
                <i class="fas fa-trash-alt"></i>
            </button>
            <button @click="saveCanvas" class="btn btn-outline-secondary">
                <i class="fas fa-save"></i>
            </button>
        </div>
            <canvas ref="editorCanvas" class="editor-canvas" width="100%" height="100%" @mousedown="onMousedown" @mousemove="onMouseMove" @mouseup="onMouseUp" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd"></canvas>
    </div>
    <div v-else-if="selectedMode === 'path-editor'" class="photo-browser">
        <h2>{{ $t('imageEditor') }}</h2>
        <input type="file" @change="loadImage" accept="image/*" />
        <canvas ref="imageCanvas" class="image-canvas"></canvas>
    </div>
</div>
</template>

<script>
export default {
    data() {
        return {
            selectedMode: 'obstacle-editor', // Default mode
            isDrawing: false,
            isPanning: false,
            canvasWidth: 400,
            backgroundImage: './maps/first_map.png',
            scaleRate: 1.0,
            draw: true,

            panStartX: 0, // Starting X position of pan
            panStartY: 0, // Starting Y position of pan
            panX: 0, // Pan offset X
            panY: 0, // Pan offset Y

            isMouseDown: false,
            drawnLines: [],
            drawnLine: [],
            x: null,
            y: null,
            lineWidth: 3,
        };
    },
    methods: {
        setPanningMode(mode) {
            this.isPanning = mode;
            this.isDrawing = false;
        },
        setDrawingMode(mode) {
            this.draw = mode;
            this.isDrawing = true;
            this.isPanning = false;
        },
        getCoordinate(event) {
            let coordinates = this.$refs.VueCanvasDrawing.getCoordinates(event);
            this.x = coordinates.x;
            this.y = coordinates.y;
        },
        clearCanvas() {
            this.drawnLines = [];
            this.drawnLine = [];
            this.loadEditorImage();
        },
        startPanning(event) {
            this.isPanning = true;
            this.panStartX = event.offsetX - this.panX; // Track initial mouse position
            this.panStartY = event.offsetY - this.panY;
        },
        panMap(event) {
            if (this.isPanning) {
                this.panX = event.offsetX - this.panStartX;
                this.panY = event.offsetY - this.panStartY;
                this.loadEditorImage();
            }
        },
        onMousedown(event) {
            this.isMouseDown = true;
            if (this.isDrawing) {
                this.beginDrawing(event);
            } else {
                this.startPanning(event);
            }
        },
        onMouseMove(event) {
            if (this.isMouseDown) {
                if (this.isDrawing) {
                    this.keepDrawing(event)
                } else {
                    this.panMap(event);
                }
            }
        },
        onMouseUp() {
            if (!this.isPanning) {
                this.endDrawing();
            }
            this.isMouseDown = false;
        },
        // New touch event handlers
        onTouchStart(event) {
            event.preventDefault();
            if (event.touches.length === 1) { // Single touch for drawing or panning
                const touch = event.touches[0];
                const simulatedMouseEvent = this.createSimulatedMouseEvent(touch);
                this.onMousedown(simulatedMouseEvent);
            }
        },
        onTouchMove(event) {
            event.preventDefault();
            if (event.touches.length === 1) { // Single touch
                const touch = event.touches[0];
                const simulatedMouseEvent = this.createSimulatedMouseEvent(touch);
                this.onMouseMove(simulatedMouseEvent);
            }
        },
        onTouchEnd(event) {
            event.preventDefault();
            this.onMouseUp();
        },
        createSimulatedMouseEvent(touch) {
            const boundingRect = this.$refs.editorCanvas.getBoundingClientRect();
            return {
                offsetX: touch.clientX - boundingRect.left,
                offsetY: touch.clientY - boundingRect.top
            };
        },
        saveCanvas() {
            const canvas = this.$refs.editorCanvas;
            const ctx = canvas.getContext('2d');
            this.panX = 0;
            this.panY = 0;
            this.scaleRate = 0;

            const img = new Image();
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
                ctx.drawImage(img, 0, 0); // Draw the image at the center
                this.redrawLines();
                const link = document.createElement('a');
                link.href = canvas.toDataURL('image/png'); // Specify the format you want (PNG)
                link.download = 'first_map_user.png'; // Default name for the downloaded file
                link.click();
            };

            img.src = './maps/first_map.png'; // Provide the image path here
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
            const mappingOptionsW = this.$refs.mappingOptions.getBoundingClientRect().width;

            img.onload = () => {
                // Set canvas size based on the image size
                canvas.width = mappingOptionsW;
                canvas.height = img.height;

                ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
                ctx.scale(this.scaleRate, this.scaleRate);
                ctx.translate(this.panX, this.panY);
                ctx.drawImage(img, (canvas.width - img.width)/2, 0); // Draw the image at the center
                this.redrawLines();
            };

            img.src = './maps/first_map.png'; // Provide the image path here
        },
        drawLine(x1, y1, x2, y2) {
            let ctx = this.$refs.editorCanvas.getContext('2d');
            ctx.save();
            ctx.beginPath();
            ctx.strokeStyle = this.draw ? 'black' : 'white';
            ctx.lineWidth = this.lineWidth;
            ctx.moveTo(x1 / this.scaleRate - this.panX, y1 / this.scaleRate - this.panY);
            ctx.lineTo(x2 / this.scaleRate - this.panX, y2 / this.scaleRate - this.panY);
            ctx.stroke();
        },
        redrawLines() {
            let ctx = this.$refs.editorCanvas.getContext('2d');

            // Draw all stored lines
            this.drawnLines.forEach(strokes => {
                strokes.forEach(line => {
                    ctx.beginPath();
                    ctx.strokeStyle = line.color;
                    ctx.lineWidth = this.lineWidth;
                    ctx.moveTo(line.start.x, line.start.y);
                    ctx.lineTo(line.end.x, line.end.y);
                    ctx.stroke();
                })
            });
        },
        beginDrawing(e) {
            this.x = e.offsetX;
            this.y = e.offsetY;
            this.isDrawing = true;
        },
        keepDrawing(e) {
            if (this.isDrawing === true) {
                if ((this.x !== 0) && (this.y !== 0) && (e.offsetX !== 0) && (e.offsetY !== 0)) {
                    this.drawLine(this.x, this.y, e.offsetX, e.offsetY);
                    this.drawnLine.push({
                        color: this.draw ? 'black' : 'white',
                        start: {
                            x: this.x / this.scaleRate - this.panX,
                            y: this.y / this.scaleRate - this.panY
                        },
                        end: {
                            x: e.offsetX / this.scaleRate - this.panX,
                            y: e.offsetY / this.scaleRate - this.panY
                        }
                    });
                    this.x = e.offsetX;
                    this.y = e.offsetY;
                }
            }
        },
        endDrawing() {
            this.drawnLines.push(this.drawnLine)
            this.drawnLine = [];
        },
        zoomCanvas(event) {
            event.preventDefault();

            const zoomFactor = 0.1;
            if (event.deltaY > 0.5) {
                this.scaleRate = Math.max(0.5, this.scaleRate - zoomFactor);
            } else {
                this.scaleRate = Math.min(3, this.scaleRate + zoomFactor);
            }

            this.loadEditorImage();
        },
        zoomIn() {
            const zoomFactor = 0.1;
            this.scaleRate = Math.max(0.5, this.scaleRate - zoomFactor);

            this.loadEditorImage();
        },
        zoomOut() {
            const zoomFactor = 0.1;
            this.scaleRate = Math.min(3, this.scaleRate + zoomFactor);
            this.loadEditorImage();
        },

        undo() {
            if (this.drawnLines.length > 0) {
                this.drawnLines.pop(); // Remove the latest state
                this.redrawLines();
                this.loadEditorImage();
            }
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
    width: 100vw;
    background-color: white;
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
    max-width: 100%; /* Prevent overflow */
    max-height: 100%; /* Prevent overflow */
}

.image-canvas {
    border: 1px solid #ccc;
    width: 100%;
    height: auto;
    width: 600px;
    height: 400px;
    /* Allow it to adjust based on image dimensions */
}

.mapping-options {
    display: flex;
    flex-direction: column; /* Stack tools and canvas vertically */
    align-items: center; /* Center the canvas horizontally */
    width: 100%;
    height: 100%;
}
</style>
