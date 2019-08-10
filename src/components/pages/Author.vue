<template>
    <div class="page author">
        <app-main-menu :withsearchbar="true"></app-main-menu>

        <div class="container-fluid page-inner">
            <app-header :size="'small'"></app-header>

            <div class="row">
                <div class="col-xs-5"></div>

                <div class="col-xs-50">
                    <div class="row author-info-parent">
                        <div class="col-sm-30">
                            <div class="author-info">
                                <h3>{{ meta.name }}</h3>
                                <h4>{{ meta.institutes.join(', ') }}</h4>
                            </div>
                        </div>

                        <div class="col-sm-30 author-institute-logos">
                            <img v-for="logo in meta.instituteLogos" :src="logo">
                        </div>
                    </div>
                </div>

                <div class="col-xs-5"></div>
            </div>

            <div class="row">
                <div class="col-sm-5"></div>

                <div class="col-sm-50">
                    <div class="author-products-title">
                        <h4>Gedeelde leermaterialen ({{ totalProducts }})</h4>
                    </div>

                    <div class="row columns-eq-height author-products">
                        <div v-for="item in products" class="col-xs-60 col-sm-30 col-lg-15">
                            <app-product-card :product="item"></app-product-card>
                        </div>
                    </div>
                </div>

                <div class="col-sm-5"></div>
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
                meta: {
                    name: null,
                    institutes: []
                },
                totalProducts: 0,
                maxProducts: 12,
                products: []
            }
        },
        mounted() {
            // Set the author name
            this.meta.name = decodeURIComponent(this.$route.params.id);

            Surf.api.whenReady()
            .then(() => {
                return Surf.apiHelper.getAuthorInfo(this.$route.params.id, this.maxProducts);
            })
            .then(response => {
                // Handle an empty response
                if(response.search.constructor === Array  &&  response.search.length < 1) {
                    this.totalProducts = 0;
                    this.products = [];
                }

                else {
                    // Set the total amount of materials of this author
                    this.totalProducts = Surf.i18n.formatNumber(response.search.recordcount);
                    // Notify the user of the limited result set
                    if(response.search.recordcount > this.maxProducts)
                        this.totalProducts += ', ingekort tot ' + this.maxProducts;

                    // Set the products of this author
                    this.products = response.search.records.map(product => Surf.apiHelper.formatProduct(product));

                    // Set the institutes array
                    for(let i=-1;  ++i<response.search.records.length;) {
                        const record = response.search.records[i];
                        if(record.publisher.name.length) {
                            // Add the publisher name(s), if not existing yet
                            record.publisher.name.forEach(publisher => {
                                if($.inArray(publisher, this.meta.institutes) < 0)
                                    this.meta.institutes.push(publisher);
                            });
                        }
                    }
                }
            });
        }
    };
</script>
