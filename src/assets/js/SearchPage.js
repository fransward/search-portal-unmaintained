export default function(vueInstance) {
    const self = this;

    /**
     * The Vue instance that created this object
     * @type Object
     */
    self.vueInstance = vueInstance;

    /**
     * The selector for the filter parents
     * Can't do this at object creation time, because search filters have to be set first
     * @type String
     */
    self.filterParentsSelector = 'div.search-filter-options';

    /**
     * The selector for the button that shows options that are initially hidden
     * @type String
     */
    self.showMoreButtonSelector = 'a.show-more-options';

    /**
     * The filters that are added on the search page
     * @type Array
     */
    self.filters = [];

    /**
     * The timeout that delays the query, and the time for it
     * @type Timout|Number
     */
    self.queryTimeout = null;
    self.queryTimeoutTime = 1000;



    /**
     * Enable the select all mechanism
     * @return void
     */
    self.enableSelectAll = () => {
        // Each doesn't loop when length is 0
        $(self.filterParentsSelector).each(function(index, parent) {
            const $parent = $(parent);
            const $childCheckboxes = $parent.find('li').find('ul').has('li').find('input[type="checkbox"]');
            const $selectAllParents = $childCheckboxes.closest('ul').closest('li');

            // The callback that toggles the children of a select-all checkbox
            const toggleSelectAll = ($selectAll, propagate = true) => {
                if(propagate) {
                    $selectAll
                        .closest('li')
                        .find('ul')
                        .find('input[type="checkbox"]')
                        // Apply the 'checked' state to all other checkboxes with the same parent
                        .prop('checked', $selectAll.prop('checked'))
                        // Needed for Vue to pick up the change
                        .each((index, checkbox) => checkbox.dispatchEvent(new Event('change')));
                }
            };

            // The 'select all' toggling mechanism
            $selectAllParents.each((index, parent) => {
                // The 'select all' checkbox is the first one, the next ones are the children
                const $selectAll = $(parent).find('input[type="checkbox"]').first();

                // Toggle at page load, but only if checked
                // Because a checked child checkbox state would be unchecked if the select-all checkbox is unchecked
                if($selectAll.prop('checked'))
                    toggleSelectAll($selectAll, true);

                // Toggle on change event
                $selectAll.get(0).addEventListener('change', event => {
                    // Only propagate the change event to children,
                    // if it wasn't the children that triggered the change event
                    const propagate = (event.detail  &&  ! event.detail.dontPropagate);
                    toggleSelectAll($selectAll, propagate);
                });
            });

            // When child checkbox change, see if their 'select all' checkbox needs to be checked
            $childCheckboxes.on('change', event => {
                const $checkbox = $(event.target);
                const $parent = $checkbox.closest('ul');
                const $selectAll = $parent.closest('li').find('input[type="checkbox"]').first();

                // Continue if the clicked checkbox has a parent 'select all' checkbox
                if($selectAll.length) {
                    // Find all the unchecked checkboxes, excluding 'select all'
                    const $uncheckedCheckboxes = $parent.find('input[type="checkbox"]').filter(':not(:checked)');

                    const changeEvent = new CustomEvent('change', {
                        detail: {
                            // This prevents the 'select all' checkbox from changing the children again
                            // Which would cause an infinite loop
                            dontPropagate: true
                        }
                    });

                    // If there are no unchecked checkboxes, check 'select all', otherwise uncheck it
                    $selectAll
                        .prop('checked', ($uncheckedCheckboxes.length < 1))
                        // Needed for Vue to pick up the change
                        .get(0)
                        .dispatchEvent(changeEvent);
                }
            });
        });
    };



    /**
     * Enable the clear all mechanism
     */
    self.enableClearAll = () => {
        $('div.search-filters-clear').find('a').on('click', event => {
            event.preventDefault();

            // Uncheck all the checkboxes
            $(self.filterParentsSelector).each((index, parent) => {
                // Also trigger the change event, because the query needs to be updated
                $(parent)
                    .find('input[type="checkbox"]')
                    .prop('checked', false)
                    .trigger('change')
                    // Needed for Vue to pick up the change
                    .each((index, checkbox) => checkbox.dispatchEvent(new Event('change')));
            });
        });
    };



    /**
     * Show options that are initially hidden
     */
    self.enableShowMore = () => {
        $(self.showMoreButtonSelector).each((index, button) => {
            const $button = $(button);

            // Set the button text, based on its status
            const texts = $button.data('texts');
            const status = $button.data('status');
            $button.html(texts[status]);

            $button.on('click', event => {
                event.preventDefault();

                const status = $button.data('status');

                // Expand if collapsed, and vice versa
                if(status == 'collapsed') {
                    $button
                        .html(texts.expanded)
                        .data('status', 'expanded')
                        .attr('data-status', 'expanded')
                        .prev('ul')
                        .find('li.show-more-only')
                        .show();
                } else {
                    $button
                        .html(texts.collapsed)
                        .data('status', 'collapsed')
                        .attr('data-status', 'collapsed')
                        .prev('ul')
                        .find('li.show-more-only')
                        .hide();
                }
            });
        });
    };



    /**
     * Get the list of search filters
     * @param  Object|undefined  preSelect  A query given through the URL
     * @return Array
     */
    self.getFilters = (preSelect) => {
        const defer = $.Deferred();

        Surf.api.whenReady()
        .then(() => {
            // Keep a reference to the filters
            // Used by whenFiltersSet() to see if they are added to the DOM
            self.filters = Surf.searchFilters.get([
                'levels',
                'formats',
                'disciplines',
                'aggregations',
                'licenses',
                'languages'
            ], false, preSelect);

            defer.resolve(self.filters);
        });

        return defer;
    };



    /**
     * After setting the filters, the DOM needs to update
     * This polls for the DOM being updated
     * @resolve  void
     * @return   Promise
     */
    self.whenFiltersSet = () => {
        const defer = $.Deferred();

        const checkInterval = setInterval(() => {
            // See if the filters are added to the DOM
            // By checking for the toggler of the first filter
            if(self.filters.length) {
                if($('input#' + self.filters[0].name + '_toggle').length) {
                    clearInterval(checkInterval);
                    defer.resolve();
                }
            }
        }, 10);

        return defer;
    };



    /**
     * Perform the query, based on everything on the search page
     * @resolve  Array    Search results
     * @return   Promise
     */
    self.doQuery = () => {
        const defer = $.Deferred();

        Surf.api.whenReady()
        .then(() => {
            // Get the maximum amount, which is the current page limit (6, 12, ...)
            const maximumRecords = self.vueInstance.getCurrentPageLimit();

            // Get the current start record number
            // Example:
            // max 12, page 1 = start at 1
            // max 12, page 2 = start at 13
            const currentPage = self.vueInstance.getCurrentPage() - 1;
            const startRecord = (currentPage * maximumRecords) + 1;

            // Construct the languages query
            let languages = [];
            $('input[name="language"]:checked').each((index, checkbox) => {
                const uppercaseValue = Surf.utilities.uppercaseFirst($(checkbox).val());
                const languageQuery = Surf.api.defaultQueries['language' + uppercaseValue];
                if(languageQuery !== null)
                    languages.push(languageQuery);
            });
            // Join the selected languages with OR
            if(languages.length)
                languages = '(' + languages.join(' OR ') + ')';
            // Default is both Dutch and English
            else
                languages = Surf.api.defaultQueries.languageNlEn;

            // Construct the education levels query
            let levels = [];
            $('input[name="level"]:checked').each((index, checkbox) => levels.push($(checkbox).val()));
            levels = levels.length
                ? '(' + levels.map(
                        level => Surf.api.vocabulary.level + ' exact "' + level + '"'
                    ).join(' OR ') + ')'
                : Surf.api.defaultQueries.levels;

            // Construct the formats query
            const formats = [];
            $('input[name="format"]:checked').each((index, checkbox) => formats.push($(checkbox).val()));

            // Set the date range query
            const dateRange = '(' + Surf.api.vocabulary.date + ' >= "' + self.vueInstance.searchFilterDate.from + '"'
                + ' AND ' + Surf.api.vocabulary.date + ' <= "' + self.vueInstance.searchFilterDate.to + '")';

            // Construct the disciplines query
            let disciplines = [];
            $('input[name="discipline"]:checked').each((index, checkbox) => disciplines.push($(checkbox).val()));
            disciplines = disciplines.length
                ? ' AND (' + disciplines.map(
                        discipline => Surf.api.vocabulary.discipline + ' exact "' + discipline + '"'
                    ).join(' OR ') + ')'
                : '';

            // Construct the aggregations query
            let aggregations = [];
            $('input[name="aggregation"]:checked').each((index, checkbox) => aggregations.push($(checkbox).val()));
            aggregations = aggregations.length
                ? ' AND (' + aggregations.map(
                        aggregation => Surf.api.vocabulary.aggregation + ' exact "' + aggregation + '"'
                    ).join(' OR ') + ')'
                : '';

            // Construct the licenses query
            let licenses = [];
            const $restrictedLicense = $('input[name="cc_restricted"]:checked');
            if($restrictedLicense.length)
                licenses.push($restrictedLicense.val());
            // Construct the license string for the query
            const $licenseNames = $('input[name="cc"]:checked');
            const $licenseVersions = $('input[name="cc_version"]:checked');
            // License names and versions must both be set, if one of them is selected
            if($licenseNames.length  &&  $licenseVersions.length) {
                let licenseNamesString = [];
                $licenseNames.each((index, checkbox) => licenseNamesString.push($(checkbox).val()));
                // Licenses are joined alphabetically
                licenseNamesString = licenseNamesString.sort().join('-');

                // Then add the version at the end, as a separate string per version
                $licenseVersions.each((index, checkbox) => licenses.push('cc-' + licenseNamesString + '-' + $(checkbox).val()));
            }
            licenses = licenses.length
                ? ' AND (' + licenses.map(
                        license => Surf.api.vocabulary.license + ' exact "' + license + '"'
                    ).join(' OR ') + ')'
                : '';

            // Set the search terms query
            let searchTerms = $('input[name="search_bar_input"]').val();
            if(searchTerms != '')
                searchTerms = ' AND ("' + searchTerms + '")';

            // Get the results based on the query, newest first
            return Surf.api.call({
                query: encodeURI(
                    'edurep'
                    + ' AND ' + Surf.api.defaultQueries.endUsers
                    + ' AND ' + Surf.api.defaultQueries.costs
                    + ' AND ' + languages
                    + ' AND ' + levels
                    + ' AND ' + dateRange
                    + disciplines
                    + aggregations
                    + licenses
                    + searchTerms
                ),
                startRecord,
                maximumRecords,
                technicalFormats: formats.join(','),
                sort: 1
            }, true);
        })
        .then(response => defer.resolve(response));

        return defer;
    };



    /**
     * Do a new query, when parameters change on the page
     */
    self.enableUpdateQuery = () => {
        // The pagination and page limit buttons
        $('div.pagination-buttons').on('click', 'a', self.filterChanged);
        $('div.page-limit-parent').on('change', 'input[name="page_limit"]', self.filterChanged);

        // The search filter checkboxes and date pickers
        $(self.filterParentsSelector).find('input[type="checkbox"]')
            .add('input.search-filter-date-from,  input.search-filter-date-to')
            .on('change', self.filterChanged);

        // The search bar submit button
        $('button.search-bar-submit').on('click', self.filterChanged);
    };



    /**
     * Callback for enableUpdateQuery()
     * Stored for memory preserving
     */
    self.filterChanged = event => {
        clearTimeout(self.queryTimeout);

        // Do the query after a delay, to stress the API less
        // Because someone can change multiple options
        self.queryTimeout = setTimeout(() => {
            self.doQuery().then(self.vueInstance.updateResults);
        }, self.queryTimeoutTime);
    };
};
