<template>
    <div class="page home">
        <app-main-menu></app-main-menu>

        <div class="container-fluid page-inner">
            <app-header :size="'large'"></app-header>

            <div class="row">
                <div class="col-xs-5 col-lg-10"></div>

                <div class="col-xs-50 col-lg-40">
                    <app-search-bar :withdropdown="true" :imagebutton="true" :withadvanced="true"></app-search-bar>
                </div>

                <div class="col-xs-5 col-lg-10"></div>
            </div>

            <div class="row">
                <div class="col-sm-37 recently-added-parent">
                    <h2>{{ titles.recentlyAdded }}</h2>

                    <div class="row columns-eq-height recently-added">
                        <div v-for="item in recentlyAdded" class="col-xs-60 col-md-30">
                            <app-product-card :product="item"></app-product-card>
                        </div>
                    </div>
                </div>

                <div class="col-sm-3"></div>

                <div class="col-sm-20 home-about">
                    <h2>{{ titles.about }}</h2>

                    <div v-html="aboutText"></div>

                    <div class="button-group">
                        <router-link :to="{ name: 'home' }" class="button">{{ aboutButtonText }}</router-link>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    // Components
    import Header from '@/components/elements/Header';
    import MainMenu from '@/components/elements/MainMenu';
    import SearchBar from '@/components/elements/SearchBar';
    import ProductCard from '@/components/elements/ProductCard';

    export default {
        components: {
            appHeader: Header,
            appMainMenu: MainMenu,
            appSearchBar: SearchBar,
            appProductCard: ProductCard
        },
        data() {
            return {
                recentlyAdded: [],
                titles: {
                    recentlyAdded: 'Onlangs toegevoegd',
                    about: 'Over het zoekportaal'
                },
                aboutText: '\
                    <p>SURF werkt aan een zoekportaal voor open leermaterialen. Dit is een eerste bèta-versie en bedoeld als demonstrator. Het zoekportaal is nog volop in ontwikkeling. We zijn benieuwd naar je feedback! Laat deze achter via: <a href="https://survey.surfnet.nl/index.php/274498">https://survey.surfnet.nl/index.php/274498</a> of neem contact op met <a href="mailto:kirsten.veelo@surfnet.nl">kirsten.veelo@surfnet.nl</a>.</p>\
                    <p>Via dit zoekportaal vind je open leermaterialen voor en door studenten en docenten uit het hoger onderwijs. Open leermaterialen zijn digitale materialen voorzien van Creative Commons licenties. Daarmee geeft de maker jou toestemming om het materiaal vrij te delen en gebruiken in je eigen onderwijs. Dit zoekportaal wordt aangeboden door SURF in samenwerking met hogeronderwijsinstellingen die hun collecties met leermaterialen ontsluiten.</p>',
                aboutButtonText: 'Hoe werkt het?'
            }
        },
        mounted() {
            /*
            $.when(Surf.vendors.enableAutocomplete($('div.search-bar')))
            // Go to the product page with the selected option
            .then((chosen) => this.$router.push({
                name: 'product',
                params: {
                    name: chosen
                }
            }));
            //*/

            // Add the recently added materials to the page
            Surf.apiHelper.getRecentlyAdded()
            .then(materials =>
                materials.forEach(material => this.recentlyAdded.push(Surf.apiHelper.formatProduct(material)))
            );
        }
    };
</script>
