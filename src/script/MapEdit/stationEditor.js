import * as fabric from 'fabric';

export default {

    data() {
        return {
            // selectedMode: 'obstacle-editor', // Default mode
            // isDrawing: false,
            // isPanning: false,
            // canvasWidth: 400,
            // backgroundImage: './maps/first_map.png',
            stationScaleRate: 1.0,
            // draw: true,

            // panStartX: 0, // Starting X position of pan
            // panStartY: 0, // Starting Y position of pan
            stationPanX: 0, // Pan offset X
            stationPanY: 0, // Pan offset Y

            // isMouseDown: false,
            // drawnLines: [],
            // drawnLine: [],
            // x: null,
            // y: null,
            // lineWidth: 3,

            stationCanversOffSet: 0,
            toSetRobot: false,
            stationCanvasX: 0,
            stationCanvasY: 0,

            fabricCanvasInstance: {},
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
            this.$nextTick(() => {
                // this.loadStationEditorImage();
            });
        },

        initCanvas() {
            this.fabricCanvasInstance = new fabric.Canvas("station-editor-canvas");
            this.fabricCanvasInstance.setWidth(1000);
            this.fabricCanvasInstance.setHeight(1000);
            this.fabricCanvasInstance.add(
                new fabric.Rect({
                    type: "rect",
                    originX: "center",
                    originY: "center",
                    stroke: "red",
                    strokeWidth: 1,
                    left: 50,
                    top: 50,
                    width: 100,
                    height: 100,
                    rx: 0,
                    ry: 0,
                    fill: "red",
                    selectable: true,
                    evented: true,
                })
            );
        },
        loadStationEditorImage() {
            const canvas = this.$refs.stationEditorCanvas;
            const ctx = canvas.getContext("2d");
            const img = new Image();
            img.onload = () => {
                // Set canvas size based on the image size
                canvas.width = this.$refs.stationEditorOption.getBoundingClientRect().width;
                canvas.height = img.height;
                this.stationCanversOffSet = (canvas.width - img.width) / 2

                ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
                ctx.scale(this.stationScaleRate, this.stationScaleRate);
                ctx.translate(this.stationPanX, this.stationPanY);
                ctx.drawImage(img, this.stationCanversOffSet, 0); // Draw the image at the center
            };

            img.src = './maps/first_map.png'; // Provide the image path here
        },
        zoomStationCanvas(isZoomIn) {
            const zoomFactor = 0.1;
            this.stationScaleRate = isZoomIn
                ? Math.max(0.5, this.stationScaleRate - zoomFactor)
                : Math.min(3, this.stationScaleRate + zoomFactor);
            this.loadStationEditorImage();
        },
        // setRobot() {
        //     this.toSetRobot = true;
        // },
        onStationMousedown(event) {
            if (this.toSetRobot) {
                const rect = this.$refs.stationEditorOption.getBoundingClientRect();
                this.stationCanvasX = event.clientX - rect.left;
                this.stationCanvasY = event.clientY - rect.top;
                console.log(this.stationCanvasX, this.stationCanvasY)
            }
        },
    },
    mounted() {
        this.initCanvas();
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