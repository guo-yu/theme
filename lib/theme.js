var fs = require('fs');
var path = require('path');
var Hub = require('pkghub');
var _ = require('underscore');
var render = require('pkghub-render');
var finder = require('./finder');
var hub = new Hub;

module.exports = Theme;

function Theme(home, locals, defaultTheme) {
  this.home = home || path.resolve(__dirname, '../', '../', '../');
  this.meta = finder.pkg(this.home) || {};
  this.publics = path.join(this.home, this.meta.public || './public');
  this.locals = locals || {};
  this.defaultTheme = defaultTheme || null;
  finder.shadows(this);
}

Theme.prototype.local = function(key) {
  var self = this;
  return function(req, res, next) {
    if (!key) return next();
    self.locals[key] = res.locals[key];
    return next();
  }
}

// 列出所有可用主题
// e.g: theme.list()
// TODO: 在列表出所有主题的同时确保所有主题都在 public 目录下添加了镜像
Theme.prototype.list = function(callback) {
  var self = this;
  hub.themes(function(err, themes) {
    if (err) return callback(err);
    if (themes && themes.name) {
      var results = {};
      results[themes.name] = themes;
      return callback(err, results);
    }
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
    finder.shadow(theme, self.publics, function(err) {
      callback(err, logs, modules);
    });
  });
}

// 使用某个主题下的某一模板渲染
// 如果不给定主题，寻找默认主题
// e.g: candy-theme-default/index, {data: data}, callback
// e.g: 使用 shortname 加载：default/index; 会自动加上 candy-theme 这个关键词
Theme.prototype.render = function(template, data, callback) {
  // 先判断是不是有效的文件名
  var pkgname = hub.finder.split(template);
  var filename = hub.finder.split(template, 'filename');
  var cb = (callback && _.isFunction(callback)) ? callback : function() {};
  if (!filename) return cb(new Error('template not found'));
  if (!pkgname && filename) pkgname = this.defaultTheme;
  if (!pkgname) return cb(new Error('theme not found'));
  // 判断是不是 shortname, 这里有一个硬编码，需要把这个功能放到 pkghub 中
  if (pkgname.indexOf('-') === -1 && this.meta.name) pkgname = this.meta.name + '-theme-' + pkgname;
  // 混合 locals，替代 app.locals 与 res.locals
  if (!_.isEmpty(this.locals)) data = _.extend(this.locals, data);
  return render([pkgname, filename].join('/'), data, cb);
}
