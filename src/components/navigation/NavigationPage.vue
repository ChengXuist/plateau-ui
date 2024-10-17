<template>
<div class="container">
    <h1 class="title">{{ $t('navigation') }}</h1>
    <div class="button-container">
        <button class="action-button" @click="moveTo">{{ $t('moveTo') }}</button>
        <button class="action-button" @click="backToHome">{{ $t('backToHome') }}</button>
    </div>
    <canvas id="navigation-canvas" ref="navigation" class="navigation-canvas" width="100%" height="100%" @mousedown="onStationMousedown"></canvas>
</div>
</template>

<script>
import * as fabric from 'fabric';
const {
    ipcRenderer
} = window.require('electron');

export default {
    data() {
        return {
            fabricCanvasInstance: null,
            fabricImage: null,
            mapFile: 'first_map.png', // This can be dynamic
        };
    },
    mounted() {
        this.canvasWidth = this.$refs.navigation.getBoundingClientRect().width;
        this.canvasHeight = this.$refs.navigation.getBoundingClientRect().height;
        this.initCanvas();
    },

    methods: {

        initCanvas() {
            ipcRenderer.send('load-image-file', this.mapFile);
            ipcRenderer.on('image-file-data', (event, response) => {
                if (response.success) {
                    const base64Image = response.data;
                    const image = new Image();
                    image.src = `data:image/png;base64,${base64Image}`;
                    image.onload = () => {
                        this.imageOffset = (this.canvasWidth - image.width) / 2;
                        this.fabricImage = new fabric.FabricImage(image, {
                            left: this.imageOffset, // Horizontal offset
                        })
                        if (this.fabricCanvasInstance === null) {
                            this.fabricCanvasInstance = new fabric.Canvas(this.$refs.navigation, {
                                width: this.canvasWidth,
                                height: this.canvasHeight,
                                backgroundImage: this.fabricImage,
                            })
                        }
                        this.fabricCanvasInstance.requestRenderAll();
                    };
                } else {
                    console.error('Failed to load image:', response.error);
                }
            });
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
    height: 90vh;
    width: 79vw;
    background-color: white;
    padding: 20px;
}

/* Title */
.title {
    font-size: 1.7rem;
    margin-bottom: 12px;
    color: #333;
}

.navigation-canvas {
    height: 100%;
    width: 100%;
    border: 1px solid #ccc;
}
</style>
