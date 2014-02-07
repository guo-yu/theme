var path = require('path'),
    _ = require('underscore'),
    pluse = require('pluse');

var Theme = function(dirs) {
    if (!dirs) return false;
}

Theme.scan = function(callback) {
    pluse.list(function(err, modules) {
        if (err) return callback(err)
        return console.log(modules);
    });
}

Theme.render = function(template, data) {
    path.join(this.home, template);
}

exports = module.exports = Theme;