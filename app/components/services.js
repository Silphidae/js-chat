'use strict';

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
                socket.connect('http://localhost:3000');
            }
        };

    }]);

