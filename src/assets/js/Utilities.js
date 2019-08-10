export default function() {
    const self = this;



    /**
     * Set a handler for an event, that will be executed after a delay
     * @param  String    $element   The jQuery element that triggers an event
     *                                Also accepts a string or object (like window)
     * @param  String    eventName  The name of the window event
     * @param  Function  callback   The event handler
     * @param  Number    time       The time to wait in milliseconds
     * @param  Boolean   rebind     Whether to first unbind the event or not
     */
    self.delayedEvent = function($element, eventName, callback, time = 100, rebind = false) {
        // Make sure the element is a jQuery element
        if( ! $element instanceof jQuery)
            $element = $($element);

        // The timeout that causes the delay
        let timeout = null;

        // First unbind, if needed
        if(rebind)
            $element.off(eventName);

        $element.on(eventName, function(event) {
            // Clear the timeout before starting a new one
            clearTimeout(timeout);

            timeout = setTimeout(function() {
                // Send the event data to the callback
                callback  &&  callback(event);
            }, time);
        });
    };



    /**
     * Convert an arguments object (of a function) to an array
     * @param  Object  args
     * @return Array
     */
    self.argumentsToArray = function(args) {
        return Array.prototype.slice.call(args);
    };



    /**
     * Make the first character of a string lowercase
     * @param  String  string
     * @return String
     */
    self.lowercaseFirst = function(string) {
        return string.charAt(0).toLowerCase() + string.slice(1);
    };



    /**
     * Make the first character of a string uppercase
     * @param  String  string
     * @return String
     */
    self.uppercaseFirst = function(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };



    /**
     * Concatenate multiple strings into lowercase slug format
     * @param  String  separator  The separator to put between the parts
     * @param  String  parts      Any number of parts to concatenate with the separator
     * @return String
     */
    self.stringsToSlug = function(separator, parts) {
        const args = self.argumentsToArray(arguments);

        // Remove the first entry, because it's the separator
        args.shift();

        // Any non-alphanumeric and non-separator characters are converted to a separator
        const replaceNonAlphanum = new RegExp('[^a-z\\d' + separator + ']', 'gi');

        // Adjacent separators are removed
        const removeAdjacent = new RegExp(separator + '{2,}', 'g');

        return args.join(separator).replace(replaceNonAlphanum, separator).replace(removeAdjacent, separator).toLowerCase();
    };



    /**
     * Convert a hyphen-case-string to a camelCaseString / CamelCaseString
     * @param  String        string          Input string
     * @param  String|Array  delimiters      Delimiter(s) after which an uppercase needs to appear
     *                                       Delimiter characters will be removed from the string
     * @param  Boolean       uppercaseFirst  Make the first character uppercase
     * @return String
     */
    function toCamel(string, delimiters = '-', uppercaseFirst = false) {
        // Make sure the delimiters are an array
        if(delimiters.constructor !== Array)
            delimiters = [delimiters];

        let delimiter;
        let delimiterIndex;
        for(let i=-1;  ++i<delimiters.length;) {
            delimiter = delimiters[i];

            // See if a hyphen exists in the string
            delimiterIndex = string.indexOf(delimiter);

            // Replace all hyphens with the character that comes after them, in uppercase
            while(delimiterIndex > -1) {
                // Take chracters: first until before the delimiter
                string = string.slice(0, delimiterIndex)
                    // Take the character after the delimiter (in uppercase)
                    + string.charAt(delimiterIndex + 1).toUpperCase()
                    // Then take whatever comes after the uppercased character
                    + string.slice(delimiterIndex + 2);

                // Try to find the next delimiter, for the next loop
                delimiterIndex = string.indexOf(delimiter);
            }
        }

        // Make the first character uppercase if needed
        if(uppercaseFirst)
            return self.uppercaseFirst(string);

        return string;
    };



    /**
     * See if a given keycode is a character
     * (not something like arrow keys or home/end)
     * @param   Number   keycode
     * @param   Boolean  includeDelete  Include backspace and delete
     * @return  Boolean
     */
    function isCharacter(keycode, includeDelete = false) {
        if(includeDelete) {
            // Backspace
            if(keycode == 8)
                return true;

            // Delete
            if(keycode == 46)
                return true;
        }

        // Spacebar
        if(keycode == 32)
            return true;

        // 0-9
        if(keycode >= 48  &&  keycode <= 57)
            return true;

        // Numpad 0-9, multiply, add, subtract, decimal point, divide
        // 108 was missing in the list, not sure what it is (excluded anyway)
        if(keycode >= 96  &&  keycode <= 111  &&  keycode != 108)
            return true;

        // a-z
        if(keycode >= 65  &&  keycode <= 90)
            return true;

        // Semi colon, equal sign, comma, dash, period, forward slash, grave accent
        if(keycode >= 186  &&  keycode <= 192)
            return true;

        // Open bracket, back slash, close braket, single quote
        if(keycode >= 219  &&  keycode <= 222)
            return true;

        return false;
    };



    /**
     * Convert a query string to an object with name:value pairs
     * @param  String  query
     * @return Object
     */
    self.parseQueryString = query => {
        if(query === undefined)
            return {};

        query = query.replace('+', ' ');
        const regEx = /[?&]?([^=&]+)(?:=([^&]*)|)/g;
        let matches;
        let value;
        const values = {};

        while(matches = regEx.exec(query)) {
            value = null;
            if(matches[2] !== undefined  &&  matches[2] != '')
                value = decodeURIComponent(matches[2]);

            // Add the name:value pair
            values[decodeURIComponent(matches[1])] = value;
        }

        return values;
    };
};
