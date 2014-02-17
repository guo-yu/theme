var fs = require('fs'),
    path = require('path'),
    Hub = require('pkghub'),
    _ = require('underscore'),
    mkdirp = require('mkdirp'),
    render = require('pkghub-render');

var hub = new Hub;

var Theme = function(home, defaultTheme, locals) {
    this.home = home || path.resolve(__dirname, '../', '../', '../');
    this.publics = path.join(this.home, './public');
    this.meta = this.pkg() || {};
    this.defaultTheme = defaultTheme;
    this.locals = locals || {};
}

Theme.prototype.config = function(key, value) {
    if (key && value) this[key] = value;
    return this[key];
}

Theme.prototype.pkg = function() {
    try {
        return require(path.join(this.home, './package.json'));
    } catch (err) {
        return null;
    }
}

// 列出所有可用主题
// e.g: theme.list()
Theme.prototype.list = function(callback) {
    var self = this;
    hub.themes(function(err, themes) {
        if (err) return callback(err);
        self.themes = themes;
        if (!callback) return false;
        return callback(err, themes);
    });
}

// 安新主题
// e.g: candy-theme-default/index, {data: data}, callback
Theme.prototype.install = function(name, callback) {
    if (!name) return callback(new Error('theme name required'));
    var self = this;
    // 安装到某个目录，name 可以是字符串或者数组
    hub.install(name, function(err, logs, modules) {
        if (err) return callback(err);
        var theme = modules.dependencies[name];
        var dir = theme.realPath;
        var statics = path.join(dir, theme.static || './static');
        try {
            var shadow = path.join(self.publics, theme.name);
            mkdirp.sync(shadow);
            // 创建一个静态资源软链接
            fs.symlink(statics, shadow, 'dir', function(err) {
                if (err) return callback(err);
                return callback(null, logs, modules);
            });
        } catch (err) {
            return callback(err)
        }
    });
}

// 使用某个主题下的某一模板渲染
// e.g: candy-theme-default/index, {data: data}, callback
// e.g: 使用 shortname 加载：default/index; 会自动加上 candy-theme 这个关键词
Theme.prototype.render = function(template, data, callback) {
    // 先判断是不是有效的文件名
    var pkgname = hub.finder.split(template);
    var filename = hub.finder.split(template, 'filename');
    if (!pkgname || !filename) return callback(new Error('template not found'));
    // 判断是不是 shortname, 这里有一个硬编码，需要把这个功能放到 pkghub 中
    if (pkgname.indexOf('-') === -1 && this.meta.name) pkgname = this.meta.name + '-theme-' + pkgname;
    // 混合 locals，替代 app.locals 与 res.locals
    if (!_.isEmpty(this.locals)) data = _.extend(this.locals, data);
    // 渲染页面时要进行 {{static}} 变量的替换，这里就是替换成相应主题在 public 下的目录,
    data.static = path.join(this.publics, pkgname);
    render([pkgname, filename].join('/'), data, function(err, html, tpl, data, engine) {
        if (err) return callback(err);
        callback(null, html, tpl, data);
    });
};

exports = module.exports = Theme;