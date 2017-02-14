'use strict';

angular.module('ChatApp')
    .controller('LoginController', ['$localStorage', '$scope', '$state', 'socket',
        function($localStorage, $scope, $state, socket) {

        socket.close();
        socket.connect();

            $scope.submit = function() {
                $scope.message = '';

                if ($scope.nickname) {

                    socket.emit('new user', {user: $scope.nickname});

                    socket.on('new user', function(data) {
                        if (data.message === 'user created') {
                            $localStorage.chatUser = $scope.nickname;
                            $localStorage.chatId = data.userId;
                            $state.go('rooms');
                        } else {
                            $scope.message = 'User with name ' + $scope.nickname + ' has already joined. ' +
                                'Please choose another one.';
                            $scope.nickname = '';
                        }
                    });

                }
            };

        }]);