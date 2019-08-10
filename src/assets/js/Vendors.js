import Awesomplete from 'awesomplete';

export default function() {
    const self = this;



    /**
     * Enable autocomplete on a parent element, containing input(s)
     * @param  jQuery  $parentElement
     */
    self.enableAutocomplete = ($parentElement) => {
        // Create a deferred object that will resolve the chosen option
        const defer = $.Deferred();

        // Find the input element on which to enable autocomplete
        const $inputElement = $parentElement.find('input[name="search_input"]');
        const minimumCharacters = 3;

        if($inputElement.length > 0) {
            // Create an Awesomplete object
            const awesomplete = new Awesomplete($inputElement.get(0), {
                minChars: minimumCharacters,
                maxItems: 15,
                autoFirst: true
            });

            // Listen for the event when a user selects an option from the list
            $inputElement.get(0).addEventListener('awesomplete-selectcomplete', function(event) {
                // Resolve with the chosen option
                defer.resolve(event.text.value);
            });

            // Get new data list entries while typing (with a delay)
            Surf.utilities.delayedEvent($inputElement, 'change keyup paste', function(event) {
                const terms = $inputElement.val();

                // Only update when it's an actual character, and at least some characters long
                if(isCharacter(event.which, true)  &&  terms.length >= minimumCharacters) {
                    // Add the values to choose from
                    Surf.api.autocomplete(terms)
                    .then(response => awesomplete.list = response[1]);
                }
            }, 1000);
        }

        return defer.promise();
    };
};
