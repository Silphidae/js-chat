'use strict';

angular.module('ChatApp')
    .controller('NavbarController', ['$localStorage', '$scope', '$state', 'socket',
        function($localStorage, $scope, $state, socket) {

            $scope.currPage = $state.current.name;
            $scope.username = $localStorage.chatUser;

            $scope.layout = 'black';

            $scope.changeLayout = function() {
                if ($scope.layout === 'black') {
                    $scope.layout = 'pink';
                } else $scope.layout = 'black';
            };

            $scope.logout = function() {
                if ($state.current.name === 'chat') {
                    socket.emit('leave room', {
                        room: $state.params.name,
                        user: $localStorage.chatUser,
                        userId:  $localStorage.chatId
                    })
                }

                socket.emit('logout', {
                    user: $localStorage.chatUser,
                    userId: $localStorage.chatId
                });

                delete $localStorage.chatUser;
                delete $localStorage.chatId;

                $state.go('login');
            };

        }]);