<template>
  <div id="app">
    <SideBar />
    <div class="content">
      <router-view></router-view>
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

.content {
  flex-grow: 1;
  padding: 20px;
}
</style>