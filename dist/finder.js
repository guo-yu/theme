'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.shadow = shadow;
exports.shadows = shadows;
exports.split = split;
exports.pkg = pkg;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _bluebird = require('bluebird');

/**
*
* Create a shadow link of theme's static folder.
* 
* @param {Theme} [theme] the theme object.
* @param {String} [realPath] [the realPath of target theme]
* @return {Promise}
*
**/

var _bluebird2 = _interopRequireDefault(_bluebird);

function shadow(theme, publicPath) {
  if (!theme || !theme.realPath || !publicPath) return _bluebird2['default'].reject(new Error('shadow() invalid arguments'));

  // Ignore URIs.
  if (isRemote(theme['static'])) return _bluebird2['default'].resolve();

  var statics = _path2['default'].join(theme.realPath, theme['static'] || './static');
  var shadow = _path2['default'].join(publicPath, theme.name);

  // Check if public folder exist,
  // If not, create a blank public folder using given
  try {
    if (!_fs2['default'].existsSync(publicPath)) _fs2['default'].mkdirSync(publicPath);
  } catch (err) {
    return _bluebird2['default'].reject(err);
  }

  // Check if a shadow is linked to real static folder
  try {
    if (_fs2['default'].readlinkSync(shadow) === statics) return _bluebird2['default'].resolve();
  } catch (err) {
    // If link do not exist,
    // Create a shadow link.
    try {
      _fs2['default'].symlinkSync(statics, shadow, 'dir');
    } catch (err) {
      return _bluebird2['default'].reject(err);
    }

    return _bluebird2['default'].resolve();
  }

  // If a shadow is not linked to the given static folder path
  // Remove it first
  try {
    _fs2['default'].unlinkSync(shadow);
    _fs2['default'].symlinkSync(statics, shadow, 'dir');
    return _bluebird2['default'].resolve();
  } catch (err) {
    return _bluebird2['default'].reject(err);
  }
}

/**
*
* Create static folders' shadows of a theme instance.
* @param {Theme} [self]
*
**/

function shadows(self) {
  var node_modules = _path2['default'].join(self.path.home, './node_modules');

  if (!_fs2['default'].existsSync(node_modules)) return;

  var files = _fs2['default'].readdirSync(node_modules);

  if (!files || files.length === 0) return;

  var modules = files.filter(function (folder) {
    var modulePath = _path2['default'].join(node_modules, folder);
    var isDir = _fs2['default'].statSync(modulePath).isDirectory();
    var packagePath = _path2['default'].join(modulePath, './package.json');

    // Check if it's a valid folder
    if (!isDir) return;

    // Check if the folder is a theme module
    if (folder.indexOf(self.pattern) === -1) return;

    // Check if there is a exist shadow
    if (_fs2['default'].existsSync(_path2['default'].join(self.path['public'], folder))) return;

    var pkg = {};

    if (_fs2['default'].existsSync(packagePath)) pkg = readPkg(packagePath);

    // The relative static folder path of this theme module.
    var staticPath = pkg['static'] || './static';

    // Check if there is a valid static folder in this theme module
    if (!_fs2['default'].existsSync(_path2['default'].join(modulePath, staticPath))) return;

    var theme = {
      name: folder,
      realPath: modulePath,
      'static': staticPath
    };

    shadow(theme, self.path['public']);

    return true;
  });

  return modules;
}

function split(name, isFilename) {
  if (!name || name.indexOf('/') === -1) return;
  if (!isFilename) return name.substr(0, name.indexOf('/'));

  return name.substr(name.indexOf('/') + 1);
}

// Fetch package.json from parent dir

function pkg(home) {
  return readPkg(_path2['default'].join(home, './package.json'));
}

function readPkg(filepath) {
  try {
    return require(filepath);
  } catch (err) {
    return {};
  }
}

// Check if a string is uri
function isRemote(dir) {
  return dir && (dir.indexOf('http') === 0 || dir.indexOf('https') === 0);
}
//# sourceMappingURL=finder.js.map