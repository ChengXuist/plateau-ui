<template>
  <div class="sidebar">
    <!-- Sidebar Content -->
    <div class="sidebar-content">

      <div class="nav-item">
        <router-link class="nav-link" to="/">
          <i class="bi bi-house"></i> <!-- Home Icon -->
        </router-link>
      </div>
      <div class="nav-item">
        <router-link class="nav-link" to="/navigation">
          <i class="bi bi-geo-alt"></i> <!-- Navigation Icon -->
        </router-link>
      </div>
      <div class="nav-item">
        <router-link class="nav-link" to="/map-edit">
          <i class="bi bi-map"></i> <!-- Map Icon -->
        </router-link>
      </div>
      <div class="nav-item">
        <router-link class="nav-link" to="/mapping-selection">
          <i class="bi bi-file-earmark-arrow-up-fill"></i> <!-- Edit Icon -->
        </router-link>
      </div>
      
    </div>
  </div>
</template>

<script>
export default {
  name: "SideBar",
};
</script>

<style scoped>
.sidebar {
  width: 5vw; /* 15% of the viewport width */
  min-width: 30px; /* Minimum width to prevent being too small on smaller screens */
  height: 100vh;
  background-color: #3498db;
  color: white;
  display: flex;
  justify-content: center; /* Center horizontally */
  align-items: center; /* Center vertically */
  flex-direction: column;
  padding: 0;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9;
}

.nav-link {
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  width: 100%; /* Make nav-link full width */
}

.nav-link i {
  font-size: 1.8rem;
}

.sidebar-content {
  display: flex;
  flex-direction: column;
  justify-content: center; /* Center the icons vertically */
  align-items: center; /* Center the icons horizontally */
  height: 100%; /* Full height for centering */
}
</style>
