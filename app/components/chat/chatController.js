'use strict';

angular.module('ChatApp')
    .controller('ChatController', ['$localStorage', '$state', '$scope', 'socket',
        function($localStorage, $state, $scope, socket) {

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
                socket.emit('leave room', {
                    room: $scope.chatRoomName,
                    user: $localStorage.chatUser,
                    userId:  $localStorage.chatId
                });
                $state.go('rooms');
            };

            socket.on('update users', function(data) {
                $scope.users = data.users;
            });

            socket.on('new message', function(data) {
                if (data.content) {
                    $scope.messages.push(data);
                }
            });

            function getUsers() {
                socket.emit('get users', {room: $scope.chatRoomName});
            }

        }]);