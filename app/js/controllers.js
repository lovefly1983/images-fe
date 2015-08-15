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

function ImagesCtrl($scope, $http) {
    $scope.phones = [
        {"name": "Nexus S",
            "snippet": "Fast just got faster with Nexus S."},
        {"name": "Motorola XOOM™ with Wi-Fi",
            "snippet": "The Next, Next Generation tablet."},
        {"name": "MOTOROLA XOOM™",
            "snippet": "The Next, Next Generation tablet."}
    ];
    $scope.showImage = false;

    // Search a doc from solr server
    $scope.search = function() {
        $http.get('../comp/solr/query'+"?qstr=" + $scope.searchStr +"&maxrows=20").
            success(function(data, status, headers, config) {
                $scope.docs = data.docs;
            }).
            error(function(data, status, headers, config) {
                alert("error");
            });
    };

    // Add a doc to solr index
    $scope.addDoc = function() {
        $http.post('../comp/solr/add', {id : $scope.docToAdd, title : $scope.docToAdd}).
            success(function(data, status, headers, config) {
                $scope.status = "add success..."
            }).
            error(function(data, status, headers, config) {
                $scope.status = "add fails..."
            });
    };

    // List the image files
    $scope.listFiles = function() {
        $http.get('/comp/file').
            success(function(data, status, headers, config) {
                $scope.images = data.imageList;
                if ($scope.images.length > 0) {
                    $scope.showImage = true;
                } else {
                    $scope.showImage = false;
                }
            }).
            error(function(data, status, headers, config) {
                $scope.status = data.status;
                $scope.showImage = false;
            });
    }

    // Initialization
    $scope.init = function () {
        $scope.listFiles();
        $("#uploadFilesForm").submit(function() {
            // $("#uploadFilesForm").serialize() could not serialize the file so we have to
            // use FormData which is available in most main stream browser (IE 10+ ...)
            var formData = new FormData($("#uploadFilesForm")[0]);
            var url = "comp/file/upload";
            $.ajax({
                type: "POST",
                url: url,
                data: formData, // serializes the form's elements.
                contentType: false,
                processData: false,
                success: function(data)
                {
                    $scope.listFiles(); // refresh the page
                },
                error: function (returndata) {
                    alert("upload file fails")
                }
            });

            return false; // avoid to execute the actual submit of the form.
        });
    };
}