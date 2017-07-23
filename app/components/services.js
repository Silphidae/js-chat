'use strict';

var io = require('socket.io-client');

angular.module('ChatAppServices', []);

angular.module('ChatAppServices')
    .factory('socket', ['$rootScope', function($rootScope) {
        var socket = io.connect();

        return {
            on: function(event, callback) {
                socket.on(event, function() {
                    var args = arguments;
                    $rootScope.$apply(function() {
                        callback.apply(socket, args);
                    });
                });
            },
            emit: function(event, data, callback) {
                if (typeof callback == 'function') {
                    socket.emit(event, data, function () {
                        var args = arguments;
                        $rootScope.$apply(function () {
                            if (callback) {
                                callback.apply(socket.args);
                            }
                        });
                    });
                } else {
                    socket.emit(event, data);
                }
            },
            close: function() {
                socket.close();
            },
            connect : function() {
                socket.connect('http://localhost:8080');
            }
        };

    }]);

angular.module('ChatAppServices')
    .service('AuthService', ['$localStorage', 'socket', function($localStorage, socket) {
        return {
            isAuthenticated: function() {
                console.log('on state change, user is ', $localStorage.chatUser);

                  socket.emit('is authenticated', {
                    name: $localStorage.chatUser,
                    userId: $localStorage.chatId
                }, function(data) {
                      return data.message === 'true';
                  });
            }
        }

    }]);

