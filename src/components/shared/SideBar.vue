<template>
    <div class="sidebar">
        <!-- Sidebar Content -->
        <div class="sidebar-content">
            <div class="nav-item">
                <router-link class="nav-link" to="/">
                    <i class="bi bi-house "></i> <!-- Home Icon -->
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
    width: 40px;
    /* Minimum width to prevent being too small on smaller screens */
    height: 100%;
    /* 100% of the viewport height */
    background-color: #3498db;
    color: white;
    display: flex;
    justify-content: center;
    /* Center horizontally */
    align-items: center;
    /* Center vertically */
    flex-direction: column;
    padding: 0;
    position: fixed;
    /* Sticks to the left side of the window */
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
    width: 100%;
}

.nav-link i {
    font-size: 2.2rem;
}

.sidebar-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
}
</style>
