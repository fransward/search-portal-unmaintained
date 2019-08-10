<template>
    <div class="page search">
        <app-main-menu></app-main-menu>

        <div class="container-fluid page-inner">
            <app-header :size="'small'"></app-header>

            <div class="row">
                <div class="col-xs-5 col-lg-10"></div>

                <div class="col-xs-50 col-lg-40">
                    <app-search-bar :imagebutton="true" :assearchfilter="true"></app-search-bar>
                </div>

                <div class="col-xs-5 col-lg-10"></div>
            </div>

            <input type="checkbox" class="page-overlay-trigger" id="search-filters-trigger">

            <label for="search-filters-trigger" class="hidden-md hidden-lg search-filters-trigger-button" @click="scrollToTop">
                <span class="icon icon-funnel"></span>
                Filteren
            </label>

            <label for="search-filters-trigger" class="hidden-md hidden-lg page-overlay"></label>

            <div class="row search-header">
                <div class="col-sm-30">
                    <h2>Resultaten ({{ totalAmount }})</h2>
                </div>

                <div class="col-sm-30 text-right">
                    <a class="change-view-type" href="#" @click="toggleViewType" :data-type="viewType">
                        <span class="cardview">
                            <span class="icon icon-listview"></span>
                            Lijstweergave
                        </span>

                        <span class="listview">
                            <span class="icon icon-cardview"></span>
                            Kaartweergave
                        </span>
                    </a>
                </div>
            </div>

            <div class="row search-filters-results-parent">
                <div class="col-md-15 page-overlay-content search-filters">
                    <div class="row">
                        <div class="col-xs-30">
                            <h3>Filteren</h3>
                        </div>

                        <div class="col-xs-30 text-right search-filters-clear">
                            <a href="#">
                                <span class="icon icon-funnel"></span>
                                Wis selectie
                            </a>
                        </div>
                    </div>

                    <div v-for="filter in searchFilters" class="search-filter">
                        <input type="checkbox" class="search-filter-toggle" :id="filter.name + '_toggle'" checked>

                        <div class="search-filter-title">
                            <label :for="filter.name + '_toggle'" class="pull-right search-filter-toggle-button">
                                <span class="icon"></span>
                            </label>

                            <span v-html="filter.title"></span>
                        </div>

                        <div class="search-filter-options">
                            <ul>
                                <li v-for="(option, index) in filter.options" :class="{ 'show-more-only': (index > 6) }">
                                    <label>
                                        <input type="checkbox" :name="option.name || filter.name" :value="option.value" v-model="option.checked">
                                        <span v-html="option.title"></span>
                                        <span v-if="option.count">({{ option.count }})</span>
                                    </label>

                                    <ul v-if="option.options">
                                        <li v-for="suboption in option.options">
                                            <label>
                                                <input type="checkbox" :name="suboption.name || option.name || filter.name" :value="suboption.value" v-model="suboption.checked">
                                                {{ suboption.title }}
                                                <span v-if="option.count">({{ suboption.count }})</span>
                                            </label>
                                        </li>
                                    </ul>
                                </li>
                            </ul>

                            <a v-if="filter.options.length > 6" class="show-more-options" href="#"
                                data-status="collapsed"
                                data-texts='{
                                    "collapsed": "Bekijk meer",
                                    "expanded": "Bekijk minder"
                            }'></a>
                        </div>
                    </div>

                    <div class="search-filter">
                        <input type="checkbox" class="search-filter-toggle" id="publicatiedatum_toggle" checked>

                        <div class="search-filter-title">
                            <label for="publicatiedatum_toggle" class="pull-right search-filter-toggle-button">
                                <span class="icon icon-minus"></span>
                            </label>

                            Publicatiedatum
                        </div>

                        <div class="search-filter-options">
                            Vanaf
                            <div class="search-filter-datepicker">
                                <span class="icon icon-calendar"></span>
                                <flatpickr class="search-filter-date-from" v-model="searchFilterDate.from" :config="searchFilterDate.config" placeholder="Selecteer datum"></flatpickr>
                            </div>

                            Tot
                            <div class="search-filter-datepicker">
                                <span class="icon icon-calendar"></span>
                                <flatpickr class="search-filter-date-to" v-model="searchFilterDate.to" :config="searchFilterDate.config" placeholder="Selecteer datum"></flatpickr>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-md-2"></div>

                <div class="col-md-43 search-results" :class="viewType">
                    <div class="row columns-eq-height">
                        <div class="col-xs-60 col-sm-30 col-lg-20 search-result-item" v-for="item in searchResults">
                            <app-product-card :type="viewType" :product="item"></app-product-card>
                        </div>
                    </div>

                    <div class="row pagination-parent">
                        <div class="col-sm-30 pagination-buttons">
                            <span class="pagination-buttons-top-spacer">&nbsp;</span><br>

                            <vue-paginate-al :currentPage="currentPage" :totalPage="paginationPages" nextText="" prevText="" @btnClick="updateCurrentPageNumber"></vue-paginate-al>
                        </div>

                        <div class="col-sm-30 page-limit-parent">
                            <span class="page-limit-title">Aantal items per pagina</span><br>

                            <div v-for="(limit, index) in pageLimits" class="page-limit-button-parent">
                                <input type="radio" v-model="currentPageLimit" :id="'page-limit-' + index" name="page_limit" :value="limit" :checked="limit == defaultPageLimit">
                                <label :for="'page-limit-' + index">{{ limit }}</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    // Components
    import Flatpickr from 'vue-flatpickr-component';
    import FlatpickrLocale from 'flatpickr/dist/l10n/nl';
    import Header from '@/components/elements/Header';
    import MainMenu from '@/components/elements/MainMenu';
    import ProductCard from '@/components/elements/ProductCard';
    import SearchBar from '@/components/elements/SearchBar';
    import VuePaginateAl from 'vue-paginate-al';

    // Custom objects
    import SearchPage from '@/assets/js/SearchPage';

    export default {
        components: {
            appHeader: Header,
            appMainMenu: MainMenu,
            appProductCard: ProductCard,
            appSearchBar: SearchBar,
            flatpickr: Flatpickr,
            vuePaginateAl: VuePaginateAl
        },
        data() {
            return {
                viewType: 'card',
                searchFilterDate: {
                    config: {
                        altInput: true,
                        altFormat: 'j F Y',
                        dateFormat: 'Ymd',
                        locale: FlatpickrLocale[Surf.i18n.locale.short]
                    },
                    // Starting range is now minus half a year
                    from: Date.now() - (183 * 24 * 60 * 60 * 1000),
                    to: Date.now()
                },
                searchFilters: [],
                searchResults: [],
                totalAmount: 0,
                pageLimits: [6, 12, 24, 48],
                defaultPageLimit: 12,
                currentPageLimit: 12,
                paginationPages: 0,
                currentPage: 1
            };
        },
        methods: {
            updateCurrentPageNumber(pageNumber) {
                this.currentPage = pageNumber;
            },
            toggleViewType(event) {
                event.preventDefault();

                // Toggle the view type
                if(this.viewType == 'card')
                    this.viewType = 'list';
                else if(this.viewType == 'list')
                    this.viewType = 'card';
            },
            updateResults(response) {
                // Handle an empty response
                if(response.search.constructor === Array  &&  response.search.length < 1) {
                    this.totalAmount = 0;
                    this.searchResults = [];
                    this.paginationPages = 0;
                }

                // Handle a response with data
                else {
                    // Set the total amount of found results (not influenced by maximumRecords)
                    this.totalAmount = Surf.i18n.formatNumber(response.search.recordcount);

                    // Set the search results for updating the page
                    this.searchResults = response.search.records.map(product => Surf.apiHelper.formatProduct(product));

                    // Define the amount of pagination buttons
                    this.paginationPages = Math.ceil(response.search.recordcount / this.currentPageLimit);
                }
            },
            getCurrentPage() {
                return this.currentPage;
            },
            getCurrentPageLimit() {
                return this.currentPageLimit;
            },
            scrollToTop() {
                $('html, body').scrollTop(0);
            }
        },
        mounted() {
            const searchPage = new SearchPage(this);

            // Get a query from the URL, if there is any
            const urlQuery = Surf.utilities.parseQueryString(this.$route.params.query);

            // Update the search field, if a value is given
            if(urlQuery.terms)
                $('input[name="search_bar_input"]').val(urlQuery.terms);

            $.when(searchPage.getFilters(urlQuery))
                .then(filters => this.searchFilters = filters)
                // Wait for the filters to be added to the DOM, before continuing
                .then(searchPage.whenFiltersSet())
                .then(() => {
                    searchPage.enableSelectAll();
                    searchPage.enableClearAll();
                    searchPage.enableShowMore();
                    searchPage.enableUpdateQuery();

                    return searchPage.doQuery();
                })
                .then(this.updateResults);

            // Surf.vendors.enableAutocomplete($('div.search-bar'));
        }
    };
</script>
