<template>
    <div id="main">
        <router-view :key="$route.fullPath"></router-view>

        <app-footer></app-footer>
    </div>
</template>

<script>
    import Vue from 'vue';

    // Components
    import Footer from '@/components/elements/Footer';

    export default {
        components: {
            appFooter: Footer
        }
    };
</script>

<style lang="scss">
    @import 'assets/sass/app';
</style>
