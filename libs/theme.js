var Theme = function(params) {
    if (!params) return false;
    Object.keys(params).forEach(function(key){
        self[key] = params[key];
    });
}

exports = module.exports = Theme;