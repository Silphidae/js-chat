'use strict';

angular.module('ChatApp', [
    'ChatAppRouter',
    'ChatAppServices',
    'ngStorage',
    'luegg.directives' // scroll-glue
]);

angular.module('ChatApp').run(runBlock);

runBlock.$inject = ['AuthService', '$localStorage', '$state', '$transitions'];
function runBlock(AuthService, $localStorage, $state, $transitions) {

    $transitions.onStart({
        to: function(state) {
            return (state.name === 'rooms' || state.name === 'chat');
        }
    }, function(trans) {

        // if not authenticated go to login page
        AuthService.isAuthenticated().then(function (res) {
            $localStorage.chatId = res.socketId;
            console.log('my new socket id is', $localStorage.chatId);

            if (res.message === false) {
                $localStorage.$reset();
                $state.go('login');
            }
        });
    });

    $transitions.onStart({ to: 'login' }, function(trans) {

        // if authenticated go to rooms page
        AuthService.isAuthenticated().then(function(res) {
            $localStorage.chatId = res.socketId;
            console.log('my new socket id is', $localStorage.chatId);
            if (res === true) {
                $state.go('rooms');
            }
        });

    });

}

