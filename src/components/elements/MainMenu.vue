<template>
    <div class="container-fluid main-menu-parent">
        <input type="checkbox" class="page-overlay-trigger" id="mobile-menu-trigger">

        <nav class="row page-overlay-content main-menu" :class="{ 'columns-no-gutter': withsearchbar }">
            <div :class="{'col-md-35': withsearchbar}">
                <ul>
                    <li class="hidden-xs hidden-sm">
                        <router-link :to="{ name: 'home' }">
                            <img :src="logo">
                        </router-link>
                    </li>

                    <li class="has-submenu" @mouseenter="showSubmenu" @mouseleave="hideSubmenu">
                        <router-link :to="{ name: 'discover' }">
                            Ontdekken
                        </router-link>
                    </li>

                    <li>
                        <router-link :to="{ name: 'home' }">
                            Hoe werkt het?
                        </router-link>
                    </li>
                </ul>
            </div>

            <div v-if="withsearchbar" class="col-md-25">
                <app-search-bar :partofmenu="true" :imagebutton="false"></app-search-bar>
            </div>
        </nav>

        <div v-show="submenu.visible" class="hidden-xs hidden-sm sub-menu-parent" @mouseenter="showSubmenu" @mouseleave="hideSubmenu">
            <app-discover-links></app-discover-links>
        </div>

        <div class="hidden-md hidden-lg mobile-menu-spacer"></div>

        <label for="mobile-menu-trigger" class="hidden-md hidden-lg page-overlay"></label>

        <div class="row hidden-md hidden-lg mobile-menu-header">
            <div class="col-xs-10 mobile-menu-trigger-parent">
                <label for="mobile-menu-trigger">
                    <span class="icon icon-listview"></span>
                </label>
            </div>

            <div class="col-xs-40 mobile-menu-header-logo">
                <router-link :to="{ name: 'home' }">
                    <img :src="logo">
                </router-link>
            </div>

            <div class="col-xs-10">
            </div>
        </div>
    </div>
</template>

<script>
    // Components
    import DiscoverLinks from '@/components/elements/DiscoverLinks';
    import SearchBar from '@/components/elements/SearchBar';

    export default {
        components: {
            appDiscoverLinks: DiscoverLinks,
            appSearchBar: SearchBar
        },
        props: ['withsearchbar'],
        data() {
            return {
                logo: require('@/assets/img/surf-logo.png'),
                submenu: {
                    visible: false,
                    hideTimeout: null
                }
            }
        },
        methods: {
            showSubmenu() {
                // Clear the timeout, because otherwise it will still close
                clearTimeout(this.submenu.hideTimeout);
                this.submenu.visible = true;
            },
            hideSubmenu() {
                // Clear the timeout first, to prevent stacking
                clearTimeout(this.submenu.hideTimeout);
                this.submenu.hideTimeout = setTimeout(() => {
                    this.submenu.visible = false;
                }, 300);
            }
        }
    };
</script>
