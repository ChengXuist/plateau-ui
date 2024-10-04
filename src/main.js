import { createApp } from 'vue';
import App from './App.vue';
import 'bootstrap-icons/font/bootstrap-icons.css';

import { createI18n } from 'vue-i18n';
import { createRouter, createWebHistory } from 'vue-router';

import HomePage from '@/components/Home/HomePage.vue';
import NavigationPage from '@/components/navigation/NavigationPage.vue';
import MapEditPage from '@/components/MapEdit/MapEditPage.vue';
import MappingAndSelection from '@/components/Mapping/MappingAndSelection.vue';

// Import language files
import en from './texts/en.json';
import fr from './texts/fr.json';
import es from './texts/es.json';
import de from './texts/de.json';
import zh from './texts/zh.json';

// Define the routes for the app
const routes = [
    { path: '/', component: HomePage },
    { path: '/navigation', component: NavigationPage },
    { path: '/map-edit', component: MapEditPage },
    { path: '/mapping-selection', component: MappingAndSelection },
];

// Create the router instance with routes and history mode
const router = createRouter({
    history: createWebHistory(),
    routes,
});
const savedLocale = localStorage.getItem('locale') || 'en';
// Initialize i18n with locale and translations
const i18n = createI18n({
    locale: savedLocale, // Default locale
    fallbackLocale: 'en', // Fallback if translation is missing
    messages: {
        en,
        fr,
        es,
        de,
        zh,
    },
});

// Create and mount the Vue app, making sure to use the router
const app = createApp(App);

// Use the router with the app instance before mounting
app.use(router);

app.use(i18n)

// Now mount the app
app.mount('#app');

