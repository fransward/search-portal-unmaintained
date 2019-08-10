import moment from 'moment';

export default function() {
    const self = this;

    /**
     * Various pre-defined date formats
     * @type String
     */
    self.DATE_SHORT = 'D MMM YYYY';
    self.DATE_LONG = 'D MMMM YYYY';
    self.DATE_TIME_SHORT = 'D MMM YYYY HH:mm:ss';
    self.DATE_TIME_LONG = 'D MMMM YYYY HH:mm:ss';



    /**
     * Return a formatted date from a time string / timestamp
     * @param  String|Number  date      The date string or timestamp
     * @param  String         timezone  The timezone of the date
     * @param  String         format    The format for the returned string
     * @return String
     */
    self.format = (date, format = self.DATE_LONG) => {
        // Get the timestamp of the given date
        const timestamp = moment(date).valueOf();

        // Return the formatted string
        return moment(timestamp).locale(Surf.i18n.locale.short).format(format);
    };
};
