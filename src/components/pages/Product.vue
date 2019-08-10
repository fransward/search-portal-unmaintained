<template>
    <div class="page product">
        <app-main-menu :withsearchbar="true"></app-main-menu>

        <div class="container-fluid page-inner">
            <app-header :size="'small'"></app-header>

            <div class="row product-info-parent">
                <div class="col-md-15 product-author">
                    <div>
                        <div class="product-type">
                            <img v-if="meta.icon" :src="meta.icon">
                            <strong v-if="meta.type">{{ meta.type.human }}</strong>
                        </div>

                        <div class="dashed-bottom product-author-info">
                            <h4 v-if="meta.author">
                                <router-link :to="{ name: 'author', params: { id: meta.author.name } }">
                                    {{ meta.author.name }}
                                </router-link>
                            </h4>

                            <p v-if="meta.author">{{ meta.author.institutes.join(', ') }}</p>

                            <div v-if="meta.author" class="row product-author-institute-logos">
                                <img v-for="logo in meta.author.instituteLogos" :src="logo">
                            </div>
                        </div>

                        <div v-if="meta.author  &&  meta.author.contributors.length" class="product-contributors">
                            <p class="strong">Bijdrage</p>
                            <p v-for="name in meta.author.contributors">
                                <a href="#">{{ name }}</a>
                            </p>
                        </div>

                        <div class="product-meta">
                            <p>
                                <span class="strong">Publicatiedatum</span><br>
                                {{ meta.date }}
                            </p>

                            <p>
                                <span class="strong">Bestandsformaat</span><br>
                                <span v-if="meta.type">{{ meta.type.format }}</span>
                            </p>

                            <p>
                                <span class="strong">Leerniveau</span><br>
                                <span v-if="meta.levels">{{ meta.levels.join(', ') }}</span>
                            </p>

                            <p class="strong">Tags</p>
                            <p>
                                <a v-for="tag in meta.tags" class="product-tag" href="#" @click="goToSearch" :data-tag="tag">{{ tag }}</a>
                            </p>
                        </div>
                    </div>
                </div>

                <div class="col-md-5"></div>

                <div class="col-md-40 product-info">
                    <div class="dashed-bottom product-info-header">
                        <div class="text-right product-licenses-download">
                            <div v-if="meta.licenses" class="product-licenses text-left">
                                <span v-for="license in meta.licenses" class="license-text" v-html="license.title"></span><br>
                                <span v-for="license in meta.licenses" class="license-icon" :class="'icon icon-cc-' + license.value"></span>
                            </div>

                            <a class="button image product-download" :href="meta.downloadLink" target="_blank">
                                <span class="icon icon-download"></span>
                                Download
                            </a>
                        </div>

                        <div class="product-title">
                            <h3>{{ meta.title }}</h3>
                        </div>
                    </div>

                    <div class="dashed-bottom product-description">
                        <h4>Omschrijving</h4>

                        <p>{{ meta.description }}</p>
                    </div>

                    <div class="dashed-bottom product-description">
                        <h4>Copyright</h4>

                        <p>{{ meta.copyright || 'Geen specifieke copyright informatie beschikbaar.' }}</p>
                    </div>

                    <!--
                    <div class="dashed-bottom product-description">
                        <h4>Bronnen</h4>

                        <a v-for="source in meta.sources" :href="source" target="_blank">
                            <span class="icon icon-link"></span>
                            {{ source }}
                        </a>
                    </div>
                    -->

                    <a class="button image product-download" :href="meta.downloadLink" target="_blank">
                        <span class="icon icon-download"></span>
                        Download
                    </a>
                </div>
            </div>

            <div v-if="relatedProducts.length" class="related-products-parent">
                <h4>Gerelateerde leermaterialen</h4>

                <div class="row columns-eq-height">
                    <div v-for="item in relatedProducts" class="col-xs-60 col-sm-30 col-lg-15 related-product">
                        <app-product-card :product="item"></app-product-card>
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
    import ProductCard from '@/components/elements/ProductCard';

    export default {
        components: {
            appHeader: Header,
            appMainMenu: MainMenu,
            appProductCard: ProductCard,
        },
        data() {
            return {
                meta: {},
                relatedProducts: []
            }
        },
        methods: {
            // Clicking on a tag goes the the Search page
            // With the tag as a search term
            goToSearch(event) {
                event.preventDefault();
                
                // Go to the Search page
                this.$router.push({
                    name: 'search-query',
                    params: {
                        query: 'terms=' + encodeURIComponent($(event.target).data('tag'))
                    }
                });
            }
        },
        mounted() {
            // Get the product information
            Surf.apiHelper.getProduct(this.$route.params.id)
            .then(product => {
                this.meta = Surf.apiHelper.formatProduct(product);

                // Get products related to this one
                return Surf.apiHelper.getRelatedProducts(product);
            })
            .then(relatedProducts => {
                if(relatedProducts !== undefined)
                    relatedProducts.map(product => this.relatedProducts.push(Surf.apiHelper.formatProduct(product)));
            });
        }
    }
</script>
