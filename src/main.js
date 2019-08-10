import Vue from 'vue';
import SurfApp from '@/Surf';
import router from '@/router';
import jQuery from 'jquery';

// Custom objects
import Api from '@/assets/js/Api';
import ApiHelper from '@/assets/js/ApiHelper';
import I18n from '@/assets/js/I18n';
import Licenses from '@/assets/js/Licenses';
import SearchFilters from '@/assets/js/SearchFilters';
import Time from '@/assets/js/Time';
import Utilities from '@/assets/js/Utilities';
import Vendors from '@/assets/js/Vendors';

Vue.config.productionTip = false;

// Make jQuery globally available
window.jQuery = jQuery;
window.$ = jQuery;

// Make Surf globally available
window.Surf = {
    debug: true,
    api: new Api(),
    apiHelper: new ApiHelper(),
    i18n: new I18n(),
    licenses: new Licenses(),
    searchFilters: new SearchFilters(),
    time: new Time(),
    utilities: new Utilities(),
    vendors: new Vendors()
};

// Initialize some objects
Surf.i18n.setLocale('nl-NL');
Surf.api.setTerms();

/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    render: h => h(SurfApp)
});
