'use strict';

angular.module('ChatApp')
    .controller('ChatController', ['$localStorage', '$state', '$scope', 'socket', '$timeout',
        function($localStorage, $state, $scope, socket, $timeout) {

            $scope.chatRoomName = $state.params.name;

            $scope.messages = [];
            $scope.users = [];

            getUsers();

            $scope.sendMessage = function() {
                if($scope.newMessage && $localStorage.chatUser) {
                    socket.emit('new message', {
                        room: $scope.chatRoomName,
                        user: $localStorage.chatUser,
                        userId:  $localStorage.chatId,
                        content: $scope.newMessage
                    });

                    $scope.newMessage = '';
                }
            };

            $scope.leave = function() {
                 $state.go('rooms');
            };

            socket.on('update users', function(data) {
                $timeout(function() {
                    $scope.$apply(function() {
                        $scope.users = data.users;
                    });
                }, 0);
            });

            socket.on('new message', function(data) {
                if (data.content) {
                    $scope.messages.push(data);
                }
            });

            function getUsers() {
                socket.emit('get users', {room: $scope.chatRoomName});
            }

            // send server a message, when chat state ends
            $scope.$on('$destroy', function() {
                if ($localStorage.chatUser !== undefined) {
                    socket.emit('leave room', {
                        room: $scope.chatRoomName,
                        user: $localStorage.chatUser,
                        userId: $localStorage.chatId
                    });
                }
            });

        }]);