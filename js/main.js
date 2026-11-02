import routes from './routes.js';
import { changeList } from './content.js';

export const store = Vue.reactive({
    dark: JSON.parse(localStorage.getItem('dark')) || false,
    toggleDark() {
        this.dark = !this.dark;
        localStorage.setItem('dark', JSON.stringify(this.dark));
    },
});

// Scale the whole site so it always looks like it does on a 1920x1080 screen.
// The layout is designed for 1920px wide; on any other width, zoom everything
// by the ratio so proportions stay identical.
const DESIGN_WIDTH = 1920;

function applyZoom() {
    document.documentElement.style.zoom = window.innerWidth / DESIGN_WIDTH;
}

applyZoom();
window.addEventListener("resize", applyZoom);

const app = Vue.createApp({
    data: () => ({ store }),
});
const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes,
});

router.afterEach((to) => {
    changeList(to.path === "/upcoming" ? "ul" : "dl");
});

app.use(router);

app.mount('#app');