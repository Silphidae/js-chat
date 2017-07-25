'use strict';

angular.module('ChatApp')
    .controller('LoginController', ['LoginService', '$localStorage', '$scope', '$state',
        function(LoginService, $localStorage, $scope, $state) {

            $scope.submit = function() {
                $scope.message = '';

                if ($scope.nickname) {

                    LoginService.login($scope.nickname).then(function(data) {
                        if (data.message === 'user created') {
                            $localStorage.chatUser = $scope.nickname;
                            $localStorage.chatId = data.socketId;
                            $state.go('rooms');
                        } else {
                            $scope.message = 'User with name ' + $scope.nickname + ' has already joined. ' +
                                'Please choose another one.';
                            $scope.nickname = '';
                        }
                    });

                }
            };

        }]);