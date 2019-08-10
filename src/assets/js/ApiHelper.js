export default function() {
    const self = this;



    /**
     * Get the total count of all materials
     * @resolve  Number  The total count, formatted by locale
     * @return Promise
     */
    self.getTotalCount = () => {
        var defer = $.Deferred();

        Surf.api.whenReady()
        .then(() => {
            return Surf.api.callOnce({
                query: encodeURI(
                    'edurep'
                    + ' AND ' + Surf.api.defaultQueries.endUsers
                    + ' AND ' + Surf.api.defaultQueries.costs
                    + ' AND ' + Surf.api.defaultQueries.levels
                    + ' AND ' + Surf.api.defaultQueries.languageNlEn
                ),
                maximumRecords: 0
            }, true);
        })
        .then(response => defer.resolve(Surf.i18n.formatNumber(response.search.recordcount)));

        return defer;
    };



    /**
     * Get the recently added materials
     * @resolve  Array
     * @return Promise
     */
    self.getRecentlyAdded = () => {
        const defer = $.Deferred();

        Surf.api.whenReady()
        .then(() => {
            // Do the API call
            return Surf.api.call({
                query: encodeURI(
                    'edurep'
                    + ' AND ' + Surf.api.defaultQueries.endUsers
                    + ' AND ' + Surf.api.defaultQueries.costs
                    + ' AND ' + Surf.api.defaultQueries.levels
                    + ' AND ' + Surf.api.defaultQueries.languageNlEn
                ),
                maximumRecords: 4,
                sort: 1
            });
        })
        // Resolve with the result of the call
        .then(response => defer.resolve(response));

        return defer;
    };



    /**
     * Get a product by its ID
     * @param    String  id
     * @resolve  Object
     * @return Promise
     */
    self.getProduct = id => {
        const defer = $.Deferred();

        Surf.api.call({
            query: id,
            maximumRecords: 1
        })
        // Return only 1 result
        .then(response => {
            if(response !== undefined  &&  response.constructor === Array  &&  response.length)
                defer.resolve(response[0])
        });

        return defer;
    };



    /**
     * Get related products
     * @param  Object  product  The product to base the query on
     * @resolve Array
     * @return Promise
     */
    self.getRelatedProducts = product => {
        const defer = $.Deferred();

        // Create the various query parts
        const tags = product.keyword.map(keyword => Surf.api.vocabulary.keyword + ' exact "' + keyword + '"');
        const format = Surf.api.vocabulary.format + ' exact "' + product.format.mimetype + '"';
        const levels = self.reduceLevels(product.educationallevel, true).map(level => Surf.api.vocabulary.level + ' exact "' + level + '"');
        let author = '';
        const authorValue = self.getProductAuthor(product);
        if($.trim(authorValue) != '')
            author = Surf.api.vocabulary.author + ' exact "' + authorValue + '"';

        // Do the API call, using the above queries
        Surf.api.call({
            query: encodeURI(
                'edurep'
                + ' AND ' + Surf.api.defaultQueries.endUsers
                + ' AND ' + Surf.api.defaultQueries.costs
                + ' AND ('
                    // Tags can be empty, prevent a breaking 'AND ()' query part
                    + ((tags.length) ? '(' + tags.join(' OR ') + ')' : '')
                    // Depending on the tags, add an 'OR' or not
                    + ((tags.length) ? ' OR ' : '') + '(' + format + ')'
                    + ' OR (' + levels.join(' OR ') + ')'
                    + ((author != '')
                        ? ' OR (' + author + ')'
                        : '')
                + ')'
                + ' NOT ' + product.identifier.recordidentifier
            ),
            maximumRecords: 4
        })
        .then(response => defer.resolve(response));

        return defer;
    };



    /**
     * Get author information, including products
     * @param  Object  name  The name of the author
     * @resolve Array
     * @return Promise
     */
    self.getAuthorInfo = (name, maxProducts = 12) => {
        const defer = $.Deferred();

        Surf.api.call({
            query: encodeURI(
                'edurep'
                + ' AND ' + Surf.api.defaultQueries.endUsers
                + ' AND ' + Surf.api.defaultQueries.costs
                + ' AND ' + Surf.api.defaultQueries.levels
                + ' AND ' + Surf.api.defaultQueries.languageNlEn
                + ' AND ('
                    + Surf.api.vocabulary.author + ' exact "' + name + '"'
                    + ' OR ' + Surf.api.vocabulary.publisher + ' exact "' + name + '"'
                + ')'
            ),
            maximumRecords: maxProducts,
            sort: 1
        }, true)
        .then(response => defer.resolve(response));

        return defer;
    };



    /**
     * Convert the API product format to a format for templates
     * @param  Object  product  The product data to convert
     * @return Object
     */
    self.formatProduct = (product, dateFormat = Surf.time.DATE_LONG) => ({
        author: {
            name: self.getProductAuthor(product),
            contributors: self.getProductContributors(product),
            institutes: product.publisher.name
        },
        copyright: product.copyright.human,
        date: Surf.time.format(product.date.date, dateFormat),
        description: product.description,
        downloadLink: product.url.location,
        forRoles: product.intendedenduserrole.map(role => role.value),
        icon: product.image.mimetype_icon,
        id: product.identifier.recordidentifier,
        levels: self.reduceLevels(product.educationallevel),
        licenses: Surf.licenses.getFromString(product.copyright.value),
        sources: [product.url.location],
        tags: product.keyword.map(tag => Surf.utilities.uppercaseFirst(tag)),
        title: product.title,
        type: {
            human: product.learningresourcetype.human,
            format: product.format.mapped_format_specific
        }
    });



    /**
     * Look for an author name, or publisher name as fallback
     * @param  Object  product
     * @return String|null
     */
    self.getProductAuthor = product => {
        return (product.author.name.length)
            ? product.author.name[0]
            : (product.publisher.name.length)
                ? product.publisher.name[0]
                : null;
    };



    /**
     * Look for additional author(s), result can be an empty array
     * @param  Object  product
     * @return Array
     */
    self.getProductContributors = product => {
        return (product.author.name.length > 1)
            ? product.author.name.slice(1)
            : [];
    };



    /**
     * Reduce an array of education levels to accepted levels
     * @param  Object   levels
     * @param  Boolean  useIds  Whether to return level IDs (true) or 'human' names (false)
     * @return Array
     */
    self.reduceLevels = (levels, useIds = false) => {
        // Can't use negative lookbehind for 'V', so using 2 regexes
        const levelRegex = /(MBO|HBO|WO)/;
        const notLevelRegex = /(VMBO|VWO)/;
        const reduced = [];

        $.each(levels, (id, name) => {
            if(levelRegex.test(name)  &&  ! notLevelRegex.test(name)) {
                if(useIds)
                    reduced.push(id);
                else
                    reduced.push(name);
            }
        });

        // Sort alphabetically
        return reduced.sort();
    };
};
