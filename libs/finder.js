var fs = require('fs');
var path = require('path');
var _ = require('underscore');

exports.pkg = function(home) {
  try {
    return require(
      path.join(home, './package.json')
    );
  } catch (err) {
    return null;
  }
}

/*
  @创建一个静态资源软链接
  @theme.name
  @theme.realPath
  @theme.static
*/
exports.shadow = function(theme, publics, callback) {
  if (!theme) return false;
  if (!theme.realPath) return false;
  if (!publics) return false;
  var cb = isFunction(callback) ? callback : function() {};
  if (isRemote(theme.static)) return cb(null);
  var statics = path.join(theme.realPath, theme.static || './static');
  var shadow = path.join(publics, theme.name);
  try {
    if (!fs.existsSync(publics)) fs.mkdirSync(publics);
  } catch (err) {
    throw err;
  }
  try {
    if (fs.readlinkSync(shadow) === statics) {
      return cb(null);
    }
  } catch (err) {
    // 如果没有这个link
    fs.symlinkSync(statics, shadow, 'dir');
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

exports.shadows = function(self) {
  var defaultStaticDir = './static';
  var dir = path.join(self.home, './node_modules');
  if (!fs.existsSync(dir)) return null;
  var files = fs.readdirSync(dir);
  if (!files || files.length === 0) return null;
  var modules = files.filter(function(folder) {
    var abs = path.join(dir, folder);
    var isDir = fs.statSync(abs).isDirectory();
    if (!isDir) return false;
    // [此处有硬编码] 如果不是主题文件夹，直接跳过
    if (folder.indexOf('-theme-') === -1) return false;
    // 如果已经存在 shadow，直接跳过
    if (fs.existsSync(path.join(self.publics, folder))) return true;
    // 如果没有默认的 static folder，直接跳过
    if (!fs.existsSync(path.join(abs, defaultStaticDir))) return false;
    var theme = {}
    theme.name = folder;
    theme.realPath = abs;
    theme.static = defaultStaticDir;
    exports.shadow(theme, self.publics);
    return true;
  });
  return modules;
}

function isRemote(dir) {
  return dir && (dir.indexOf('http') === 0 || dir.indexOf('https') === 0);
}

function isFunction(fn) {
  return fn && _.isFunction(fn);
}
