export default function() {
    const self = this;

    /**
     * The long names for all the license abbreviations
     * @type Object
     */
    self.abbreviations = {
        by: 'Naamsvermelding',
        sa: 'Gelijk delen',
        nd: 'Geen afgeleiden',
        nc: 'Niet commercieel'
    };



    /**
     * Convert a license string like 'cc-by-sa-30' to an array of {title, value} objects
     * @param  String  licenseString
     * @return Array
     */
    self.getFromString = licenseString => {
        licenseString = $.trim(licenseString);

        if(licenseString === undefined  ||  licenseString == '')
            return [];

        if(licenseString.substr(0, 3) != 'cc-')
            return [];

        // Convert the string to an array of abbreviations
        // Remove the first 'cc' entry, and the last '30' / '40' (version) entry
        const licenseParts = licenseString.split('-');
        licenseParts.splice(0, 1);
        licenseParts.splice(-1, 1);

        // Create and return an array of {title, value} objects
        return licenseParts.map(part => {
            if(self.abbreviations[part]) {
                return {
                    title: self.abbreviations[part],
                    value: part
                };
            }
        })
        // Remove empty values
        .filter(license => (license !== undefined));
    };



    /**
     * Get an icon as an HTML element
     * @param  String  abbreviation  The license abbreviation
     * @param  String  extraClasses  Optional extra CSS classes
     * @return String
     */
    self.getIconHtml = (abbreviation, extraClasses = '') => {
        // 'cc' is just 'cc', other abbreviations become 'cc-by' for example
        if(abbreviation != 'cc')
            abbreviation = 'cc-' + abbreviation;

        return '<span class="icon icon-' + abbreviation + ' ' + extraClasses + '"></span>';
    };
};
