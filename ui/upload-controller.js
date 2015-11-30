app.controller('UploadCtrl', ['$scope', '$uibModalInstance', 
    function($scope, $uibModalInstance) {
        $scope.ok = function () {
            $uibModalInstance.close($scope.upload);
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };
    }]);