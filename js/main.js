import routes from './routes.js';
import { changeList } from './content.js';

export const store = Vue.reactive({
    dark: JSON.parse(localStorage.getItem('dark')) || false,
    toggleDark() {
        this.dark = !this.dark;
        localStorage.setItem('dark', JSON.stringify(this.dark));
    },
});

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