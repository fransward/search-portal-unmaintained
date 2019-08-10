<template>
    <div class="container-fluid search-bar-parent">
        <div class="row columns-no-gutter search-bar" :class="{ 'has-dropdown': withdropdown, 'part-of-menu': partofmenu }">
            <div class="search-bar-part search-bar-input-parent" :class="{
                'col-md-35': (partofmenu  &&  withdropdown),
                'col-md-50': (partofmenu  &&  ! withdropdown),
                'col-sm-35': ( ! partofmenu  &&  withdropdown),
                'col-sm-50': ( ! partofmenu  &&  ! withdropdown)
            }">
                <input type="text" v-model.trim="textValue" name="search_bar_input" :placeholder="inputPlaceholder" @change="setSearchQuery" @keyup="setSearchQuery" @paste="setSearchQuery">
            </div>

            <div v-show="withdropdown" class="search-bar-part search-bar-dropdown-parent" :class="{
                'col-md-15': (partofmenu),
                'col-sm-15': ( ! partofmenu),
            }">
                <select v-if="withdropdown" v-model="dropdownValue" name="search_bar_dropdown" @change="setSearchQuery">
                    <option v-for="option in searchDropdownOptions" :value="option.value">{{ option.label }}</option>
                </select>
            </div>

            <div class="search-bar-part search-bar-submit-parent" :class="{
                'col-md-10': (partofmenu),
                'col-sm-10': ( ! partofmenu),
            }">
                <button class="search-bar-submit" :class="{ image: imagebutton }" @click="goToSearch">Zoeken</button>
            </div>
        </div>

        <div v-if="withadvanced" class="dashed-bottom search-bar-advanced">
            <input type="checkbox" id="search-bar-advanced-toggle">

            <label for="search-bar-advanced-toggle">
                <span class="icon"></span>
                <h4>Geavanceerd zoeken</h4>
            </label>

            <div class="search-bar-advanced-content">
                <div class="row">
                    <div class="col-sm-30">
                        <p v-for="filter in ['formats', 'licenses']">
                            <select v-if="advancedFilters[filter]" v-model="advancedValues[advancedFilters[filter].name]" :name="'search_bar_advanced_' + advancedFilters[filter].name" @change="setSearchQuery">
                                <option value="">{{ advancedFilters[filter].title }}</option>
                                <option v-for="option in advancedFilters[filter].options" :value="option.value" :data-name="option.name">{{ option.title }}</option>
                            </select>
                        </p>
                    </div>

                    <div class="col-sm-30">
                        <p v-for="filter in ['disciplines', 'aggregations']">
                            <select v-if="advancedFilters[filter]" v-model="advancedValues[advancedFilters[filter].name]" :name="'search_bar_advanced_' + advancedFilters[filter].name" @change="setSearchQuery">
                                <option value="">{{ advancedFilters[filter].title }}</option>
                                <option v-for="option in advancedFilters[filter].options" :value="option.value" :data-name="option.name">{{ option.title }}</option>
                            </select>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        props: ['partofmenu', 'withdropdown', 'imagebutton', 'withadvanced', 'assearchfilter'],
        data() {
            return {
                textValue: '',
                dropdownValue: '',
                advancedValues: {
                    format: '',
                    license: '',
                    discipline: '',
                    aggregation: ''
                },
                searchQueries: {},
                inputPlaceholder: 'Waar ben je naar op zoek?',
                searchDropdownOptions: [
                    {value: '', label: 'Onderwijsniveau'}
                ],
                advancedFilters: {}
            };
        },
        methods: {
            setSearchQuery(event) {

                // Submit the entered text, when pressing Enter
                if(event.which == 13) {
                    if(
                        // As a search filter, an empty search term is supported
                        this.assearchfilter
                        // As a normal search bar, a value has to be given
                        ||  ( ! this.assearchfilter  &&  (this.textValue != ''  ||  this.dropdownValue != ''))
                    ) {
                        $('button.search-bar-submit').first().trigger('click');
                    }
                }

                else {
                    if( ! this.assearchfilter) {
                        // Reset the query before building it
                        this.searchQueries = {};

                        if(this.textValue != '')
                            this.searchQueries.terms = this.textValue;
                        if(this.dropdownValue != '')
                            this.searchQueries.level = this.dropdownValue;

                        // Add the advanced filters
                        $.each(this.advancedValues, (filter, value) => {
                            if(value != '') {
                                // The licenses use several option names, get it from the 'data-name' attribute
                                if(filter == 'license') {
                                    filter = $('option[value="' + value + '"]').data('name');
                                    // Also set the default CC version, if needed
                                    if(filter == 'cc')
                                        this.searchQueries.cc_version = '30';
                                }

                                // Add the search query
                                this.searchQueries[filter] = value;
                            }
                        });
                    }
                }
            },
            goToSearch(event) {
                event.preventDefault();

                // Construct the search query
                let query = '';
                $.each(this.searchQueries, (filter, value) => query += filter + '=' + encodeURIComponent(value) + '&');
                // Remove the last ampersand
                query = query.substr(0, (query.length - 1));

                if( ! this.assearchfilter  &&  query != '') {
                    // Go to the Search page
                    this.$router.push({
                        name: 'search-query',
                        params: { query }
                    });
                }
            }
        },
        mounted() {
            // When the dropdown needs to be shown, add the education levels from the API
            if(this.withdropdown) {
                Surf.api.whenReady()
                .then(() => Surf.api.terms.levels.map(level => {
                    // Concatenate the parent with children, then add them
                    [level].concat(level.children).map(levelTerm => this.searchDropdownOptions.push({
                        value: levelTerm.value,
                        label: levelTerm.title
                    }));
                }));
            }

            if(this.withadvanced) {
                // Get the advanced search filters
                Surf.api.whenReady()
                .then(() => {
                    // Set the advanced search options
                    this.advancedFilters = Surf.searchFilters.get([
                        'formats',
                        'licenses',
                        'disciplines',
                        'aggregations'
                    ], true);

                    // Remove the icons (HTML) from the license title and options
                    const removeIconRegEx = / <span.+/;
                    this.advancedFilters.licenses.title = this.advancedFilters.licenses.title.replace(removeIconRegEx, '');
                    this.advancedFilters.licenses.options = this.advancedFilters.licenses.options.map(option => {
                        option.title = option.title.replace(removeIconRegEx, '');
                        return option;
                    })
                    // Remove empty options
                    .filter(option => (option.value !== undefined));
                });
            }
        }
    }
</script>
