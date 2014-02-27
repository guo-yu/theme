var fs = require('fs'),
    path = require('path'),
    Hub = require('pkghub'),
    _ = require('underscore'),
    render = require('pkghub-render');

var hub = new Hub;

var Theme = function(home, defaultTheme, locals) {
    this.home = home || path.resolve(__dirname, '../', '../', '../');
    this.meta = this.pkg() || {};
    this.publics = path.join(this.home, this.meta.public || './public');
    this.defaults = defaultTheme || null;
    this.locals = locals || {};
    if (this.defaults) this.shadow();
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

Theme.prototype.shadow = function(selected, callback) {
    var self = this;
    var theme = selected || this.defaults;
    if (!theme) return false;
    var staticDir = theme.static;
    var isRemote = staticDir && (staticDir.indexOf('http') === 0 || staticDir.indexOf('https') === 0);
    if (isRemote) {
        if (callback && _.isFunction(callback)) return callback(null);
        return true;
    }
    var statics = path.join(theme.realPath, staticDir || './static');
    // 创建一个静态资源软链接
    try {
        var shadow = path.join(self.publics, theme.name);
        // mkdirp.sync(shadow);
        if (!fs.existsSync(shadow)) fs.symlinkSync(statics, shadow, 'dir');
        if (!callback) return true;
        return callback(null);
    } catch (err) {
        if (!callback) throw err;
        return callback(err);
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
        self.shadow(theme, function(err){
            callback(err, logs, modules);
        });
    });
}

// 使用某个主题下的某一模板渲染
// e.g: candy-theme-default/index, {data: data}, callback
// e.g: 使用 shortname 加载：default/index; 会自动加上 candy-theme 这个关键词
Theme.prototype.render = function(template, data, callback) {
    // 先判断是不是有效的文件名
    var pkgname = hub.finder.split(template);
    var filename = hub.finder.split(template, 'filename');
    var cb = (callback && _.isFunction(callback)) ? callback : function(){};
    if (!pkgname || !filename) return cb(new Error('template not found'));
    // 判断是不是 shortname, 这里有一个硬编码，需要把这个功能放到 pkghub 中
    if (pkgname.indexOf('-') === -1 && this.meta.name) pkgname = this.meta.name + '-theme-' + pkgname;
    // 混合 locals，替代 app.locals 与 res.locals
    if (!_.isEmpty(this.locals)) data = _.extend(this.locals, data);
    // 渲染页面时要进行 {{static}} 变量的替换，这里就是替换成相应主题在 public 下的目录,
    data.static = '/' + pkgname;
    return render([pkgname, filename].join('/'), data, cb);
};

exports = module.exports = Theme;