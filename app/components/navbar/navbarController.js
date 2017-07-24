'use strict';

angular.module('ChatApp')
    .controller('NavbarController', ['$localStorage', '$scope', '$state', 'socket',
        function($localStorage, $scope, $state, socket) {

            $scope.username = $localStorage.chatUser;

            $scope.layout = ( $localStorage.color || 'black');

            $scope.changeLayout = function() {
                if ($scope.layout === 'black') {
                    $localStorage.color = $scope.layout = 'pink';
                } else $localStorage.color = $scope.layout = 'black';
            };

            $scope.logout = function() {
                socket.emit('logout', {
                    user: $localStorage.chatUser,
                    userId: $localStorage.chatId
                });

                delete $localStorage.chatUser;
                delete $localStorage.chatId;
                delete $localStorage.color;

                $state.go('login');
            };

        }]);