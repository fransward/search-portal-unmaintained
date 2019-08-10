import Vue from 'vue';
import VueRouter from 'vue-router';

import Home from '@/components/pages/Home';
import Author from '@/components/pages/Author';
import Discover from '@/components/pages/Discover';
import Product from '@/components/pages/Product';
import Search from '@/components/pages/Search';

Vue.use(VueRouter);

export default new VueRouter({
    scrollBehavior(to, from, savedPosition) {
        // Scroll to top on page change
        return {
            x: 0,
            y: 0
        };
    },
    routes: [
        {
            path: '/',
            name: 'home',
            component: Home
        },
        {
            path: '/author/:id',
            name: 'author',
            component: Author
        },
        {
            path: '/discover',
            name: 'discover',
            component: Discover
        },
        {
            path: '/product/:id',
            name: 'product',
            component: Product
        },
        {
            path: '/search',
            name: 'search',
            component: Search
        },
        {
            path: '/search/:query',
            name: 'search-query',
            component: Search
        }
    ]
});
