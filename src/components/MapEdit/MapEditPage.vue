<template>
<div class="container">
    <!-- Title at the top -->
    <h1 class="title">{{ $t('mapEditor') }}</h1>

    <!-- Toggle between Mapping and Map Selection -->
    <div class="toggle-container">
        <button class="toggle-button" :class="['toggle-button', { active: activeTab === 'obstacle-editor' }]" @click="activeTab = 'obstacle-editor'">
            {{ $t('obstacleEditor') }}
        </button>
        <button class="toggle-button" :class="['toggle-button', { active: activeTab === 'station-editor' }]" @click="activateStationEditor">
            {{ $t('stationEditor') }}
        </button>
    </div>

    <!-- Obstacle Editor -->
    <div v-show="activeTab === 'obstacle-editor'" ref="obstacleEditorOptions" class="mapping-options">
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
            <button @click="zoom(false)" class="btn btn-outline-secondary">
                <i class="fas fa-plus"></i>
            </button>
            <button @click="zoom(true)" class="btn btn-outline-secondary">
                <i class="fas fa-minus"></i>
            </button>
            <button @click="undo" class="btn btn-outline-secondary">
                <i class="fas fa-rotate-left"></i>
            </button>
            <button @click="clearCanvas" class="btn btn-outline-secondary">
                <i class="fas fa-trash-alt"></i>
            </button>
            <button @click="saveCanvas" class="btn btn-outline-secondary">
                <i class="fas fa-save"></i>
            </button>
        </div>
        <canvas ref="editorCanvas" class="obstacle-editor-canvas" width="100%" height="100%" @mousedown="onMousedown" @mousemove="onMouseMove" @mouseup="onMouseUp" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd"></canvas>
    </div>

    <div v-show="activeTab === 'station-editor'" class="mapping-options" ref="stationEditorOption">
        <div class="drawing-tools mb-3">
            <button @click="setStationPanningMode(true)" class="btn btn-outline-secondary me-2">
                <i class="fas fa-hand"></i>
            </button>
            <button @click="addStation()" class="btn btn-outline-secondary me-2">
                <i class="fas fa-circle-chevron-up"></i>
            </button>
            <button @click="zoomStationCanvas(true)" class="btn btn-outline-secondary">
                <i class="fas fa-plus"></i>
            </button>
            <button @click="zoomStationCanvas(false)" class="btn btn-outline-secondary">
                <i class="fas fa-minus"></i>
            </button>
            <button @click="saveStations" class="btn btn-outline-secondary">
                <i class="fas fa-save"></i>
            </button>
        </div>
        <canvas id="station-editor-canvas" ref="stationEditorCanvas" class="station-editor-canvas" width="100%" height="100%" @mousedown="onStationMousedown"></canvas>
    </div>
    <div v-if="showPopup" class="setStationPopup" :style="{ top: stationSettingPopupY + 'px', left: stationSettingPopupX + 'px' }">
        {{ $t('editRobotProperty') }}
        <button @click="closePopup" class="close-button">&times;</button>
        <label for="angle">{{ $t('angle') }}:&nbsp;{{ selectedStation.angle }}&nbsp;&nbsp;</label>
        <label for="left">{{ $t('left') }} (X):&nbsp;{{ selectedStation.left }}&nbsp;&nbsp;</label>
        <label for="top">{{ $t('top') }} (Y):&nbsp;{{ selectedStation.left }}&nbsp;&nbsp;</label>
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
        <div class="action-buttons">
        </div>
    </div>
</div>
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

.obstacle-editor-canvas {
    border: 1px solid #ccc;
    max-width: 100%;
    max-height: 100%;
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
    max-width: 100%;
    max-height: 100%;
}

.setStationPopup {
    background-color: lightgray;
    padding: 20px;
    border-radius: 5px;
    width: 300px;
    position: absolute;
    z-index: 100;
}

.controls {
    margin: 10px 0;
}

.controls button {
    margin-right: 10px;
}

.action-buttons {
    display: flex;
    justify-content: space-between;
    margin-top: 15px;
}

.close-button {
    position: absolute;
  top: 10px;    /* Adjust for vertical positioning */
  right: 10px;  /* Adjust for horizontal positioning */
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
</style>
