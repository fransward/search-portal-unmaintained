export default function() {
    const self = this;

    /**
     * The locale setting of the application
     * @type Object
     */
    self.locale = {
        short: null,
        long: null
    };



    /**
     * Set the locale of the application
     * @param  String  locale  The locale in long format, short will be derived from it
     */
    self.setLocale = locale => {
        const localeRegex = /[a-z]{2}-([A-Z]{2})/;

        if(locale.match(localeRegex)) {
            self.locale.long = locale;
            // The short format is the last part of the long one, lowercased
            self.locale.short = locale.replace(localeRegex, '$1').toLowerCase();
        }
    };



    /**
     * Format a number according to a locale
     * @param  Number  number
     * @return String
     */
    self.formatNumber = number => number.toLocaleString(self.locale.long);
};
