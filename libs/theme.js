var fs = require('fs'),
    path = require('path'),
    Hub = require('pkghub'),
    hub = new Hub,
    render = require('pkghub-render');

var Theme = function(home) {
    // 默认认为父目录为主题的 home 目录
    this.home = home || path.resolve(__dirname, '../', '../', '../');
    this.publics = path.join(this.home, './public');
    this.master();
}

Theme.prototype.master = function() {
    try {
        this.master = require(path.join(this.home, './package.json'));
    } catch (err) {}
}

// 列出所有可用主题
// e.g: theme.list(function(){})
Theme.prototype.list = function(callback) {
    var self = this;
    hub.themes(function(err, themes) {
        if (err) return callback(err);
        // 这些主题全部被缓存在 hub 里了, 也可以不用再备份一遍
        self.themes = themes;
        if (!callback) return false;
        return callback(err, themes);
    });
}

// 安装新主题
Theme.prototype.install = function(name, callback) {
    if (!name) return callback(new Error('theme name required'));
    var self = this;
    // 安装到某个目录
    // name 可以是字符串或者数组
    hub.install(name, function(err, logs, modules) {
        if (err) return callback(err);
        // 判断有没有 css js 和 images 目录
        var theme = modules.dependencies[name];
        console.log(theme);
        // 先判断有没有样式表和js文件夹
        fs.symlink(
            path.join(theme.realPath, './css'), // from
            path.join(self.publics, theme.name, './css'), // to
            'dir', // default by dir
            function(err) {
                console.log(err);
                if (err) return callback(err);
                return callback(null, logs, modules);
            }
        );
    });
}

// 使用某个主题下的某一模板渲染
// e.g: candy-theme-default/index, {data: data}, callback
Theme.prototype.render = function(template, data, callback) {
    // 先判断是不是有效的文件名
    var pkgname = hub.finder.split(template);
    var filename = hub.finder.split(template, 'filename');
    if (!pkgname || !filename) return callback(new Error('template not found'));
    // 渲染页面时要进行 {{statics}} 变量的替换，这里就是替换成相应主题在 public 下的目录,
    data.statics = path.join(this.publics, pkgname);
    console.log(data);
    render(template, data, function(err, html, tpl, data, engine) {
        if (err) return callback(err);
        callback(null, html, tpl, data);
    });
};

exports = module.exports = Theme;