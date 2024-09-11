<template>
  <div id="app" class="d-flex">
    <!-- Sidebar -->
    <sidebar-menu :isCollapsed="isCollapsed" />

    <!-- Main Content -->
    <div class="content flex-grow-1">
      <div class="container mt-4">
        <!-- Sidebar Toggle Button -->
        <button @click="toggleSidebar" class="btn toggle-btn">
          <!-- If sidebar is collapsed, show the hamburger icon -->
          <template v-if="isCollapsed">
            <div class="hamburger-icon">
              <span class="line"></span>
              <span class="line"></span>
              <span class="line"></span>
            </div>
          </template>
          <!-- If sidebar is open, show the close (X) icon -->
          <template v-else>
            <i class="bi bi-x-lg cross-icon"></i>
          </template>
        </button>
        <h1>Main Content Area</h1>
        <p>Click the button to toggle the sidebar.</p>
      </div>
    </div>
  </div>
</template>

<script>
import SidebarMenu from './components/SidebarMenu.vue';

export default {
  name: 'App',
  components: {
    SidebarMenu
  },
  data() {
    return {
      isCollapsed: true // Sidebar collapse state
    };
  },
  methods: {
    toggleSidebar() {
      this.isCollapsed = !this.isCollapsed;
    }
  }
};
</script>

<style>
/* Basic layout */
#app {
  height: 100vh;
  position: relative;
}

/* Position the toggle button in the top-left corner */
.toggle-btn {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
  background-color: transparent;
  border: none;
  padding: 5px;
  cursor: pointer;
  font-size: 1.5rem;
}

/* Hamburger icon styles */
.hamburger-icon {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 24px;
  height: 20px;
}

.hamburger-icon .line {
  background-color: #ff6347; /* Colorful lines (tomato color) */
  height: 3px;
  width: 100%;
  border-radius: 2px;
}

.cross-icon {
  color: white;
  font-size: 2rem;
}

</style>
