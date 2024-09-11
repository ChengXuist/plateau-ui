<template>
<nav :class="['sidebar', { 'collapsed': isCollapsed }]" :aria-expanded="!isCollapsed">
    <div class="sidebar-content">
        <ul class="nav flex-column">
            <!-- Sidebar Header -->
            <li class="nav-item">
                <a class="nav-link active" href="#">
                    <i class="bi bi-house-door"></i>
                    Home
                </a>
            </li>

            <!-- Collapsible Menu Group 1 -->
            <li class="nav-item">
                <a class="nav-link" @click="toggleCollapse('group1')" href="#">
                    <i class="bi bi-folder"></i>
                    Menu Group 1
                </a>
                <ul v-if="!collapsedItems.includes('group1')" class="nav flex-column pl-3">
                    <li class="nav-item"><a class="nav-link" href="#">Subitem 1</a></li>
                    <li class="nav-item"><a class="nav-link" href="#">Subitem 2</a></li>
                </ul>
            </li>

            <!-- Collapsible Menu Group 2 -->
            <li class="nav-item">
                <a class="nav-link" @click="toggleCollapse('group2')" href="#">
                    <i class="bi bi-folder"></i>
                    Menu Group 2
                </a>
                <ul v-if="!collapsedItems.includes('group2')" class="nav flex-column pl-3">
                    <li class="nav-item"><a class="nav-link" href="#">Subitem 1</a></li>
                    <li class="nav-item"><a class="nav-link" href="#">Subitem 2</a></li>
                </ul>
            </li>
        </ul>
    </div>
</nav>
</template>

<script>
export default {
    name: 'SidebarMenu',
    props: {
        isCollapsed: Boolean
    },
    data() {
        return {
            collapsedItems: [] // Tracks which menu groups are collapsed
        };
    },
    methods: {
        toggleCollapse(group) {
            if (this.collapsedItems.includes(group)) {
                this.collapsedItems = this.collapsedItems.filter(item => item !== group);
            } else {
                this.collapsedItems.push(group);
            }
        }
    }
};
</script>

<style scoped>
/* Sidebar styles */
.sidebar {
    width: 250px;
    height: 100vh;
    background-color: #343a40;
    color: white;
    padding: 10px;
    transition: width 0.3s ease;
    overflow: hidden;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 9;
}

.collapsed {
    width: 0;
    /* Completely close the sidebar */
    padding: 0;
    /* Remove padding when collapsed */
}

.nav-link {
    color: #ffffff;
}

.nav-link:hover {
    background-color: #495057;
}

.nav-item {
    margin-bottom: 10px;
}

.sidebar-content {
    margin-top: 80px;
    /* Adjust this value to ensure it is below the cross button */
}
</style>
