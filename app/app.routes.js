'use strict';

angular.module('ChatAppRouter', ['ui.router']);

angular.module('ChatAppRouter').config(function($stateProvider, $urlRouterProvider) {

    $stateProvider

        .state('login', {
            url: '/',
            views: {
                header: {
                    templateUrl: 'components/navbar/navbar.html',
                    controller: 'NavbarController'
                },
                content: {
                    templateUrl: 'components/login/login.html',
                    controller: 'LoginController'
                }
            }
        })
        .state('rooms', {
            url: '/rooms',
            views: {
                header: {
                    templateUrl: 'components/navbar/navbar.html',
                    controller: 'NavbarController'
                },
                content: {
                    templateUrl: 'components/roomlist/roomlist.html',
                    controller: 'RoomlistController'
                }
            }
        })
        .state('chat', {
            url: '/chat/{name}',
            views: {
                header: {
                    templateUrl: 'components/navbar/navbar.html',
                    controller: 'NavbarController'
                },
                content: {
                    templateUrl: 'components/chat/chat.html',
                    controller: 'ChatController'
                }
            },
            resolve: {
                chat: function($transition$) {
                    chatname =  $transition$.params().name;
                    return chatname;
                }
            },
            onExit: {
                function($localStorage, $transition$, socket) {
                    console.log('on exit');
                    console.log('params', $transition$.params());
                    socket.emit('leave room', {
                        room: chatname.name,
                        user: $localStorage.chatUser,
                        userId: $localStorage.chatId
                    });
                    chatname = '';
                }
            }

        });

    var chatname = '';
    
    $urlRouterProvider.otherwise('/rooms');

});