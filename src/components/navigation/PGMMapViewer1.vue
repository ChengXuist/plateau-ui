<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <h3 class="text-center">Robot Map</h3>
        <div class="map-container border">
          <canvas id="mapCanvas" ref="mapCanvas" width="400" height="400"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  mounted() {
    // Get the canvas and context
    const canvas = this.$refs.mapCanvas;
    const ctx = canvas.getContext("2d");

    // Create a new image
    const img = new Image();
    img.src = "./robot-icon.jpg"; // Replace with the actual image path

    // When the image loads, draw it on the canvas
    img.onload = () => {
      // Calculate the center position for the image
      const x = 0;
      const y = 0;

      // Draw the image on the canvas at the center
      ctx.drawImage(img, x, y, 250,250);
    };
  }
};
</script>

<style scoped>
.map-container {
  width: 400px;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
