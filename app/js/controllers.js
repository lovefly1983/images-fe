'use strict';

/* Controllers */


function MyCtrl1() {}
function MyCtrl2() {}

/**
 * Login controller
 *
 * @param $scope
 * @param $http
 * @constructor
 */
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

    // Initialization
    $scope.init = function () {
        $("#loginForm").submit(function() {
            var url = "comp/user/login";
            var $loginForm = $('#loginForm');

            var oldValue = $loginForm.find('input[name="password"]').val();
            $loginForm.find('input[name="password"]').val(md5(oldValue));
            $.ajax({
                type: "POST",
                url: url,
                data: $("#loginForm").serialize(), // serializes the form's elements.
                contentType: false,
                processData: false,
                xhrFields: {
                    withCredentials: true
                },
                success: function(data, status, xhr)
                {
                    if (data.userId !== -1) {
                        $('#loginForm').hide();
                        $('#navBar-right').removeClass("hidden");
                        $('#navBar-right').show();
                        // Currently with ajax post, even though we can get "Set-Cookie" in the response header
                        // but the cookie is not set by the browser.
                        // TODO: resolve it later and currently we set the cookied manually with a json response.
                        $.cookie('userId', data.userId.toString());
                    } else {
                        alert("login fails !!!")
                    }
                },
                error: function (data) {
                    $('#loginForm').show();
                    $('#navBar-right').hide();
                }
            });
            return false; // avoid to execute the actual submit of the form.
        });
        $('#navBar-right').hide();
    };
}

function Dashboard() {}

/**
 * Images controller.
 *
 * @param $scope
 * @param $http
 * @constructor
 */
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
//            var img = new Image();
//            img.src = $('#files').val();
            if (window.File && window.FileList) {
                var fileList = $('#files').get(0).files;
                var fileCount =  fileList.length;
                for (var i = 0; i < fileCount; i++) {
                    if (!checkFile(fileList[i])) {
                        return;
                    }
                }
            } else {
                alert('upgrade browser firstly!!!');
            }
            // do the upload
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
                error: function (data) {
                    alert("upload file fails")
                }
            });
            return false; // avoid to execute the actual submit of the form.
        });
    };
}

/**
 * Check file size & format.
 *
 * @param file
 * @returns {boolean}
 */
function checkFile(file) {
    if (!/\.(gif|jpg|jpeg|png)$/i.test(file.name)) {
        return false;
    }
    // larger than 3M
    if (file.size >= 3*1024*1024) {
        alert("file is more than 1M");
        return false;
    }

    return true;
}