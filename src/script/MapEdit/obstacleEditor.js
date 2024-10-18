const { ipcRenderer } = window.require('electron');
import * as fabric from 'fabric';

export default {
    data() {
        return {
            selectedMode: 'obstacle-editor', // Default mode
            isGray: false,
            scaleRate: 1.0,

            panX: 0, // Pan offset X
            panY: 0, // Pan offset Y

            isMouseDown: false,
            x: null,
            y: null,
            eraserWidth: 6,
            lineWidth: 4,
            canversOffSet: 0,

            activeTab: 'obstacle-editor',
            mapFileName: 'first_map_user.png', // This can be dynamic
            fabricObstacleCanvasInstance: null,
            canvasObsWidth: 0,
            canvasObsHeight: 0,

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

            linePoints: [],
            lineTempPoint: null,

            showEraserPopup: false,
            eraserSize: 5,
            currentEraserSize: 5,
            imageObsWidth: 0,
            imageObsHeight: 0,
            imageObsOriginalWidth: 0,
            imageObsOriginalHeight: 0,
        };
    },
    methods: {
        confirmEraserSize() {
            this.currentEraserSize = this.eraserSize;
            this.showEraserPopup = false; // Close the popup after confirmation
            this.fabricObstacleCanvasInstance.freeDrawingBrush.width = this.currentEraserSize;  // Brush width (in pixels)
        },
        cancelEraserSize() {
            this.showEraserPopup = false;
            this.eraserSize = this.currentEraserSize;
        },
        setPanningMode(isPanning) {
            this.isPanning = isPanning;
            this.fabricObstacleCanvasInstance.isDrawingMode = !isPanning;
            this.isDrawLineMode = false;
        },
        setDrawlineMode() {
            this.fabricObstacleCanvasInstance.freeDrawingBrush.color = '#ffffff';
            this.isDrawLineMode = true;
            this.fabricObstacleCanvasInstance.isDrawingMode = false;
        },
        addTempPoint(x, y) {
            this.lineTempPoint = new fabric.Circle({
                left: x,
                top: y,
                radius: 3,
                fill: 'red',
                selectable: false, // Make sure the point is not selectable
                originX: 'center',
                originY: 'center',
                isTemporary: true,
            });

            this.fabricObstacleCanvasInstance.add(this.lineTempPoint);
            this.fabricObstacleCanvasInstance.renderAll();
        },
        removeTempPoint() {
            // Remove the temporary point from the canvas
            if (this.lineTempPoint) {
                this.fabricObstacleCanvasInstance.remove(this.lineTempPoint);
                this.lineTempPoint = null;
            }
        },
        drawLine() {
            const [point1, point2] = this.linePoints;
            const line = new fabric.Line(
                [point1.x, point1.y, point2.x, point2.y],
                {
                    stroke: 'black',
                    strokeWidth: this.lineWidth,
                }
            );
            this.fabricObstacleCanvasInstance.add(line);
            this.fabricObstacleCanvasInstance.renderAll();
        },
        setEraserMode(isGray) {
            this.fabricObstacleCanvasInstance.freeDrawingBrush.color = (isGray) ? '#cccccc' : '#ffffff';  // Brush color
            this.isPanning = false;
            this.fabricObstacleCanvasInstance.isDrawingMode = true;
            this.isDrawLineMode = false;
            this.showEraserPopup = true
        },
        getCoordinate(event) {
            let coordinates = this.$refs.VueCanvasDrawing.getCoordinates(event);
            this.x = coordinates.x;
            this.y = coordinates.y;
        },
        clearCanvas(unstack) {
            this.panX = 0;
            this.panY = 0;
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
            this.fabricObstacleCanvasInstance.setHeight(this.imageObsOriginalHeight);
            this.fabricObstacleCanvasInstance.setWidth(this.imageObsOriginalWidth);
            let vpt = this.fabricObstacleCanvasInstance.viewportTransform;
            vpt[4] = -(this.canvasObsWidth - this.imageObsWidth) / 2;

            this.fabricObstacleCanvasInstance.setZoom(this.imageObsOriginalWidth / this.imageObsWidth);
            this.fabricObstacleCanvasInstance.renderAll();

            const dataURL = this.fabricObstacleCanvasInstance.toDataURL({
                format: 'png',
                quality: 1.0  // PNG quality is always 1.0
            });

            const base64Data = dataURL.replace(/^data:image\/png;base64,/, '');
            ipcRenderer.send('save-png-file', {
                fileName: 'canvas-image.png',  // You can dynamically set the file name
                data: base64Data  // Send the base64 string without the prefix
            });
            this.fabricObstacleCanvasInstance.setHeight(this.canvasObsHeight);
            this.fabricObstacleCanvasInstance.setWidth(this.canvasObsWidth);
            this.fabricObstacleCanvasInstance.viewportTransform[4] = 0;
            this.fabricObstacleCanvasInstance.setZoom(this.imageObsWidth / this.imageObsOriginalWidth);
            this.fabricObstacleCanvasInstance.renderAll();
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
                            // Calculate the ratio to maintain the original aspect ratio
                            const imageAspectRatio = image.width / image.height;
                            const canvasAspectRatio = this.canvasObsWidth / this.canvasObsHeight;
                            this.imageObsOriginalWidth = image.width;
                            this.imageObsOriginalHeight = image.height;

                            // Fit to canvas width
                            if (canvasAspectRatio > imageAspectRatio) {
                                // If canvas is wider, fit to height
                                this.imageObsHeight = this.canvasObsHeight;
                                this.imageObsWidth = this.imageObsHeight * imageAspectRatio;
                            } else {
                                // If canvas is taller, fit to width
                                this.imageObsWidth = this.canvasObsWidth;
                                this.imageObsHeight = this.imageObsWidth / imageAspectRatio;
                            }

                            // this.imageOffset = (this.canvasObsWidth - image.width) / 2;
                            this.fabricImage = new fabric.FabricImage(image, {
                                left: (this.canvasObsWidth - this.imageObsWidth) / 2, // Center the image vertically
                                scaleX: this.imageObsWidth / image.width, // Scale X based on original width
                                scaleY: this.imageObsHeight / image.height, // Scale Y based on original height
                            })
                            if (this.fabricObstacleCanvasInstance === null) {
                                this.fabricObstacleCanvasInstance = new fabric.Canvas(this.$refs.editorCanvas, {
                                    width: this.canvasObsWidth,
                                    height: this.canvasObsHeight,
                                    backgroundImage: this.fabricImage,
                                })
                            }

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
            this.fabricObstacleCanvasInstance.freeDrawingBrush.width = this.currentEraserSize;  // Brush width (in pixels)
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
                if (this.isDrawLineMode) {
                    const pointer = this.fabricObstacleCanvasInstance.getPointer(opt.e);
                    const { x, y } = pointer;

                    // Store the points on click
                    this.linePoints.push({ x, y });
                    if (this.linePoints.length === 1) {
                        this.addTempPoint(x, y);
                    }

                    // Once two points are selected, draw the line
                    if (this.linePoints.length === 2) {
                        this.drawLine();
                        this.linePoints = []; // Reset points after drawing
                        this.removeTempPoint();
                    }
                }
            });

            this.fabricObstacleCanvasInstance.on('mouse:move', (opt) => {
                if (this.isPanning) {
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
                if (object && !object.isTemporary) {
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
        this.canvasObsWidth = this.$refs.obstacleEditorOptions.getBoundingClientRect().width;
        this.canvasObsHeight = this.$refs.obstacleEditorOptions.getBoundingClientRect().height;
    }
};