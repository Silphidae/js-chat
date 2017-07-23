'use strict';

require('angular');
require ('./app.routes');
require ('./components/services');
require('angular-ui-router');
require('ngstorage');
require('angularjs-scroll-glue');
require('socket.io-client');
require('bootstrap-css-only/css/bootstrap.css');
require('./assets/css/style.css');
require('./assets/css/b-cover.css');
require('./assets/css/black-style.css');
require('./assets/css/pink-style.css');

angular.module('ChatApp', [
    'ChatAppRouter',
    'ChatAppServices',
    'ngStorage',
    'luegg.directives' // scroll-glue
]);

angular.module('ChatApp').run(runBlock);

runBlock.$inject = ['AuthService', '$transitions'];
function runBlock(AuthService, $transitions) {

    $transitions.onStart({to: function(state) {
        return (state.name === 'rooms' || state.name ==='chat');
    }}, function(trans) {

        // if not authenticated go to login page
        if (!AuthService.isAuthenticated()) {
            return trans.router.stateService.target('login')
        }

    });

}
