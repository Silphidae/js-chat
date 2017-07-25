'use strict';

angular.module('ChatAppServices', []);

angular.module('ChatAppServices')
    .service('AuthService', ['$q', '$localStorage', 'socket', function($q, $localStorage, socket) {
        return {
            isAuthenticated: function () {
                var deferred = $q.defer();
                socket.emit('is authenticated', {user: $localStorage.chatUser});
                socket.on('is authenticated', function (data) {
                    deferred.resolve(data);
                });
                return deferred.promise;
            }
        }
    }]);

angular.module('ChatAppServices')
    .service('LoginService', ['$q', 'socket', function($q, socket) {
        return {
            login: function (nickname) {
                var deferred = $q.defer();
                socket.emit('new user', {user: nickname});
                socket.on('new user', function(data) {
                    deferred.resolve(data);
                });
                return deferred.promise;
            }
        }
    }]);

angular.module('ChatAppServices')
    .service('SocketUpdater', ['$localStorage', function($localStorage) {
        return {
            update: function (socketId) {
                $localStorage.chatId = socketId;
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

