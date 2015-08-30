'use strict';

/* Register the utility functions under ImageApp.utils namespace */
(function () {
    function namespace(namespaceString) {
        var parts = namespaceString.split('.'),
            parent = window,
            currentPart = '';

        for(var i = 0, length = parts.length; i < length; i++) {
            currentPart = parts[i];
            parent[currentPart] = parent[currentPart] || {};
            parent = parent[currentPart];
        }

        return parent;
    }
    namespace("ImageApp.utils");

    ImageApp.utils.isLogined = function() {
        return ($.cookie('userId') !== null && $.cookie('userId') > 0);
    }

    ImageApp.utils.login = function() {
        $('#navBar-right').removeClass("hidden");
    }

    ImageApp.utils.logout = function() {
        $('#loginForm').removeClass("hidden");
    }

    /**
     * Check file size & format.
     *
     * @param file
     * @returns {boolean}
     */
    ImageApp.utils.checkFile = function(file) {
        if (!/\.(gif|jpg|jpeg|png)$/i.test(file.name)) {
            return false;
        }
        // larger than 3M
        if (file.size >= 5*1024*1024) {
            alert("file is more than 5M");
            return false;
        }
        return true;
    }

    ImageApp.utils.resetCookie = function($scope) {
        $.cookie('userId', '', { expires: -1 });
        $.cookie('userName', '', { expires: -1 });
        $scope.userLogined = ImageApp.utils.isLogined();
    }
})();

/**
 * Login controller
 *
 * @param $scope
 * @param $http
 * @constructor
 */
function Login($scope, $http) {
    $scope.logout = function() {
        ImageApp.utils.logout();
        ImageApp.utils.resetCookie($scope);
    }

    // Initialization
    $scope.init = function () {
        $scope.userLogined = ImageApp.utils.isLogined();

        if ($.cookie('userName') !== null) {
            $scope.userName = $.cookie('userName');
        }
        // login
        $("#loginForm").submit(function() {
            var url = "comp/user/login";
            var $loginForm = $(this);
            var $password = $loginForm.find('input[name="password"]');

            var oldValue = $password.val();
            $password.val(md5(oldValue));
            // Post the request
            $.ajax({
                type: "POST",
                url: url,
                data: $loginForm.serialize(), // serializes the form's elements.
                contentType: false,
                processData: false,
                xhrFields: {
                    withCredentials: true
                },
                success: function(data, status, xhr)
                {
                    if (data.userId !== -1) {
                        ImageApp.utils.login();
                        $scope.userLogined = true;
                        // Currently with ajax post, even though we can get "Set-Cookie" in the response header
                        // but the cookie is not set by the browser.
                        // TODO: resolve it later and currently we set the cookie manually with a json response.
                        $.cookie('userId', data.userId.toString());
                        $.cookie('userName', data.userName);
                        $scope.userName = data.userName;
                        $.event.trigger("userLogin");
                    } else {
                        alert("login fails !!!")
                    }
                },
                error: function (data) {
                    ImageApp.utils.logout();
                }
            });
            return false; // avoid to execute the actual submit of the form.
        });

    };
}
Login.$inject = ['$scope', '$http'];

/**
 * Sign up controller
 *
 * @param $scope
 * @param $http
 * @constructor
 */
function Signup($scope, $http) {
    $scope.signup = function() {
        if ($scope.user.name !== undefined &&
            $scope.user.email !== undefined &&
            $scope.password !== undefined) {

            $http.post('../comp/user/signup', { name: $scope.user.name,
                email : $scope.user.email,
                password : md5($scope.password)}).
                success(function(data, status, headers, config) {
                }).
                error(function(data, status, headers, config) {
                    alert("fail " +  $scope.user.email + " password: " + md5($scope.password));
                });
        }
    }

    // Initialization
    $scope.init = function () {
        // Signup
        $('#signupForm').submit(function() {
            var url = "comp/user/signup";
            var $signUpForm = $(this);

            var oldValue = $signUpForm.find('input[name="password"]').val();
            $signUpForm.find('input[name="password"]').val(md5(oldValue));
            $.ajax({
                type: "POST",
                url: url,
                data: $signUpForm.serialize(), // serializes the form's elements.
                contentType: false,
                processData: false,
                xhrFields: {
                    withCredentials: true
                },
                success: function(data, status, xhr)
                {
                    alert("signup");
                },
                error: function (data) {
                    alert("fail");
                }
            });
            return false;
        });
    }
}
Signup.$inject = ['$scope', '$http'];

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

    // Initialization
    $scope.init = function () {
        listFiles();
        if (ImageApp.utils.isLogined()) {
            $scope.userLogined = true;
            ImageApp.utils.login();
        } else {
            ImageApp.utils.logout();
        }

        $("#uploadFilesForm").submit(function() {
            // $("#uploadFilesForm").serialize() could not serialize the file so we have to
            // use FormData which is available in most main stream browser (IE 10+ ...)
            if (ImageApp.utils.isLogined()) {
                if (window.File && window.FileList) {
                    var fileList = $('#files').get(0).files;
                    var fileCount =  fileList.length;
                    if (fileCount == 0) {
                        alert("please choose a file firstly!!!");
                        return;
                    }
                    for (var i = 0; i < fileCount; i++) {
                        if (!ImageApp.utils.checkFile(fileList[i])) {
                            return;
                        }
                    }
                } else {
                    alert('upgrade browser firstly!!!');
                    return;
                }
            } else {
                alert("not logined yet!!!")
                return;
            }
            // do the upload
            uploadPreview(fileList);
            //uploadRawImages($scope);

            return false; // avoid to execute the actual submit of the form.
        });
    };

    /* private helper functions begin */

    // List the image files
    var listFiles = function() {
        $http.get('/comp/file', {
            params: {
                userId: $.cookie('userId')
                }
            }).
            success(function(data, status, headers, config) {
                $scope.images = data.imageList;
            }).
            error(function(data, status, headers, config) {
                console.log("fail");
            });
    };

    /* Upload the raw image */
    var uploadRawImages = function($scope) {
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
                listFiles(); // refresh the page
            },
            error: function (data) {
                alert("upload file fails")
            }
        });
    }

    /* Update Preview images */
    var uploadPreview = function(files){
        var url = "comp/file/upload";

        var data = {};
        data.files = [];
        data.fileCount = files.length;

        for (var i = 0; i < files.length; i++) {
            // Ensure it's an image
            if(files[i].type.match(/image.*/)) {
                // Load the image
                var reader = new FileReader();
                reader.filename = files[i].name;

                reader.onload = function (readerEvent) {
                    var image = new Image();
                    var reader = readerEvent.target;
                    image.onload = function (imageEvent) {
                        // Resize the image
                        var canvas = document.createElement('canvas'),
                            max_size = 544,// TODO : pull max size from a site config
                            width = image.width,
                            height = image.height;
                        if (width > height) {
                            if (width > max_size) {
                                height *= max_size / width;
                                width = max_size;
                            }
                        } else {
                            if (height > max_size) {
                                width *= max_size / height;
                                height = max_size;
                            }
                        }
                        canvas.width = width;
                        canvas.height = height;
                        canvas.getContext('2d').drawImage(image, 0, 0, width, height);
                        var dataUrl = canvas.toDataURL('image/jpeg');
                        var resizedImage = dataURLToBlob(dataUrl);
                        var file = {
                            blob: resizedImage,
                            filename: reader.filename
                        };
                        data.files.push(file);
                        data.url = url;

                        if (data.files.length == data.fileCount) {
                            //$.event.trigger(data);
                            $scope.$broadcast($scope.EVENTS.IMAGES_RESIZED, data);
                        }
                    }
                    image.src = readerEvent.target.result;
                }
                reader.readAsDataURL(files[i]);
            }
        }
    };

    /* Utility function to convert a canvas to a BLOB */
    var dataURLToBlob = function(dataURL) {
        var BASE64_MARKER = ';base64,';
        if (dataURL.indexOf(BASE64_MARKER) == -1) {
            var parts = dataURL.split(',');
            var contentType = parts[0].split(':')[1];
            var raw = parts[1];

            return new Blob([raw], {type: contentType});
        }

        var parts = dataURL.split(BASE64_MARKER);
        var contentType = parts[0].split(':')[1];
        var raw = window.atob(parts[1]);
        var rawLength = raw.length;

        var uInt8Array = new Uint8Array(rawLength);

        for (var i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }

        return new Blob([uInt8Array], {type: contentType});
    }

    /* private helper functions end */

    /* Registered event listeners begin */
    // Jquery style
    $(document).on("imageResized", function (event) {
        // The raw image is not sent out
        //var data = new FormData($("#uploadFilesForm")[0]);
        var data = new FormData();
        if (event.blob && event.url) {
            data.append('image_data', event.blob, event.filename);

            $.ajax({
                url: event.url,
                data: data,
                cache: false,
                contentType: false,
                processData: false,
                type: 'POST',
                success: function(data){
                    listFiles(); // refresh the page
                },
                error: function (data) {
                    alert("fail");
                }
            });
        }
    });

    $(document).on("userLogin", function(event) {
        listFiles();
    });

    // Angularjs style
    $scope.$on($scope.EVENTS.IMAGES_RESIZED, function (event, data) {
        // The raw image is not sent out
        //var data = new FormData($("#uploadFilesForm")[0]);
        var formData = new FormData();
        for (var i = 0; i < data.files.length; i++) {
            var file = data.files[i];
            formData.append('image_data_' + i, file.blob, file.filename);
        }

        $.ajax({
            url: data.url,
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            type: 'POST',
            success: function(data){
                listFiles(); // refresh the page
            },
            error: function (data) {
                alert("fail");
            }
        });
    })
    /* Registered event listeners end */
}
ImagesCtrl.$inject = ['$scope', '$http'];

