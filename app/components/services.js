'use strict';

angular.module('ChatAppServices', []);

angular.module('ChatAppServices')
    .service('AuthService', ['$q', '$localStorage', 'socket', function($q, $localStorage, socket) {

        return {
            isAuthenticated: function () {
                var deferred = $q.defer();

                socket.emit('is authenticated', {user: $localStorage.chatUser});

                socket.on('is authenticated', function (data) {
                    var response = data.message === 'true'
                    deferred.resolve(response);
                });

                return deferred.promise;
            }

        }
    }]);

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
                if (typeof callback === 'function') {
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
                socket.connect('http://localhost:3000');
            }
        };

    }]);

