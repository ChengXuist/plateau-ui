<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <h3 class="text-center">Robot Map</h3>
        <div class="map-container border">
          <canvas id="mapCanvas" ref="mapCanvas"></canvas>
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
      chatterTopic: null,          // The ROS topic object for /chatter
      rosMapTopic: null,           // The ROS topic object for /map
      messages: [],                // Array to store received messages
      inputMessage: '',            // The message to publish
      robotPosition: {             // Robot's initial position
        x: 100,                    // X-coordinate
        y: 100,                    // Y-coordinate
        angle: 0,                  // Angle in radians
      },
      robotImage: null,            // The robot image
      rosPoseTopic: null,          // The ROS topic object for /pose
      robotPose: null,
      robotIcon: null, // Image object for the robot icon
      canvas: null,

      mapImage: null,     // Image object for the map
    };
  },
  mounted() {

    this.connectToROS(); // When the component is mounted, connect to ROS
    this.initializeCanvas(); // Initialize the canvas and set the flag

    this.robotIcon = new Image();
    this.robotIcon.src = './robot-icon.jpg'; // Replace with actual image path

    this.mapImage = new Image();
    this.mapImage.src = './eva.png'; // Replace with actual map image path
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
            // Set canvas dimensions
            // const width = this.$el.clientWidth; // Get width of container
            // const height = this.$el.clientHeight; // Get height of container
            // this.canvas.width = width;
            // this.canvas.height = height;
            this.isCanvasReady = true; // Set the flag to true when canvas is ready
          } else {
            console.error('Canvas context is not available.');
          }
        } else {
          console.error('Canvas element is not available.');
        }
      });
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
        this.subscribeToChatter();
        this.subscribeToPose(); // Subscribe to the pose topic
      });

      this.ros.on('error', (error) => {
        this.connectionStatus = 'Error connecting';
        console.error('Error connecting to ROSBridge:', error);
      });

      this.ros.on('close', () => {
        this.connectionStatus = 'Connection Closed';
        console.log('Connection to ROSBridge WebSocket closed');
      });
    },

    // Function to subscribe to the /chatter topic
    subscribeToChatter() {
      this.chatterTopic = new ROSLIB.Topic({
        ros: this.ros,
        name: '/chatter',
        messageType: 'std_msgs/String',
      });

      // Subscribe to the /chatter topic
      this.chatterTopic.subscribe((message) => {
        console.log('Received message on /chatter:', message.data);
        this.messages.push(message.data); // Add message to array
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

        // console.log('position:',  message.pose.pose.position.x);
        console.log('Received pose  this.robotPose:',  this.robotPose);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // Clear canvas
        this.drawRobot(this.ctx, this.robotPose, this.robotIcon); // Draw the robot
      });
    },

    drawRobot(ctx, pose, icon) {
      // Draw the map image
      ctx.drawImage(this.mapImage, 0, 0, ctx.canvas.width, ctx.canvas.height);
      const { position,  orientation} = pose;

      // Assuming orientation is a quaternion, we will extract the yaw angle (rotation around the z-axis)
      const siny_cosp = 2 * (orientation.w * orientation.z + orientation.x * orientation.y);
      const cosy_cosp = 1 - 2 * (orientation.y * orientation.y + orientation.z * orientation.z);
      const yaw = Math.atan2(siny_cosp, cosy_cosp); // Rotation in radians

      // Image size (adjust according to your requirements)
      const imgWidth = 50;
      const imgHeight = 50;

      // Save the current canvas context before transformations
      ctx.save();

      ctx.translate(position.x, position.y);
      ctx.rotate(yaw);

      // Draw the robot icon centered on the new origin
      ctx.drawImage(icon, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);

      // Restore the canvas to its original state (undo transformations)
      ctx.restore();
    },


    updateRobotPosition(ctx, pose, robotIcon) {
      this.drawRobot(ctx, pose, robotIcon); // Redraw the map with updated robot position
    },

    drawMap() {
      // const canvas = this.$refs.mapCanvas; // Get canvas element using ref

      // if (!canvas) {
      //   console.error('Canvas is not available yet.');
      //   return; // Exit if the canvas is not yet available
      // }

      // const ctx = canvas.getContext('2d');
      // if (!ctx) {
      //   console.error('Canvas context is not available.');
      //   return; // Exit if the canvas context is not available
      // }

      // const width = this.$el.clientWidth; // Get width of container
      // const height = this.$el.clientHeight; // Get height of container

      // // Set canvas dimensions
      // canvas.width = width;
      // canvas.height = height;

      // ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

      // // Draw the robot icon
      // ctx.save();
      // ctx.translate(this.robotPosition.x, this.robotPosition.y); // Move to robot's position
      // ctx.rotate(this.robotPosition.angle); // Rotate based on robot's angle
      // ctx.drawImage(this.robotImage, -this.robotImage.width / 2, -this.robotImage.height / 2, 20, 20); // Draw the robot icon
      // ctx.restore();
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