<template>
  <div id="app">
    <SideBar />
    <div class="main-content">
      <router-view />
    </div>
  </div>
</template>

<script>
import SideBar from "@/components/shared/SideBar.vue";


export default {
  components: {
    SideBar,
  },
};
</script>

<style>
#app {
  display: flex;
}
html, body {
  /* cursor: none; */
}

.main-content {
  flex-grow: 1;
  margin-left: 5vw;
  /* Matches the width of the sidebar */
  padding: 5px;
  /* Add some padding for a clean layout */
}

button {
    padding: 5px;
    font-size: 2.2em;
}

</style>