'use strict';

/* Controllers */


function MyCtrl1() {}
MyCtrl1.$inject = [];


function MyCtrl2() {
}
MyCtrl2.$inject = [];


function Login() {
}
Login.$inject = [];

function Dashboard() {

}
Dashboard.$inject = [];

function PhoneListCtrl($scope, $http) {
    $scope.phones = [
        {"name": "Nexus S",
            "snippet": "Fast just got faster with Nexus S."},
        {"name": "Motorola XOOM™ with Wi-Fi",
            "snippet": "The Next, Next Generation tablet."},
        {"name": "MOTOROLA XOOM™",
            "snippet": "The Next, Next Generation tablet."}
    ];
    $scope.callIt = function () {
        $http.get('../comp/status').
            success(function(data, status, headers, config) {
                alert("ok");
            }).
            error(function(data, status, headers, config) {
                alert("error");
            });
    }
}