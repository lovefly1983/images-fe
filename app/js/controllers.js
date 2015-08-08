'use strict';

/* Controllers */


function MyCtrl1() {}
function MyCtrl2() {}

function Login($scope, $http) {
    $scope.register = function() {
        if ($scope.user.email !== undefined && $scope.password !== undefined) {
            $http.post('../comp/user/register', {email : $scope.user.email, password : md5($scope.password)}).
                success(function(data, status, headers, config) {
                }).
                error(function(data, status, headers, config) {
                    alert("fail " +  $scope.user.email + " password: " + md5($scope.password));
                });
        }
    }
}

function Dashboard() {}

function PhoneListCtrl($scope, $http) {
    $scope.phones = [
        {"name": "Nexus S",
            "snippet": "Fast just got faster with Nexus S."},
        {"name": "Motorola XOOM™ with Wi-Fi",
            "snippet": "The Next, Next Generation tablet."},
        {"name": "MOTOROLA XOOM™",
            "snippet": "The Next, Next Generation tablet."}
    ];
    $scope.search = function() {
        $http.get('../comp/solr/query'+"?qstr=" + $scope.searchStr +"&maxrows=20").
            success(function(data, status, headers, config) {
                $scope.docs = data.docs;
            }).
            error(function(data, status, headers, config) {
                alert("error");
            });
    }
    $scope.addDoc = function() {
        $http.post('../comp/solr/add', {id : $scope.docToAdd, title : $scope.docToAdd}).
            success(function(data, status, headers, config) {
                $scope.status = "add success..."
            }).
            error(function(data, status, headers, config) {
                $scope.status = "add fails..."
            });
    }
    $scope.callIt = function () {
        $http.get('../comp/status').
            success(function(data, status, headers, config) {
                $scope.status = data.status;
            }).
            error(function(data, status, headers, config) {
                $scope.status = data.status;
            });
    }
}