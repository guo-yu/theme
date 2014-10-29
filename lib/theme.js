var fs = require('fs');
var path = require('path');
var Hub = require('pkghub');
var _ = require('underscore');
var render = require('pkghub-render');
var debug = require('debug')('theme:core');
var finder = require('./finder');
var hub = new Hub;

var defaultHome = path.resolve(__dirname, '../', '../', '../');

module.exports = Theme;

/**
*
* Class Theme
* @param {[String/Path]} [home] [the home dir of all themes]
* @param {[Object]} [locals] [default locals of a theme]
* @param {[defaultTheme]} [String] [the default theme name]
*
**/
function Theme(home) {
  // Set paths
  this.path = {};
  this.path.home = home || defaultHome;

  // Fetch parent package.json
  this.package = finder.pkg(this.path.home);

  // Check public folder,
  // Where we are going to copy shadow links.
  this.path.public = path.join(this.path.home, this.package.public || './public');
    
  // Create shadow links
  finder.shadows(this);
}

/**
*
* Lazy setter of Class Theme
* @param {[String]} [key] [the key]
* @param {[Any]} [value] [the value]
*
**/
Theme.prototype.set = function(key, value) {
  if (!(key && value)) return this;
  this[key] = value;
  return this;
};

/**
*
* Inject locals to theme instance in res.locals.
* @param {[String]} [key] [the keyname of this local in res.locals]
*
**/
Theme.prototype.local = function(key) {
  var self = this;
  return function(req, res, next) {
    if (!key) return next();
    self.locals[key] = res.locals[key];
    return next();
  }
};

/**
*
* List all theme module in the seleced home dir
* e.g: a vaild theme module'name is started with `<parentModuleName>-theme-<themeName>`,
* 
* @param {[Function]} [callback] [the callback function triggered when all module listed]
*
**/
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
};

/**
*
* Install new theme module from npm
* @param {[String]} [name] [the module name]
* @param {[Function]} [callback] [the callback function triggerd when installed]
*
**/
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
};

/**
*
* Render html using selected target theme and template name
* e.g: theme.render('myParent-theme-default/index', {a:1}, function(html){});
*
* Shortname is also supported:
* e.g: theme.render(default/index, {a:a}, function(html){});
*
**/
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
};
