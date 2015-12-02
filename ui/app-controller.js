app.controller('AppCtrl', ['$scope', '$uibModal', '$q', 'Images', 
    function($scope, $uibModal, $q, Images) {
        $scope.images = {};
        $scope.loading = true;
        Images.get().then(function(response) {
            for(var i=0; i<response.data.length; i++) {
                var image = response.data[i];

                $scope.images[image.id] = image.data;
            }
            $scope.loading = false;
        });

        $scope.uploadImage = function(image) {
            if(!image) {
                return;
            }
            $scope.loading = true;
            Images.upload(image).then(function(response) {
                var id = response.data;

                $scope.getImage(id);
            });
        };

        $scope.getImage = function(id) {
            $scope.loading = true;
            Images.get(id).then(function(r) {
                var image = r.data;
                $scope.images[id] = image.data;
                $scope.activeId = id;
                $scope.loading = false;
            });
        };

        $scope.selectImage = function(id) {
            if($scope.loading) {
                return;
            }
            if($scope.activeFilter) {
                $scope.clearFilter().then(function() {
                    $scope.activeId = id;
                });
            }
            else {
                $scope.activeId = id;
            }
        };

        $scope.removeImage = function(id) {
            if($scope.loading) {
                return;
            }
            Images.remove(id).then(function() {
                if(id === $scope.activeId) {
                    $scope.activeFilter = null;
                    $scope.activeId = null;
                }
                delete $scope.images[id];
            });
        };

        $scope.openUploadForm = function() {
            var modalInstance = $uibModal.open({
                templateUrl: 'upload.html',
                controller: 'UploadCtrl'
            });

            modalInstance.result.then(function (image) {
                $scope.uploadImage(image);
            });
        };

        $scope.applyFilter = function(filter) {
            if($scope.loading || $scope.activeFilter === filter) {
                return;
            }
            $scope.loading = true;
            Images.getFiltered($scope.activeId, filter).then(function(response) {
                $scope.activeFilter = filter;
                $scope.images[$scope.activeId] = response.data.data;
                $scope.loading = false;
            });
        };

        $scope.clearFilter = function() {
            if($scope.loading) {
                return;
            }
            var deferred = $q.defer();
            $scope.loading = true;
            Images.get($scope.activeId).then(function(response) {
                $scope.images[$scope.activeId] = response.data.data;
                $scope.activeFilter = null;
                $scope.loading = false;
                deferred.resolve();
            });

            return deferred.promise;
        };
    }]);