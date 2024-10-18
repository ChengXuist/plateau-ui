<template>
    <div class="container">
        <!-- Title at the top -->
        <h1 class="title">{{ $t('mapEditor') }}</h1>

        <!-- Toggle between Mapping and Map Selection -->
        <div class="toggle-container">
            <button class="toggle-button" :class="['toggle-button', { active: activeTab === 'obstacle-editor' }]"
                @click="activeTab = 'obstacle-editor'">
                {{ $t('obstacleEditor') }}
            </button>
            <button class="toggle-button" :class="['toggle-button', { active: activeTab === 'station-editor' }]"
                @click="activeTab = 'station-editor'">
                {{ $t('stationEditor') }}
            </button>
        </div>

        <!-- Obstacle Editor -->
        <div v-show="activeTab === 'obstacle-editor'" ref="obstacleEditorOptions" class="mapping-options">
            <div class="drawing-tools mb-3">
                <button @click="setPanningMode(true)" class="btn blue-button btn-outline-secondary me-2">
                    <i class="fas fa-hand"></i>
                </button>
                <button @click="setDrawlineMode()" class="btn blue-button btn-outline-secondary me-2">
                    <i class="fas fa-paint-brush"></i>
                </button>
                <button @click="setEraserMode(true)" class="btn blue-button btn-outline-secondary me-2">
                    <i class="fas fa-eraser gray-eraser"></i>
                </button>
                <button @click="setEraserMode(false)" class="btn blue-button btn-outline-secondary me-2">
                    <i class="fas fa-eraser"></i>
                </button>
                <button @click="zoom(true)" class="btn blue-button btn-outline-secondary">
                    <i class="fas fa-plus"></i>
                </button>
                <button @click="zoom(false)" class="btn blue-button btn-outline-secondary">
                    <i class="fas fa-minus"></i>
                </button>
                <button @click="undo" class="btn blue-button btn-outline-secondary">
                    <i class="fas fa-rotate-left"></i>
                </button>
                <button @click="clearCanvas(true)" class="btn blue-button btn-outline-secondary">
                    <i class="fas fa-trash-alt"></i>
                </button>
                <button @click="saveCanvas" class="btn blue-button btn-outline-secondary">
                    <i class="fas fa-save"></i>
                </button>
            </div>
            <div v-if="showEraserPopup" class="eraser-popup">
                <div class="slider-wrapper">
                    <label class="slider-label">Min</label>
                    <input type="range" id="eraserSize" v-model="eraserSize" min="1" max="15" @input="applyScaling" />
                    <label class="slider-label">Max</label>
                </div>
                <div class="popup-buttons">
                    <button @click="confirmEraserSize" class="btn btn-primary popup-button">Confirm</button>
                    <button @click="cancelEraserSize" class="btn btn-secondary popup-button">Cancel</button>
                </div>
            </div>
            <canvas ref="editorCanvas" class="obstacle-editor-canvas" width="100%" height="100%" @mousedown="onMousedown"
                @mousemove="onMouseMove" @mouseup="onMouseUp" @touchstart="onTouchStart" @touchmove="onTouchMove"
                @touchend="onTouchEnd"></canvas>
        </div>
        <div v-show="activeTab === 'station-editor'" class="mapping-options" ref="stationEditorOption">
            <div class="drawing-tools mb-3">
                <button @click="setStationPanningMode(true)" class="btn blue-button btn-outline-secondary me-2">
                    <i class="fas fa-hand"></i>
                </button>
                <button @click="addStation()" class="btn blue-button btn-outline-secondary me-2">
                    <i class="fas fa-circle-chevron-up"></i>
                </button>
                <button @click="zoomStationCanvas(true)" class="btn blue-button btn-outline-secondary me-2">
                    <i class="fas fa-plus"></i>
                </button>
                <button @click="zoomStationCanvas(false)" class="btn blue-button btn-outline-secondary me-2">
                    <i class="fas fa-minus"></i>
                </button>
                <button @click="autoFit" class="btn blue-button btn-outline-secondary me-2">
                    <i class="fas fa-expand"></i>
                </button>
                <button @click="saveStations" class="btn blue-button btn-outline-secondary me-2">
                    <i class="fas fa-save"></i>
                </button>
            </div>
            <canvas id="station-editor-canvas" ref="stationEditorCanvas" class="station-editor-canvas" width="100%"
                height="100%" @mousedown="onStationMousedown"></canvas>
        </div>
        <div v-if="showPopup" class="setStationPopup">
            <label>{{ $t('editRobotProperty') }}</label>
            <button @click="closePopup" class="close-button">&times;</button>
            <div>
                <label for="stationName">{{ $t('stationName') }}&nbsp;:</label>
                <input v-model="selectedStationName" id="stationName" type="text" class="form-control"
                    @focus="openKeyboard" />
            </div>
            <div v-if="usedNameWarningMessage">
                <label for="usedNameWarningMessage" class="text-danger">{{ usedNameWarningMessage }}</label>
            </div>
            <div>
                <label for="angle">{{ $t('angle') }}:&nbsp;{{ selectedStation.angle }}&nbsp;&nbsp;</label>
            </div>
            <div class="controls">
                <button @click="rotateStation('left')" class="btn btn-outline-secondary">
                    <i class="fas fa-rotate-left"></i>
                </button>
                <button @click="rotateStation('right')" class="btn btn-outline-secondary">
                    <i class="fas fa-rotate-right"></i>
                </button>
                <button @click="confirmStation" class="btn btn-outline-secondary">Confirm</button>
                <button @click="removeStation" class="btn btn-outline-secondary">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
            <div class="action-buttons"></div>
        </div>

    </div>
    <VirtualKeyboard @key-press="handleKeyPress" ref="keyboard" />
</template>

<script>
import obstacleEditor from '@/script/MapEdit/obstacleEditor.js';
import stationEditor from '@/script/MapEdit/stationEditor.js';

export default {
    name: 'MapEdit',
    mixins: [obstacleEditor, stationEditor], // Use mixins to integrate the logic
};
</script>

<style scoped>
.keyboard {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #f9f9f9;
    background-color: #cccccc;
    border-top: 1px solid #ccc;
    z-index: 100;
    /* Ensure it's on top of other elements */
    padding: 10px;
}

.slider-label {
    margin: 0 10px;
    font-size: 1.5em;
}

.keyboard .keyboard-row {
    display: flex;
    justify-content: space-around;
    margin-bottom: 10px;
}

.keyboard button {
    padding: 10px;
    font-size: 1.2em;
}

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
    outline: none;
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


.gray-eraser {
    color: #cccccc;
}

.obstacle-editor-canvas {
    border: 1px solid #ccc;
    width: 100%;
    height: 100%;
}


.mapping-options {
    display: flex;
    flex-direction: column;
    /* Stack tools and canvas vertically */
    align-items: center;
    /* Center the canvas horizontally */
    width: 100%;
    height: 100%;
}

.station-editor-canvas {
    border: 1px solid #ccc;
    width: 90%;
    max-height: 100%;
}

.setStationPopup {
    position: absolute;
    top: 3%;
    left: 50%;
    /* Align to the center of the screen */
    transform: translateX(-50%);
    /* Move it back by half of its own width for perfect centering */
    background-color: white;
    padding: 20px;
    border: 1px solid #ccc;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 100;
    width: 350px;
}

.controls {
    margin: 10px 0;
}

.controls button {
    margin-right: 10px;
}

.popup-button {
    font-size: 1.2em;
}

.eraser-popup {
    position: absolute;
    margin-top: 40px;
    padding: 15px;
    background-color: #f0f0f0;
    border: 1px solid #ccc;
    border-radius: 5px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    z-index: 1000;
}

.eraser-size-range {
    width: 150px;
    /* Set the desired width for the range input */
    display: block;
    margin: 10px 0;
}


.action-buttons {
    display: flex;
    justify-content: space-between;
    margin-top: 15px;
}

.close-button {
    position: absolute;
    top: 10px;
    /* Adjust for vertical positioning */
    right: 10px;
    /* Adjust for horizontal positioning */
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: red;
    font-weight: bold;
}

.close-button:hover {
    color: darkred;
}

.text-danger {
    color: red;
    /* Or any other style you prefer */
    font-weight: bold;
    /* Optional */
}

.blue-button {
    background-color: #23648a;
    color: white;
    border-color: #23648a;
    border-radius: 6px;
    width: 50px;
}

.setStationPopup label {
    font-size: 1.25rem;
}
</style>
