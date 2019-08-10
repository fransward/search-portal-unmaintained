<template>
    <div class="page discover">
        <app-main-menu :withsearchbar="true"></app-main-menu>

        <div class="container-fluid page-inner">
            <app-header :size="'small'"></app-header>

            <app-discover-links></app-discover-links>
        </div>
    </div>
</template>

<script>
    // Components
    import DiscoverLinks from '@/components/elements/DiscoverLinks';
    import Header from '@/components/elements/Header';
    import MainMenu from '@/components/elements/MainMenu';

    export default {
        components: {
            appDiscoverLinks: DiscoverLinks,
            appHeader: Header,
            appMainMenu: MainMenu
        }
    };
</script>
