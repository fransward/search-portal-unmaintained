<template>
    <div class="container-fluid discover-links">
        <div class="row">
            <div class="col-sm-8"></div>

            <div class="col-sm-44">
                <h3>Gewoon even rondkijken? Maak hieronder een keuze en ontdek nieuwe leermaterialen</h3>

                <div class="row">
                    <div class="col-sm-14">
                        <h4>Opleidingsniveau</h4>

                        <ul :class="{ 'as-columns': (levels.length > 5) }">
                            <li v-for="level in levels">
                                <router-link :to="{ name: 'search-query', params: { query: 'level='+level.value } }">
                                    {{ level.title }}
                                </router-link>
                            </li>
                        </ul>
                    </div>

                    <div class="col-sm-23">
                        <h4>Materiaaltype</h4>

                        <ul :class="{ 'as-columns': (formats.length > 5) }">
                            <li v-for="format in formats">
                                <router-link :to="{ name: 'search-query', params: { query: 'format='+format.value } }">
                                    {{ format.title }}
                                </router-link>
                            </li>
                        </ul>
                    </div>

                    <div class="col-sm-23">
                        <h4>Gebruiksrechten</h4>

                        <ul :class="{ 'as-columns': (licenses.length > 5) }">
                            <li v-for="license in licenses">
                                <router-link :to="{ name: 'search-query', params: {
                                    query: license.name+'='+license.value + '&cc_version=30'
                                } }">
                                    <span v-html="license.title"></span>
                                </router-link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div class="col-sm-8"></div>
        </div>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                hideTimeout: null,
                levels: [],
                formats: [],
                licenses: []
            }
        },
        mounted() {
            Surf.api.whenReady()
            .then(() => {
                // Add links to the element
                Surf.api.terms.levels.map(level => this.levels.push(level));
                Surf.api.terms.formats.map(format => this.formats.push(format));
                Surf.api.terms.licenses.map(license => {
                    if(license.name != 'cc_all_versions')
                        this.licenses.push(license)
                });
            });
        }
    };
</script>
