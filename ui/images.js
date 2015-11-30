app.factory('Images', ['$http', function($http) {
    var upload = function(image) {
        var fd = new FormData();
        fd.append('image', image);

        var options = {
            headers: {
                "Content-Type": undefined
            }
        };

        return $http.post('upload', fd, options);
    };

    var get = function(id) {
        if(id) {
            return $http.get('images/' + id);
        }
        return $http.get('images/');
    };

    var getFiltered = function(id, filter) {
        return $http.get('images/' + id + '/' + filter);
    };

    return {
        upload: upload,
        get: get,
        getFiltered: getFiltered
    };
}]);