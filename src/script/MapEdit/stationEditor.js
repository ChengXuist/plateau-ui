import * as fabric from 'fabric';
import stationData from '@/settings/stations.json'

export default {

    data() {
        return {
            tosetStation: false,
            stationCanvasX: 0,
            stationCanvasY: 0,

            fabricCanvasInstance: null,
            fabricImage: null,

            showPopup: false,
            stationProperties: {
                angle: 0,
                left: 0,
                top: 0
            },
            stationCounter: 0,

            stationSettingPopupY: null,
            stationSettingPopupX: null,

            popupOffSet: 50,
            stations: {},

            selectedStation: null,

            zoomLevel: 1, // Initial zoom level
            zoomStep: 0.1, // The amount to zoom in or out
            maxZoom: 3, // Max zoom level
            minZoom: 0.5, // Min zoom level

            isPanning: false, // Flag to track panning mode
            isPanningMouseDown: false, // Flag to track panning mode
            lastPosX: 0, // Store last mouse/touch positions
            lastPosY: 0,

            isMouse: false,
            imageOffset: 0,

        };
    },
    methods: {
        activateStationEditor() {
            this.activeTab = 'station-editor'; // Set active tab
            this.loadEditor(); // Replace with your actual function name
        },
        // Example additional function
        loadEditor() {
            // Add your custom logic here
            if (!this.fabricCanvasInstance) {
                this.$nextTick(() => {
                    this.initCanvas();
                });
            }
        },

        initCanvas() {
            const imageUrl = './maps/first_map.png'
            const image = new Image()
            image.src = imageUrl

            image.onload = () => {
                this.imageOffset = (this.$refs.stationEditorOption.getBoundingClientRect().width - image.width) / 2;
                this.fabricImage = new fabric.FabricImage(image, {
                    left: this.imageOffset, // Horizontal offset
                })
                this.fabricCanvasInstance = new fabric.Canvas(this.$refs.stationEditorCanvas, {
                    width: this.$refs.stationEditorOption.getBoundingClientRect().width,
                    height: this.$refs.stationEditorOption.getBoundingClientRect().height,
                    backgroundImage: this.fabricImage,
                })
                this.fabricCanvasInstance.renderAll()

                this.loadStations();
                this.setupCanvasPanning();
            }
        },
        loadStationMap() {
            const imageUrl = './maps/first_map.png'
            const image = new Image()
            image.src = imageUrl
            image.onload = () => {
                this.fabricImage = new fabric.FabricImage(image, {
                    left: this.imageOffset, // Horizontal offset
                })
                this.fabricCanvasInstance = new fabric.Canvas(this.$refs.stationEditorCanvas, {
                    width: this.$refs.stationEditorOption.getBoundingClientRect().width,
                    height: this.$refs.stationEditorOption.getBoundingClientRect().height,
                    backgroundImage: this.fabricImage,
                })
                this.loadStations();
                this.fabricCanvasInstance.renderAll()
            }
        },
        setStationPanningMode() {
            this.isPanning = true;
        },
        setupCanvasPanning() {
            // Handle mouse down event (start panning)
            this.fabricCanvasInstance.on('mouse:down', (opt) => {
                if (this.isPanning) {
                    this.isPanningMouseDown = true;

                    const evt = opt.e;
                    this.isMouse = (opt.e.type === "mousedown");
                    if (this.isMouse) {
                        this.lastPosX = evt.clientX;
                        this.lastPosY = evt.clientY;
                    } else {
                        this.lastPosX = evt.changedTouches[0].clientX;
                        this.lastPosY = evt.changedTouches[0].clientY;
                    }
                    this.fabricCanvasInstance.selection = false; // Disable object selection
                }
            });
            // Handle mouse move event (while dragging)
            this.fabricCanvasInstance.on('mouse:move', (opt) => {
                if (this.isPanning && opt.e && this.isPanningMouseDown === true) {
                    const evt = opt.e;
                    let x, y;
                    if (this.isMouse) {
                        x = evt.clientX;
                        y = evt.clientY;
                    } else {
                        x = evt.changedTouches[0].clientX;
                        y = evt.changedTouches[0].clientY;
                    }
                    const deltaX = x - this.lastPosX;
                    const deltaY = y - this.lastPosY;
                    // Pan the canvas by adjusting the viewportTransform
                    let vpt = this.fabricCanvasInstance.viewportTransform;
                    vpt[4] += deltaX;
                    vpt[5] += deltaY;
                    this.fabricCanvasInstance.requestRenderAll();

                    // Update last mouse position
                    this.lastPosX = x;
                    this.lastPosY = y;
                }
            });
            // Handle mouse up event (stop panning)
            this.fabricCanvasInstance.on('mouse:up', () => {
                this.isPanningMouseDown = false;
                this.fabricCanvasInstance.selection = true; // Re-enable object selection

                const activeObject = this.fabricCanvasInstance.getActiveObject();
                if (activeObject) {
                    this.isPanning = false;
                    // Open the popup and populate it with the active object's properties
                    this.selectedStation = activeObject;
                    this.stationProperties.angle = activeObject.angle;
                    this.stationProperties.left = activeObject.left;
                    this.stationProperties.top = activeObject.top;
                    this.stationSettingPopupY = activeObject.top - this.popupOffSet;
                    this.stationSettingPopupX = activeObject.left + this.popupOffSet;
                    this.showPopup = true;
                }
            });
        },
        rotateStation(direction) {
            let rotationAngle = (direction == "left") ? -5 : 5;
            const activeObject = this.fabricCanvasInstance.getActiveObject();
            if (activeObject) {
                activeObject.set('angle', activeObject.angle + rotationAngle).setCoords();
                this.fabricCanvasInstance.renderAll();
            }
        },
        zoomStationCanvas(isZoomIn) {
            if (isZoomIn) {
                if (this.zoomLevel < this.maxZoom) {
                    this.zoomLevel += this.zoomStep;
                    this.fabricCanvasInstance.setZoom(this.zoomLevel);
                }
            } else {
                if (this.zoomLevel > this.minZoom) {
                    this.zoomLevel -= this.zoomStep;
                    this.fabricCanvasInstance.setZoom(this.zoomLevel);
                }
            }
        },
        addStation() {
            this.isPanning = false;
            this.tosetStation = true;
            this.stationCounter += 1;
            let id = "station_" + this.stationCounter
            this.setStation(id, 30, 30, 0, 'black');
        },
        setStation(id, left, top, angle, color) {
            this.fabricCanvasInstance.add(
                new fabric.Circle({
                    id: id,
                    originX: "center",
                    originY: "center",
                    strokeWidth: 1,
                    left: left,
                    top: top,
                    selectable: true,
                    evented: true,
                    radius: 10,
                    angle: angle,
                    fill: color,
                })
            );
        },
        confirmStation() {
            this.stations[this.selectedStation.id] = {
                angle: this.selectedStation.angle,
                top: this.selectedStation.top,
                left: this.selectedStation.left
            };

            this.fabricCanvasInstance.getActiveObject().set('fill', 'blue');
            this.fabricCanvasInstance.renderAll();
            this.showPopup = false;
        },
        removeStation() {
            if (this.selectedStation) {
                this.fabricCanvasInstance.remove(this.selectedStation);
                this.fabricCanvasInstance.discardActiveObject(); // Clear selection
                this.fabricCanvasInstance.renderAll(); // Re-render canvas
                this.showPopup = false;
            }
        },
        saveStations() {
            const jsonString = JSON.stringify(this.stations, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob); // Specify the format you want (PNG)
            link.download = 'stations.json'; // Default name for the downloaded file
            link.click();
            // Clean up by removing the link and revoking the Object URL
            URL.revokeObjectURL(link.href);
        },
        closePopup() {
            this.showPopup = false;
        },
        onStationMousedown(event) {
            if (this.tosetStation) {
                const rect = this.$refs.stationEditorOption.getBoundingClientRect();
                this.stationCanvasX = event.clientX - rect.left;
                this.stationCanvasY = event.clientY - rect.top;
            }
        },
        loadStations() {
            for (const key in stationData) {
                this.stationCounter += 1;
                this.stations[key] = {
                    left: stationData[key].left, top: stationData[key].top, angle: stationData[key].angle
                }
                this.setStation(key, stationData[key].left, stationData[key].top, stationData[key].angle, 'blue');
            }
        },
    },
};