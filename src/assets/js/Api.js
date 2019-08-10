export default function() {
    const self = this;

    /**
     * The version of the API to use
     * Accepts 'v#' and 'latest'
     * @type String
     */
    self.version = 'v3';

    /**
     * The base URL of all the API calls
     * @type String
     */
    self.url = 'https://proxy.edurep.nl/' + self.version + '/search';

    /**
     * Easier names for the API
     * @type Object
     */
    self.vocabulary = {
        aggregation: 'lom.general.aggregationlevel',
        author: 'lom.lifecycle.contribute.author',
        cost: 'lom.rights.cost',
        date: 'lom.lifecycle.contribute.publisherdate',
        discipline: 'lom.classification.obk.discipline.id',
        endUser: 'lom.educational.intendedenduserrole',
        format: 'lom.technical.format',
        language: 'lom.general.language',
        level: 'lom.classification.obk.educationallevel.id',
        license: 'lom.rights.copyrightandotherrestrictions',
        publisher: 'lom.lifecycle.contribute.publisher',
        keyword: 'lom.general.keyword'
    };

    /**
     * Default parameters for all API calls
     * @type Object
     */
    self.defaultParameters = {
        mode: 'json',
        startRecord: 1,
        maximumRecords: 10
    };

    /**
     * Default queries to use/join in calls
     * Use encodeURI() when applying
     * @type Object
     */
    self.defaultQueries = {
        // Intended end-users: students and teachers
        endUsers: '(' + self.vocabulary.endUser + ' exact "learner" OR ' + self.vocabulary.endUser + ' exact "teacher")',
        // Free materials
        costs: '(' + self.vocabulary.cost + ' exact "no")',
        // Languages
        languageNl: '(' + self.vocabulary.language + ' exact "nl")',
        languageEn: '(' + self.vocabulary.language + ' exact "en" OR ' + self.vocabulary.language + ' exact "eng")',
        // Education levels come from the API, will be filled in when getting them
        levels: ''
    };

    /**
     * A shorthand for selecting Dutch and English language materials
     * @type String
     */
    self.defaultQueries.languageNlEn = '(' + self.defaultQueries.languageNl + ' OR ' + self.defaultQueries.languageEn + ')';

    /**
     * The educational level IDs used by the API
     * @type Object
     */
    self.terms = {
        aggregations: [],
        disciplines: [],
        formats: [],
        levels: [],
        licenses: []
    };

    /**
     * Is set to true, when ready to handle calls
     * @type Boolean
     */
    self.isReady = false;

    /**
     * Deferred objects that wait for the Api to be ready
     * @type Array
     */
    self.deferredQueue = [];

    /**
     * Cached call results, as {query, result} objects
     * @type Array
     */
    self.callCache = [];



    /**
     * Delays calls until the Api is ready
     * @return Promise
     */
    self.whenReady = () => {
        const defer = $.Deferred();

        // Resolve immediately, when ready already,
        // otherwise add it to the queue
        if(self.isReady)
            defer.resolve();
        else
            self.deferredQueue.push(defer);

        return defer;
    };



    /**
     * Resolve and clear all the queued deferred objects
     */
    self.resolveQueue = () => {
        while(self.deferredQueue.length) {
            self.deferredQueue[0].resolve();
            self.deferredQueue.splice(0, 1);
        }
    };



    /**
     * Perform an API call
     * @param    Object   params  The parameters for the API call
     * @param    Boolean  full    Whether to return the full result or not
     * @param    Boolean  force   When true, this ignores the ready state
     * @param    Boolean  cache   Whether or not to cache the result
     * @resolve  Array    A list of search results
     * @return   Promise
     */
    self.call = (params, full = false, force = false, cache = false) => {
        self.logCall(params);

        const defer = $.Deferred();
        const paramsJson = JSON.stringify(params);

        const doCall = () => {
            // Merge/overwrite the default parameters with the given parameters (keep the original intact)
            const defaultParameters = $.extend(true, {}, self.defaultParameters);
            params = $.extend(true, defaultParameters, params);

            $.getJSON(self.url, params)
            .then(success => {
                let result = success;
                if( ! full)
                    result = result.search.records;

                // Store in cache if needed
                if(cache) {
                    self.callCache.push({
                        query: paramsJson,
                        // As a clone, to keep the original
                        result: $.extend(true, {}, result)
                    });
                }

                defer.resolve(result);
            }, error => {
                defer.reject(error);
            });
        };

        // Do the API call and resolve/reject it when done
        if(force)
            doCall();
        else
            self.whenReady().then(doCall);

        return defer;
    };



    /**
     * Same as call(), but using cache
     * @see call()
     */
    self.callOnce = (params, full = false, force = false) => {
        const paramsJson = JSON.stringify(params);
        let cachedResult = null;

        // Try to find a cached result
        for(let i=-1;  ++i<self.callCache.length;) {
            if(self.callCache[i].query == paramsJson)
                cachedResult = self.callCache[i].result;
        }

        // Return an immediately resolved Promise, if a cached result was found
        // Because the caller expects a Promise
        if(cachedResult !== null) {
            self.logCall(params, true);

            const defer = $.Deferred();
            defer.resolve(cachedResult);
            return defer;
        }

        // Otherwise do an API call, with caching on
        return self.call(params, full, force, true);
    };



    /**
     * Log a call to the console, on debugging mode
     * @param  Object   params
     * @param  Boolean  cached  Logs that the call result came from the cache
     */
    self.logCall = (params, cached = false) => {
        if(Surf.debug) {
            // Include the URL in the logging
            const log = $.extend(true, {
                baseUrl: self.url
            }, params);

            // Decode the parameters and put 'and' and 'or' on separate lines for readability
            $.each(log, (key, value) => log[key] = decodeURIComponent(value).replace(/ (AND|OR)/g, '\n$1'));

            // Show the call as a collapsed group
            const time = Surf.time.format(Date.now(), Surf.time.DATE_TIME_LONG);
            console.groupCollapsed(time + ': API call' + (cached ? ' (using cache)' : ''));
            console.table(log);
            console.groupEnd();
        }
    };



    /**
     * Get the education levels from the API
     */
    self.setTerms = () => {
        // Define the terms to get from the API, comma-separated
        const drilldownNames = [
            self.vocabulary.aggregation,
            self.vocabulary.discipline,
            self.vocabulary.format,
            self.vocabulary.level
        ]
        // No limit on the amount of drilldown results
        .map(name => name + ':0')
        .join(',');

        // Get the term names from the API
        self.call({
            query: 'edurep',
            'x-term-drilldown': drilldownNames,
            maximumRecords: 0
        }, true, true)
        .then(response => {
            $.each(response.search.drilldowns, (name, results) => {
                // Set the aggregation names
                if(name == self.vocabulary.aggregation)
                    self.setAggregations(results);

                // Set the discipline names
                else if(name == self.vocabulary.discipline)
                    self.setDisciplines(results);

                // Set the format names
                else if(name == self.vocabulary.format)
                    self.setFormats(results);

                // Set the level names
                else if(name == self.vocabulary.level) {
                    self.setLevels(results);
                    self.setDefaultLevelsQuery();
                }
            });

            // Licenses are custom
            self.setLicenses();

            // Api is now ready to handle calls
            self.isReady = true;
            self.resolveQueue();
        });
    };



    /**
     * Convert the API format to usable aggregation levels
     * @param  Array
     */
    self.setAggregations = aggregations => {
        $.each(aggregations, (id, aggregation) => {
            self.terms.aggregations.push({
                id,
                title: aggregation.human
            });
        });
    };



    /**
     * Convert the API format to usable disciplines
     * @param  Array
     */
    self.setDisciplines = disciplines => {
        $.each(disciplines, (index, discipline) => {
            self.terms.disciplines.push({
                value: discipline.identifier,
                title: discipline.caption
            });
        });
    };



    /**
     * Convert the API format to usable format names
     * @param  Array
     */
    self.setFormats = formats => {
        $.each(formats, (id, format) => {
            self.terms.formats.push({
                value: id,
                title: format.human
            })
        });
    };



    /**
     * Convert the API format to usable level definitions
     * @param  Array  levels
     */
    self.setLevels = levels => {
        // The regular expression to limit the levels with
        const levelRegex = /^(MBO|HBO|WO)$/;

        $.each(levels, (index, level) => {
            // A top-level item matches the name
            if(levelRegex.test(level.caption)) {
                self.terms.levels.push({
                    value: level.identifier,
                    title: level.caption,
                    children: level.children.map(child => ({
                        value: child.identifier,
                        title: child.caption
                    }))
                });
            }

            // Otherwise search in children
            else {
                level.children.map(child => {
                    if(levelRegex.test(child.caption)) {
                        self.terms.levels.push({
                            value: child.identifier,
                            title: child.caption,
                            children: []
                        });
                    }
                });
            }
        });
    };



    /**
     * Construct a default query of all the levels combined
     */
    self.setDefaultLevelsQuery = () => {
        const queryParts = [];

        self.terms.levels.map(level => {
            // Add the top-level levels
            queryParts.push(self.vocabulary.level + ' exact "' + level.value + '"');

            // Add child levels, if any
            if(level.children.length)
                level.children.map(child => queryParts.push(self.vocabulary.level + ' exact "' + child.value + '"'));
        });

        self.defaultQueries.levels = '(' + queryParts.join(' OR ') + ')';
    };



    /**
     * Set the licenses terms
     */
    self.setLicenses = () => {
        self.terms.licenses = [
            {
                value: 'yes',
                title: 'Restricted access',
                name: 'cc_restricted',
                children: []
            },
            {
                title: 'Creative Commons versie',
                name: 'cc_all_versions',
                children: [
                    {
                        value: '30',
                        title: '3.0',
                        name: 'cc_version'
                    },
                    {
                        value: '40',
                        title: '4.0',
                        name: 'cc_version'
                    }
                ]
            },
            {
                value: 'by',
                title: 'Naamsvermelding ' + Surf.licenses.getIconHtml('by'),
                name: 'cc',
                children: []
            },
            {
                value: 'sa',
                title: 'Gelijk delen ' + Surf.licenses.getIconHtml('sa'),
                name: 'cc',
                children: []
            },
            {
                value: 'nd',
                title: 'Geen afgeleiden ' + Surf.licenses.getIconHtml('nd'),
                name: 'cc',
                children: []
            },
            {
                value: 'nc',
                title: 'Niet commercieel ' + Surf.licenses.getIconHtml('nc'),
                name: 'cc',
                children: []
            }
        ];
    };
};
