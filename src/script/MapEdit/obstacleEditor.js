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

            canversOffSet: 0,

            activeTab: 'obstacle-editor',
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
            this.panX = 0;
            this.panY = 0;
            this.scaleRate = 1.0;

            const canvas = this.$refs.editorCanvas;
            const ctx = canvas.getContext('2d');
            const img = new Image();
            const obstacleEditorOptionsW = this.$refs.obstacleEditorOptions.getBoundingClientRect().width;

            img.onload = () => {
                // Set canvas size based on the image size
                canvas.width = obstacleEditorOptionsW;
                canvas.height = img.height;
                ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
                ctx.drawImage(img, this.canversOffSet, 0); // Draw the image at the center
                this.redrawLines(ctx);
            };
            img.src = './maps/first_map.png'; // Provide the image path here
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
            const img = new Image();
            img.onload = () => {
                const tempCanvas = document.createElement('canvas');
                const tempCtx = tempCanvas.getContext('2d');

                tempCanvas.width = img.width;
                tempCanvas.height = img.height;
                tempCtx.clearRect(0, 0, tempCtx.width, tempCtx.height); // Clear the canvas
                tempCtx.drawImage(img, 0, 0); // Draw the image at the center
                this.redrawLines(tempCtx, true);
                const link = document.createElement('a');
                link.href = tempCanvas.toDataURL('image/png'); // Specify the format you want (PNG)
                link.download = 'first_map_user.png'; // Default name for the downloaded file
                link.click();
            };
            img.src = './maps/first_map.png'; // Provide the image path here
        },
        loadEditorImage() {
            const canvas = this.$refs.editorCanvas;
            const ctx = canvas.getContext("2d");
            const img = new Image();
            img.onload = () => {
                // Set canvas size based on the image size
                canvas.width = this.$refs.obstacleEditorOptions.getBoundingClientRect().width;
                canvas.height = img.height;
                this.canversOffSet = (canvas.width - img.width) / 2

                ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
                ctx.scale(this.scaleRate, this.scaleRate);
                ctx.translate(this.panX, this.panY);
                ctx.drawImage(img, this.canversOffSet, 0); // Draw the image at the center
                this.redrawLines(ctx);
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
        redrawLines(ctx, saveImage) {
            // Draw all stored lines
            this.drawnLines.forEach(strokes => {
                strokes.forEach(line => {
                    ctx.beginPath();
                    ctx.strokeStyle = line.color;
                    ctx.lineWidth = this.lineWidth;
                    if (saveImage) {
                        ctx.moveTo(line.start.x - this.canversOffSet, line.start.y);
                        ctx.lineTo(line.end.x - this.canversOffSet, line.end.y);
                    } else {
                        ctx.moveTo(line.start.x, line.start.y);
                        ctx.lineTo(line.end.x, line.end.y);
                    }
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
        zoom(isZoomIn) {
            const zoomFactor = 0.1;
            this.scaleRate = isZoomIn
                ? Math.max(0.5, this.scaleRate - zoomFactor)
                : Math.min(3, this.scaleRate + zoomFactor);
            this.loadEditorImage();
        },
        undo() {
            if (this.drawnLines.length > 0) {
                const canvas = this.$refs.editorCanvas;
                const ctx = canvas.getContext("2d");
                this.drawnLines.pop(); // Remove the latest state
                this.redrawLines(ctx);
                this.loadEditorImage();
            }
        },
    },
    mounted() {
        this.loadEditorImage();
    }
};