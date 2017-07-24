'use strict';

angular.module('ChatApp')
    .controller('RoomlistController', ['$localStorage', '$scope', '$state', 'socket', '$timeout',
        function($localStorage, $scope, $state, socket, $timeout) {

            $scope.listLength = 4;
            $scope.roomName = '';

            getRooms();

            $scope.goto = function(roomName) {
                joinRoom(roomName);
            };

            $scope.addRoom = function() {
                if($scope.roomName) {
                    joinRoom($scope.roomName)
                }
            };

            function joinRoom(roomName) {
                socket.emit('join room', {
                    room: roomName,
                    user: $localStorage.chatUser,
                    userId: $localStorage.chatId
                });

                $state.go('chat', {name: roomName});
            }

            function getRooms() {
                socket.emit('get rooms');
            }

            socket.on('update rooms', function(data) {
                $timeout(function() {
                    $scope.$apply(function() {
                        $scope.rooms = data.rooms;
                        if ($scope.rooms.length > 12) {
                            $scope.listLength = Math.ceil($scope.rooms.length / 3);
                        }
                    });
                }, 0);

            });

        }]);