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
            authenticate: true,
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
            url: '/chat/:name',
            authenticate: true,
            views: {
                header: {
                    templateUrl: 'components/navbar/navbar.html',
                    controller: 'NavbarController'
                },
                content: {
                    templateUrl: 'components/chat/chat.html',
                    controller: 'ChatController'
                }
            }
        });

    $urlRouterProvider.otherwise('/rooms');

});