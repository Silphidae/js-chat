'use strict';

angular.module('ChatApp', [
    'ChatAppRouter',
    'ChatAppServices',
    'ngStorage',
    'luegg.directives' // scroll-glue
]);

angular.module('ChatApp').run(runBlock);

runBlock.$inject = ['$localStorage', '$rootScope', '$state'];
function runBlock($localStorage, $rootScope, $state) {
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {

        // if not authenticated go to login page
        if (toState.authenticate && !$localStorage.chatUser) {
            $state.transitionTo('login');
            event.preventDefault();
        }

        /* todo now only duplicates normal leave
        // leave room if browsers back button is clicked while in chat room
        if (fromState.name == 'chat' && toState.name == 'rooms' && fromParams != '') {
            socket.emit('leave room', {
                room: fromParams.name,
                user: $localStorage.chatUser,
                userId:  $localStorage.chatId
            });
        }
        */

        // prevent changing straight from another chat to another
        if (fromState.name == 'chat' && toState.name == 'chat') {
            event.preventDefault();
        }

        // prevent going back to login page if logged in
        if (toState.name == 'login' && $localStorage.chatUser) {
            event.preventDefault();
        }

    });

}
