<template>
    <header :class="'size-' + size" :style="{ backgroundImage: 'url(' + image + ')' }">
        <div class="header-content">
            <p class="text-center">Dit zoekportaal is in ontwikkeling. Deze bèta-versie is bedoeld als demonstrator.</p>

            <h1 class="text-center">{{ totalCount }} leermaterialen vrij doorzoekbaar</h1>

            <div class="container-fluid">
                <div class="row">
                    <div class="col-sm-1 col-lg-5"></div>

                    <div class="col-sm-58 col-lg-50">
                        <div class="row usps">
                            <div v-for="usp in usps" class="col-sm-20 usp-item">
                                <span class="icon icon-check"></span>
                                {{ usp }}
                            </div>
                        </div>
                    </div>

                    <div class="col-sm-1 col-lg-5"></div>
                </div>
            </div>
        </div>
    </header>
</template>

<script>
    export default {
        props: ['size'],
        data() {
            return {
                totalCount: 0,
                image: require('@/assets/img/header-background.png'),
                usps: [
                    'Presentaties, kennisclips en meer',
                    'Vrij te gebruiken en aan te passen',
                    'Inspiratie op jouw vakgebied'
                ]
            }
        },
        mounted() {
            if(this.size == 'large') {
                // Get the total amount of materials
                Surf.apiHelper.getTotalCount()
                .then((count) => this.totalCount = count);
            }
        }
    };
</script>
