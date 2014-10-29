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

  // Ignore URIs.
  if (isRemote(theme.static)) 
    return cb(null);

  var statics = path.join(theme.realPath, theme.static || './static');
  var shadow = path.join(public, theme.name);

  // Check if public folder exist,
  // If not, create a blank public folder using given
  try {
    if (!fs.existsSync(public)) 
      fs.mkdirSync(public);
  } catch (err) {
    throw err;
  }

  // Check if a shadow is linked to real static folder
  try {
    if (fs.readlinkSync(shadow) === statics)
      return cb(null);
  } catch (err) {
    // If link do not exist,
    // Create a shadow link.
    fs.symlinkSync(statics, shadow, 'dir');
    return cb(null);
  }

  // If a shadow is not linked to the given static folder path
  // Remove it first
  try {
    fs.unlinkSync(shadow);
    fs.symlinkSync(statics, shadow, 'dir');
    return cb(null);
  } catch (err) {
    throw err;
  }
}

/**
*
* Create static folders' shadows of a theme instance.
* @param {[Theme Object]} [self]
*
**/
function shadows(self) {
  var node_modules = path.join(self.path.home, './node_modules');

  if (!fs.existsSync(node_modules)) 
    return null;

  var files = fs.readdirSync(node_modules);

  if (!files || files.length === 0) 
    return null;

  var modules = files.filter(function(folder) {
    var modulePath = path.join(node_modules, folder);
    var isDir = fs.statSync(modulePath).isDirectory();
    var packagePath = path.join(modulePath, './package.json');

    // Check if it's a valid folder
    if (!isDir) return;

    // Check if the folder is a theme module
    if (folder.indexOf(self.pattern) === -1) return;

    // Check if there is a exist shadow
    if (fs.existsSync(path.join(self.path.public, folder))) return;

    if (fs.existsSync(packagePath)) {
      try {
        var packageJSON = fs.readJSON(packagePath);
      } catch (err) {
        var packageJSON = {};
      }
    }

    // The relative static folder path of this theme module.
    var staticPath = packageJSON.static || './static';

    // Check if there is a valid static folder in this theme module
    if (!fs.existsSync(path.join(modulePath, staticPath))) return;

    var theme = {};
    theme.name = folder;
    theme.realPath = modulePath;
    theme.static = staticPath;

    shadow(theme, self.path.public);
    
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
