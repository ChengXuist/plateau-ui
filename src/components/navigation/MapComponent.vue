<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <h3 class="text-center">Robot Map</h3>
        <div class="map-container border">
          <canvas id="mapCanvas"></canvas>
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
      ros: null,
      mapTopic: null,
      mapData: null,
    };
  },
  mounted() {
    this.connectToRos();
  },
  methods: {
    connectToRos() {
      // Connect to ROSBridge WebSocket server
      this.ros = new ROSLIB.Ros({
        url: 'ws://192.168.1.38:9090', // Change to your ROSBridge WebSocket URL if needed
      });

      // Subscribe to the /map topic
      this.mapTopic = new ROSLIB.Topic({
        ros: this.ros,
        name: '/map',
        messageType: 'nav_msgs/OccupancyGrid',
      });

      this.mapTopic.subscribe((message) => {
        this.mapData = message;
        this.drawMap(message); // Call the drawMap method when data is received
      });
    },

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

    drawMap(occupancyGrid) {
      const canvas = document.getElementById('mapCanvas');
      const ctx = canvas.getContext('2d');

      const width = occupancyGrid.info.width;
      const height = occupancyGrid.info.height;
      const mapData = occupancyGrid.data;

      // Set canvas dimensions based on the map size
      canvas.width = width;
      canvas.height = height;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = x + y * width;
          const value = mapData[i];

          // Convert occupancy grid values to colors
          let color;
          if (value === -1) {
            color = 'rgba(255, 255, 255, 1)'; // White for unknown space
          } else if (value === 0) {
            color = 'rgba(0, 255, 0, 1)'; // Green for free space
          } else {
            color = 'rgba(0, 0, 0, 1)'; // Black for occupied space
          }

          // Draw the map grid cell
          ctx.fillStyle = color;
          ctx.fillRect(x, y, 1, 1); // Draw a 1x1 pixel square
        }
      }
    },
  },
};
</script>

<style scoped>
.map-container {
  position: relative;
  width: 100%;
  height: 500px; /* Adjust the height as needed */
}
canvas {
  width: 100%;
  height: 100%;
}
</style>
