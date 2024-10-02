<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <h3 class="text-center">Robot Map</h3>
        <div class="map-container border">
          <canvas id="mapCanvas" @click="handleCanvasClick"  @wheel="handleZoom" @mousedown="startPanning" @mousemove="panMap" @mouseup="endPanning" @mouseleave="endPanning" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="endPanning" ref="mapCanvas"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ROSLIB from 'roslib';

export default {
  data() {
    return {
      ros: null,                  // The ROS connection object
      connectionStatus: 'Not Connected', // Status of the connection
      messages: [],                // Array to store received messages
      robotImage: null,            // The robot image
      rosPoseTopic: null,          // The ROS topic object for /pose
      robotPose: null,
      robotIcon: null, // Image object for the robot icon
      canvas: null,

      mapImage: null,     // Image object for the map
      ratioResolution: 0.02, 
      originMap: [-5.68, -4.04, 0],
      robotLogoSize:50,

      mapScale: 1,
      touchStartX: null,      // To track touch X position for panning
      touchStartY: null,      // To track touch Y position for panning
      isPanning: null,
      mapOffsetX: 0,
      mapOffsetY: 0,
 
    };
  },
  mounted() {
    this.connectToROS(); // When the component is mounted, connect to ROS
    this.initializeCanvas(); // Initialize the canvas and set the flag

    this.robotIcon = new Image();
    this.robotIcon.src = './robot-icon.jpg'; // Replace with actual image path

    this.mapImage = new Image();
    this.mapImage.src = './first_map.png'; // Replace with actual map image path
    this.mapImage.onload = () => {
      // Once the map is loaded, start subscribing to pose updates
      this.subscribeToPose();
    };

    this.canvas = this.$refs.mapCanvas;
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = this.canvas.parentElement.offsetWidth;
    this.canvas.height = this.canvas.parentElement.offsetHeight;
  },

  methods: {
    initializeCanvas() {
      // Ensure the DOM is fully rendered before initializing the canvas
      this.$nextTick(() => {
        const canvas = this.$refs.mapCanvas;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            this.isCanvasReady = true; // Set the flag to true when canvas is ready
          } else {
            console.error('Canvas context is not available.');
          }
        } else {
          console.error('Canvas element is not available.');
        }
      });
    },

        // Function to handle canvas click
    handleCanvasClick(event) {
      // Get the click position relative to the canvas
      const canvasRect = this.canvas.getBoundingClientRect();
      const canvasX = event.clientX - canvasRect.left;
      const canvasY = event.clientY - canvasRect.top;

      console.log("Canvas Coordinates: ", { x: canvasX, y: canvasY });

      // Convert canvas coordinates to map coordinates
      const mapX = (canvasX - this.mapOffsetX)  * this.ratioResolution + this.originMap[0] ;
      const mapY = (this.mapImage.naturalHeight - (canvasY - this.mapOffsetY)) * this.ratioResolution + this.originMap[1];  // Invert Y for the map

      console.log("Map Coordinates: ", { x: mapX, y: mapY });
    },
    
    // Function to connect to ROSBridge server
    connectToROS() {
      this.ros = new ROSLIB.Ros({
        url: 'ws://192.168.1.38:9090', // Change this to your ROSBridge server URL
      });
      this.ros.getTopics((topics) => {
        console.log('List of topics:', topics);
        this.topicsList = topics.topics;  // Store the list of topics (if needed)
        this.messageTypesList = topics.types; // Store the corresponding message types
      }, (error) => {
        console.error('Error fetching topics:', error);
      });

      // Handle connection events
      this.ros.on('connection', () => {
        this.connectionStatus = 'Connected';
        console.log('Connected to ROSBridge WebSocket server');
        this.subscribeToPose(); // Subscribe to the pose topic
        this.drawMap(this.ctx);
      });

      this.ros.on('error', (error) => {
        this.connectionStatus = 'Error connecting';
        console.error('Error connecting to ROSBridge:', error);
        this.drawMap(this.ctx);
      });

      this.ros.on('close', () => {
        this.connectionStatus = 'Connection Closed';
        console.log('Connection to ROSBridge WebSocket closed');
      });
    },

    // Subscribe to the /pose topic to get robot's position
    subscribeToPose() {
      this.rosPoseTopic = new ROSLIB.Topic({
        ros: this.ros,
        name: '/pose',  // Change to the correct pose topic
        messageType: 'geometry_msgs/msg/PoseWithCovarianceStamped', // Update message type if needed
      }
    );
        // Subscribe to the /pose topic
      this.rosPoseTopic.subscribe((message) => {
        console.log('Received pose :',  message);
        this.robotPose = message.pose.pose;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // Clear canvas
        this.drawRobot(this.ctx, this.robotPose, this.robotIcon); // Draw the robot
      });
    },

    drawMap(ctx) {
      ctx.drawImage(this.mapImage, 0, 0);
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.translate(this.mapOffsetX, this.mapOffsetY);
      this.ctx.scale(this.mapScale, this.mapScale);
      ctx.drawImage(this.mapImage, 0, 0);
      //  ctx.canvas.width, ctx.canvas.height);
    },

    drawRobot(ctx, pose, icon) {
      // Draw the map image
      this.ctx.scale(this.mapScale, this.mapScale);
      ctx.drawImage(this.mapImage, 0, 0);
      const { position,  orientation} = pose;

      // Convert canvas coordinates to map coordinates
      const pixelX = (position.x - this.originMap[0]) / this.ratioResolution ; // Adjust for the origin and resolution
      const pixelY = this.mapImage.naturalHeight - (position.y - this.originMap[1]) / this.ratioResolution ; // Invert Y to match canvas coordinates

      // Assuming orientation is a quaternion, we will extract the yaw angle (rotation around the z-axis)
      const siny_cosp = 2 * (orientation.w * orientation.z + orientation.x * orientation.y);
      const cosy_cosp = 1 - 2 * (orientation.y * orientation.y + orientation.z * orientation.z);
      const yaw = Math.atan2(siny_cosp, cosy_cosp) - 3.14/4; // Rotation in radians 3.14/4 * 3 is the patch direction for robot logo

      // Save the current canvas context before transformations
      ctx.save();
      ctx.rotate(this.rotation);
      ctx.translate(pixelX, pixelY);
      ctx.rotate(yaw);

      // Draw the robot icon centered on the new origin
      ctx.drawImage(icon, -this.robotLogoSize / 2, -this.robotLogoSize / 2, this.robotLogoSize, this.robotLogoSize);

      // Restore the canvas to its original state (undo transformations)
      ctx.restore();
    },

    // Handle mouse wheel scroll for zooming
    handleZoom(event) {
      event.preventDefault();

      // Adjust the scale (zoom level) based on scroll direction
      const zoomFactor = 0.1;
      if (event.deltaY > 0.5) {
        // Zoom out
        this.mapScale = Math.max(0.5, this.mapScale - zoomFactor);
      } else {
        // Zoom in
        this.mapScale = Math.min(3, this.mapScale + zoomFactor);
      }

      // Redraw the canvas with the new scale
      // this.drawRobot(this.ctx, this.robotPose, this.robotIcon);
      this.drawMap(this.ctx);
    },

    // Start panning on mouse down
    startPanning(event) {
      this.isPanning = true;
      this.lastMouseX = event.clientX; // Save the initial mouse X position
      this.lastMouseY = event.clientY; // Save the initial mouse Y position
    },

    // Handle mouse movement for panning
    panMap(event) {
      if (this.isPanning) {
        const deltaX = (event.clientX - this.lastMouseX) ;
        const deltaY = (event.clientY - this.lastMouseY);

        // Update the map offset based on mouse movement
        this.mapOffsetX += deltaX* 0.1;
        this.mapOffsetY += deltaY* 0.1;

        this.lastMouseX = event.clientX; // Update the last mouse X position
        this.lastMouseY = event.clientY; // Update the last mouse Y position

        // Redraw the canvas with the new map position
        this.drawMap(this.ctx);
      }
    },

    // End panning when the mouse is released or leaves the canvas
    endPanning() {
      this.isPanning = false;
    },

    // Handle touch start (for panning)
    handleTouchStart(event) {
      if (event.touches.length === 1) {
        this.isPanning = true;
        const touch = event.touches[0];
        this.lastMouseX = touch.clientX;
        this.lastMouseY = touch.clientY;
      }
    },

    // Handle touch move (for panning)
    handleTouchMove(event) {
      if (this.isPanning && event.touches.length === 1) {
        const touch = event.touches[0];

        const deltaX = (touch.clientX - this.lastMouseX)/50;
        const deltaY = (touch.clientY - this.lastMouseY)/50;

        // Update the map offset based on touch movement
        this.mapOffsetX += deltaX;
        this.mapOffsetY += deltaY;

        this.lastMouseX = touch.clientX;
        this.lastMouseY = touch.clientY;

        // Redraw the canvas with the new map position
        this.drawMap();
      }
    },

  },
};
</script>

<style scoped>
.map-container {
  position: relative;
  width: 100%;
  height: 100vh; /* Set to full viewport height or customize as needed */
}
canvas {
  display: block; /* Remove extra whitespace */
  width: 100%;
  height: 100%;
}
</style>