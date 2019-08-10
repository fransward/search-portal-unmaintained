export default function() {
    const self = this;



    /**
     * Get a list of search filters, in order of the specified names in the array
     * @param  Array|String      names      If omitted, all filters are returned, alphabetically
     * @param  Array|String      inPairs    Whether to return an object (true) or array (false)
     * @param  Object|undefined  preSelect  A query given through the URL
     * @return Array
     */
    self.get = (names = 'all', inPairs = true, preSelect = null) => {
        if(names.constructor !== Array)
            names = [names];

        // The object/array that will contain all the filters
        const filters = inPairs ? {} : [];

        // Loop over the names and add the filters accordingly
        names.forEach(name => {
            let filter = null;

            // Add the aggregations filter
            if(name == 'all'  ||  name == 'aggregations') {
                filter = {
                    title: 'Aggregatieniveau',
                    name: 'aggregation',
                    options: Surf.api.terms.aggregations.map(aggregation => ({
                        title: aggregation.title,
                        value: aggregation.id,
                        checked: self.optionChecked(preSelect, 'aggregation', aggregation.id)
                    }))
                };
            }

            // Add the disciplines filter
            if(name == 'all'  ||  name == 'disciplines') {
                filter = {
                    title: 'Vakgebied',
                    name: 'discipline',
                    options: Surf.api.terms.disciplines.map(discipline => ({
                        // First character uppercase, for neatness and sorting
                        title: Surf.utilities.uppercaseFirst(discipline.title),
                        value: discipline.value,
                        checked: self.optionChecked(preSelect, 'discipline', discipline.value)
                    }))
                    // Sort the discpline options alphabetically
                    .sort((a, b) => {
                        if(a.title < b.title)
                            return -1;
                        else if(a.title > b.title)
                            return 1;
                        return 0;
                    })
                };
            }

            // Add the formats filter
            if(name == 'all'  ||  name == 'formats') {
                filter = {
                    title: 'Soort Materiaal',
                    name: 'format',
                    options: Surf.api.terms.formats.map(format => ({
                        title: format.title,
                        value: format.value,
                        checked: self.optionChecked(preSelect, 'format', format.value)
                    }))
                };
            }

            // Add the languages filter
            if(name == 'all'  ||  name == 'languages') {
                filter = {
                    title: 'Taal',
                    name: 'language',
                    options: [
                        {
                            title: 'Nederlands',
                            value: 'nl',
                            checked: self.optionChecked(preSelect, 'language', 'nl')
                        },
                        {
                            title: 'Engels',
                            value: 'en',
                            checked: self.optionChecked(preSelect, 'language', 'en')
                        }
                    ]
                };
            }

            // Add the levels filter
            if(name == 'all'  ||  name == 'levels') {
                filter = {
                    title: 'Onderwijsniveau',
                    name: 'level',
                    options: Surf.api.terms.levels.map(level => ({
                        title: level.title,
                        value: level.value,
                        checked: self.optionChecked(preSelect, 'level', level.value),
                        options: level.children.map(child => ({
                            title: child.title,
                            value: child.value,
                            checked: self.optionChecked(preSelect, 'level', child.value)
                        }))
                    }))
                };
            }

            // Add the licenses filter
            if(name == 'all'  ||  name == 'licenses') {
                filter = {
                    title: 'Gebruiksrechten ' + Surf.licenses.getIconHtml('cc'),
                    name: 'license',
                    options: Surf.api.terms.licenses.map(license => ({
                        title: license.title,
                        value: license.value,
                        name: license.name,
                        checked: self.optionChecked(preSelect, license.name, license.value),
                        options: license.children.map(child => ({
                            title: child.title,
                            value: child.value,
                            name: child.name,
                            checked: self.optionChecked(preSelect, child.name, child.value)
                        }))
                    }))
                };
            }

            if(inPairs)
                filters[name] = filter;
            else
                filters.push(filter);
        });

        return filters;
    };



    /**
     * Decides if a filter option needs to be checked, called from getFilters()
     * @param  Object  preSelect    The query from the URL
     * @param  String  filterName   The name of the filter
     * @param  String  optionValue  The value of the option, will be checked with value in preSelect
     * @return Boolean
     */
    self.optionChecked = (preSelect, filterName, optionValue) => {
        return (preSelect !== null  &&  preSelect[filterName] !== undefined  &&  preSelect[filterName] == optionValue);
    };
};
