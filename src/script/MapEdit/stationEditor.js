import * as fabric from 'fabric';
const { ipcRenderer } = window.require('electron');

export default {
    data() {
        return {
            toSetStation: false,
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

            stationSettingPopupX: null,
            stationSettingPopupY: null,

            popupOffSet: 5,
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
            mapFile: 'first_map.png', // This can be dynamic

            canvasWidth: 0,
            canvasHeight: 0,
            newStationYoffset: 15,
        };
    },
    mounted() {
        this.canvasWidth = this.$refs.obstacleEditorOptions.getBoundingClientRect().width;
        this.canvasHeight = this.$refs.obstacleEditorOptions.getBoundingClientRect().height;
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
                            this.fabricCanvasInstance = new fabric.Canvas(this.$refs.stationEditorCanvas, {
                                width: this.canvasWidth,
                                height: this.canvasHeight,
                                backgroundImage: this.fabricImage,
                            })
                        }
                        this.loadStations();
                        this.setupCanvasPanning();
                        this.fabricCanvasInstance.requestRenderAll();
                    };
                } else {
                    console.error('Failed to load image:', response.error);
                }
            });
        },
        setStationPanningMode() {
            this.isPanning = true;
        },
        setupCanvasPanning() {
            // Handle mouse down event (start panning)
            this.fabricCanvasInstance.on('mouse:down', (opt) => {
                this.showPopup = false;
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
            this.toSetStation = true;
            this.stationCounter += 1;
            let id = "station_" + this.stationCounter
            this.setStation(id, this.canvasWidth / 2, -1 * this.fabricCanvasInstance.viewportTransform[5] + this.newStationYoffset, 0, 'black');
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
            const filePath = 'stations.json'; // Adjust this path as needed

            // Send the JSON data and file path to the main process
            ipcRenderer.send('save-json-file', { fileName: filePath, jsonData: jsonString });

            // Listen for save status
            ipcRenderer.on('save-status', (event, response) => {
                if (response.success) {
                    console.log('JSON file saved successfully');
                } else {
                    console.error('Failed to save JSON file:', response.error);
                }
            });
        },
        closePopup() {
            this.showPopup = false;
        },
        onStationMousedown(event) {
            if (this.toSetStation) {
                const rect = this.$refs.stationEditorOption.getBoundingClientRect();
                this.stationCanvasX = event.clientX - rect.left;
                this.stationCanvasY = event.clientY - rect.top;
            }
        },
        loadStations() {
            const filePath = 'stations.json'; // Adjust the path as necessary
            ipcRenderer.send('load-json-file', filePath);

            // Listen for the response containing the data
            ipcRenderer.on('json-file-data', (event, response) => {
                if (response.success) {
                    const data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
                    for (const key in data) {
                        this.stationCounter += 1;
                        this.stations[key] = {
                            left: data[key].left, top: data[key].top, angle: data[key].angle
                        }
                        this.setStation(key, this.stations[key].left, this.stations[key].top, this.stations[key].angle, 'blue');
                    }
                } else {
                    console.error('Failed to load station data:', response.error);
                }
            });

        },
    },
};