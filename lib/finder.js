var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var debug = require('debug')('theme:finder');

exports.pkg = pkg;
exports.shadow = shadow;
exports.shadows = shadows;

/**
*
* Create a shadow link of theme's static folder.
* 
* @param {[Theme Object]} [theme] the theme object.
* @param {[String]} [realPath] [the realPath of target theme]
* @param {[Function]} [callback] [the callback function]
*
**/
function shadow(theme, public, callback) {
  if (!theme) 
    return false;
  if (!theme.realPath) 
    return false;
  if (!public) 
    return false;

  var cb = isFunction(callback) ? callback : function() {};

  if (isRemote(theme.static)) 
    return cb(null);

  var statics = path.join(theme.realPath, theme.static || './static');
  var shadow = path.join(public, theme.name);

  try {
    if (!fs.existsSync(public)) 
      fs.mkdirSync(public);
  } catch (err) {
    throw err;
  }

  try {
    if (fs.readlinkSync(shadow) === statics)
      return cb(null);
  } catch (err) {
    fs.symlinkSync(statics, shadow, 'dir'); // if link do not exist
    return cb(null);
  }

  try {
    // 如果软链没有指向目标，删除软链
    fs.unlinkSync(shadow);
    // 重新生成软链
    fs.symlinkSync(statics, shadow, 'dir');
    return cb(null);
  } catch (err) {
    throw err;
  }
}

/**
*
* Create shadows of a theme instance.
* @param {[Theme Object]} [self]
*
**/
function shadows(self) {
  var defaultStaticDir = './static';
  var dir = path.join(self.home, './node_modules');

  if (!fs.existsSync(dir)) 
    return null;

  var files = fs.readdirSync(dir);

  if (!files || files.length === 0) 
    return null;

  var modules = files.filter(function(folder) {
    var abs = path.join(dir, folder);
    var isDir = fs.statSync(abs).isDirectory();
    if (!isDir) 
      return false;
    // [此处有硬编码] 如果不是主题文件夹，直接跳过
    if (folder.indexOf('-theme-') === -1) 
      return false;
    // 如果已经存在 shadow，直接跳过
    if (fs.existsSync(path.join(self.publics, folder))) 
      return true;
    // 如果没有默认的 static folder，直接跳过
    if (!fs.existsSync(path.join(abs, defaultStaticDir))) 
      return false;

    var theme = {}
    theme.name = folder;
    theme.realPath = abs;
    theme.static = defaultStaticDir;
    exports.shadow(theme, self.publics);
    
    return true;
  });

  return modules;
}

// Fetch package.json from parent dir
function pkg(home) {
  try {
    return require(path.join(home, './package.json'));
  } catch (err) {
    return {};
  }
}

// Check if a string is uri
function isRemote(dir) {
  return dir && (dir.indexOf('http') === 0 || dir.indexOf('https') === 0);
}

// Check if a `fn` is function
function isFunction(fn) {
  return fn && _.isFunction(fn);
}
