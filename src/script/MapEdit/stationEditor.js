import * as fabric from 'fabric';

export default {

    data() {
        return {
            stationScaleRate: 1.0,
            stationPanX: 0, // Pan offset X
            stationPanY: 0, // Pan offset Y

            stationCanversOffSet: 0,
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

            stationSettingPopupY: null,
            stationSettingPopupX: null,

            popupOffSet: 50,
        };
    },
    methods: {
        activateStationEditor() {
            this.activeTab = 'station-editor'; // Set active tab

            // Call your additional function here
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
                this.fabricImage = new fabric.FabricImage(image, {
                    left: (this.$refs.stationEditorOption.getBoundingClientRect().width - image.width) / 2, // Horizontal offset
                })

                this.fabricCanvasInstance = new fabric.Canvas(this.$refs.stationEditorCanvas, {
                    width: this.$refs.stationEditorOption.getBoundingClientRect().width,
                    height: this.$refs.stationEditorOption.getBoundingClientRect().height,
                    backgroundImage: this.fabricImage,
                })
                this.fabricCanvasInstance.renderAll()

                this.fabricCanvasInstance.on("mouse:up", () => {
                    const activeObject = this.fabricCanvasInstance.getActiveObject();
                    if (activeObject) {
                        // Open the popup and populate it with the active object's properties
                        this.selectedObject = activeObject;
                        this.stationProperties.angle = activeObject.angle;
                        this.stationProperties.left = activeObject.left;
                        this.stationProperties.top = activeObject.top;
                        this.stationSettingPopupY = activeObject.top - this.popupOffSet;
                        this.stationSettingPopupX = activeObject.left + this.popupOffSet;
                        activeObject.set('fill', 'blue');
                        this.showPopup = true;
                    }
                });
            }
        },
        rotateStation(direction) {
            let rotationAngle = (direction == "left") ? -5 : 5;
            const activeObject = this.fabricCanvasInstance.getActiveObject();
            if (activeObject) {
                activeObject.set('angle', activeObject.angle + rotationAngle).setCoords();
                this.fabricCanvasInstance.renderAll();
                this.stationProperties.angle = activeObject.angle;
            }
        },
        // loadStationEditorImage() {
        //     const canvas = this.$refs.stationEditorCanvas;
        //     const ctx = canvas.getContext("2d");
        //     const img = new Image();
        //     img.onload = () => { 
        //         // Set canvas size based on the image size
        //         canvas.width = this.$refs.stationEditorOption.getBoundingClientRect().width;
        //         canvas.height = img.height;
        //         this.stationCanversOffSet = (canvas.width - img.width) / 2

        //         ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
        //         ctx.scale(this.stationScaleRate, this.stationScaleRate);
        //         ctx.translate(this.stationPanX, this.stationPanY);
        //         ctx.drawImage(img, this.stationCanversOffSet, 0); // Draw the image at the center
        //     };

        //     img.src = './maps/first_map.png'; // Provide the image path here
        // },
        zoomStationCanvas(isZoomIn) {
            const zoomFactor = 0.1;
            this.stationScaleRate = isZoomIn
                ? Math.max(0.5, this.stationScaleRate - zoomFactor)
                : Math.min(3, this.stationScaleRate + zoomFactor);
            this.loadStationEditorImage();
        },
        setStation() {
            this.tosetStation = true;

            this.fabricCanvasInstance.add(
                new fabric.Circle({
                    originX: "center",
                    originY: "center",
                    strokeWidth: 1,
                    left: 50,
                    top: 50,
                    selectable: true,
                    evented: true,
                    radius: 20,
                })
            );

        },
        removeSelectedObject() {
            const activeObject = this.fabricCanvasInstance.getActiveObject();
            if (activeObject) {
                this.fabricCanvasInstance.remove(activeObject);
                this.fabricCanvasInstance.discardActiveObject(); // Clear selection
                this.fabricCanvasInstance.renderAll(); // Re-render canvas
            }
        },
        // Close the popup
        closePopup() {
            this.showPopup = false;
        },
        // Update the object when changing properties in the popup
        updateObject(property) {
            if (this.selectedObject) {
                this.selectedObject.set({
                    [property]: this.stationProperties[property],
                });
                this.fabricCanvasInstance.renderAll(); // Re-render the canvas
            }
        },
        onStationMousedown(event) {
            if (this.tosetStation) {
                const rect = this.$refs.stationEditorOption.getBoundingClientRect();
                this.stationCanvasX = event.clientX - rect.left;
                this.stationCanvasY = event.clientY - rect.top;
                console.log(this.stationCanvasX, this.stationCanvasY)
            }
        },
    },
    mounted() {
        // this.initCanvas();
        // import('fabric').then(({ fabric }) => {
        // this.canvas = new fabric.Canvas('canvas', {
        //         width: 800,
        //         height: 600,
        //     });
        // }).catch(err => {
        //     console.error("Error loading Fabric.js", err);
        // });
        // this.canvas = new fabric.Canvas('stationEditorCanvas', {
        //     width: 800,
        //     height: 600,
        // });
    }
};