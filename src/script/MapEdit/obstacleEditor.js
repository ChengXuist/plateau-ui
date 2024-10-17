const { ipcRenderer } = window.require('electron');
import * as fabric from 'fabric';

export default {
    data() {
        return {
            selectedMode: 'obstacle-editor', // Default mode
            isDrawing: false,
            scaleRate: 1.0,

            panX: 0, // Pan offset X
            panY: 0, // Pan offset Y

            isMouseDown: false,
            x: null,
            y: null,
            lineWidth: 3,
            canversOffSet: 0,

            activeTab: 'obstacle-editor',
            mapFileName: 'first_map_user.png', // This can be dynamic
            fabricObstacleCanvasInstance: null,
            canvasWidth: 0,
            canvasHeight: 0,

            isPanning: false, // Flag to track panning mode
            isPanningMouseDown: false, // Flag to track panning mode
            lastPosX: 0, // Store last mouse/touch positions
            lastPosY: 0,
            isMouse: false,

            undoStack: [],

            zoomLevel: 1, // Initial zoom level
            zoomStep: 0.1, // The amount to zoom in or out
            maxZoom: 3, // Max zoom level
            minZoom: 0.5, // Min zoom level

            imageHeight: 0.,
            imageWidth: 0,
        };
    },
    methods: {
        setPanningMode(isPanning) {
            this.isPanning = isPanning;
            this.fabricObstacleCanvasInstance.isDrawingMode = !isPanning;
        },
        setDrawingMode(isDrawing) {
            this.fabricObstacleCanvasInstance.freeDrawingBrush.color = (isDrawing) ? '#000000' : '#ffffff';  // Brush color
            this.isPanning = false;
            this.fabricObstacleCanvasInstance.isDrawingMode = true;
        },
        getCoordinate(event) {
            let coordinates = this.$refs.VueCanvasDrawing.getCoordinates(event);
            this.x = coordinates.x;
            this.y = coordinates.y;
        },
        clearCanvas(unstack) {
            this.panX = 0;
            this.panY = 0;
            this.scaleRate = 1.0;
            if (unstack) {
                while (this.undoStack.length > 0) {
                    const lastObject = this.undoStack.pop();  // Get the last object from the stack
                    this.fabricObstacleCanvasInstance.remove(lastObject);  // Remove it from the canvas
                }
            }

            this.zoomLevel = 1.0
            let vpt = this.fabricObstacleCanvasInstance.viewportTransform;
            vpt[4] = 0;
            vpt[5] = 0;
            this.fabricObstacleCanvasInstance.setZoom(this.zoomLevel);
            this.fabricObstacleCanvasInstance.renderAll();
        },

        saveCanvas() {
            this.clearCanvas(false)
            this.fabricObstacleCanvasInstance.setHeight(this.imageHeight);
            this.fabricObstacleCanvasInstance.setWidth(this.imageWidth);
            this.fabricImage.left = 0;

            const dataURL = this.fabricObstacleCanvasInstance.toDataURL({
                format: 'png',
                quality: 1.0  // PNG quality is always 1.0
            });

            const base64Data = dataURL.replace(/^data:image\/png;base64,/, '');
            ipcRenderer.send('save-png-file', {
                fileName: 'canvas-image.png',  // You can dynamically set the file name
                data: base64Data  // Send the base64 string without the prefix
            });
            this.fabricImage.left = this.imageOffset;
            this.fabricObstacleCanvasInstance.setHeight(this.canvasHeight);
            this.fabricObstacleCanvasInstance.setWidth(this.canvasWidth);
        },
        loadEditorImage() {
            ipcRenderer.send('load-image-file', this.mapFileName);
            ipcRenderer.on('image-file-data', (event, response) => {
                if (this.fabricObstacleCanvasInstance == null) {
                    if (response.success) {
                        const base64Image = response.data;
                        const image = new Image();
                        image.src = `data:image/png;base64,${base64Image}`;
                        image.onload = () => {
                            this.imageOffset = (this.canvasWidth - image.width) / 2;
                            this.fabricImage = new fabric.FabricImage(image, {
                                left: this.imageOffset, // Horizontal offset
                            })
                            this.fabricObstacleCanvasInstance = new fabric.Canvas(this.$refs.editorCanvas, {
                                width: this.canvasWidth,
                                height: this.canvasHeight,
                                backgroundImage: this.fabricImage,
                            })
                            this.imageHeight = image.height;
                            this.imageWidth = image.width;
                            this.fabricObstacleCanvasInstance.selection = false;
                            this.initDrawding();
                            this.initPanning();
                            this.initUndo();
                            this.fabricObstacleCanvasInstance.renderAll()
                        };
                    } else {
                        console.error('Failed to load image:', response.error);
                    }
                }
            });
        },
        initDrawding() {
            this.fabricObstacleCanvasInstance.isDrawingMode = false;
            this.fabricObstacleCanvasInstance.freeDrawingBrush = new fabric.PencilBrush(this.fabricObstacleCanvasInstance);
            this.fabricObstacleCanvasInstance.freeDrawingBrush.width = this.lineWidth;  // Brush width (in pixels)
        },
        initPanning() {
            this.fabricObstacleCanvasInstance.on('mouse:down', (opt) => {
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
                }
            });

            this.fabricObstacleCanvasInstance.on('mouse:move', (opt) => {
                if (this.isPanning) {
                    console.log(opt.e)
                    if (opt.e && this.isPanningMouseDown === true) {
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
                        let vpt = this.fabricObstacleCanvasInstance.viewportTransform;
                        vpt[4] += deltaX;
                        vpt[5] += deltaY;
                        this.fabricObstacleCanvasInstance.requestRenderAll();

                        // Update last mouse position
                        this.lastPosX = x;
                        this.lastPosY = y;
                    }
                }

            });
            // Mouse up event (end panning)
            this.fabricObstacleCanvasInstance.on('mouse:up', () => {
                this.isPanningMouseDown = false;
            });
        },
        initUndo() {
            this.fabricObstacleCanvasInstance.on('object:added', (event) => {
                const object = event.target;
                if (object) {
                    this.undoStack.push(object);  // Add the object to the undo stack
                }
            });
        },
        zoom(isZoomIn) {
            if (isZoomIn) {
                if (this.zoomLevel < this.maxZoom) {
                    this.zoomLevel += this.zoomStep;
                    this.fabricObstacleCanvasInstance.setZoom(this.zoomLevel);
                }
            } else {
                if (this.zoomLevel > this.minZoom) {
                    this.zoomLevel -= this.zoomStep;
                    this.fabricObstacleCanvasInstance.setZoom(this.zoomLevel);
                }
            }
        },
        undo() {
            if (this.undoStack.length > 0) {
                const lastObject = this.undoStack.pop();  // Get the last object
                this.fabricObstacleCanvasInstance.remove(lastObject);  // Remove it from the canvas
                this.fabricObstacleCanvasInstance.renderAll();  // Re-render the canvas
            }
        },
    },
    mounted() {
        this.loadEditorImage();
        this.canvasWidth = this.$refs.obstacleEditorOptions.getBoundingClientRect().width;
        this.canvasHeight = this.$refs.obstacleEditorOptions.getBoundingClientRect().height;
        // this.saveData();
    }
};