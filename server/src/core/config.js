var json = require('../../config.json');

let config = {
    get: function (path) {
        var jsonData = json;
        if (typeof (path) === 'undefined') {
            throw Error('invalid argument');
        }
        path = path.replace(/\[(\w+)\]/g, '.$1'); // convert indices to properties
        path = path.replace(/^\./, ''); // strip a leading dot
        var pathArray = path.split('.');

        for (var i = 0, n = pathArray.length; i < n; i++) {
            var key = pathArray[i];
            if (key in jsonData) {
                if (jsonData[key] !== null) {
                    jsonData = jsonData[key];
                } else {
                    return null;
                }
            } else {
                return key;
            }
        }
        return jsonData;
    }
};

module.exports = config;
