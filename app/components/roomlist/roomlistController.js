'use strict';

angular.module('ChatApp')
    .controller('RoomlistController', ['$localStorage', '$scope', '$state', 'socket',
        function($localStorage, $scope, $state, socket) {

            $scope.roomName = '';

            getRooms();

            $scope.goto = function(roomName) {
                socket.emit('join room', {
                    room: roomName,
                    user: $localStorage.chatUser,
                    userId: $localStorage.chatId
                });

                $state.go('chat', {name: roomName});
            };

            $scope.addRoom = function() {
                if($scope.roomName) {
                    socket.emit('join room', {
                        room: $scope.roomName,
                        user: $localStorage.chatUser,
                        userId: $localStorage.chatId
                    });

                    $state.go('chat', {name: $scope.roomName});
                }
            };

            function getRooms() {
                socket.emit('get rooms');
            }

            socket.on('update rooms', function(data) {
                $scope.rooms = data.rooms;
            });

        }]);