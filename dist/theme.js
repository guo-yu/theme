'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _pkghub = require('pkghub');

var _pkghub2 = _interopRequireDefault(_pkghub);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _pkghubRender = require('pkghub-render');

var _pkghubRender2 = _interopRequireDefault(_pkghubRender);

var _finder = require('./finder');

var finder = _interopRequireWildcard(_finder);

var hub = new _pkghub2['default']();
var defaultHome = _path2['default'].resolve(__dirname, '../', '../', '../');

/**
*
* Class Theme
* @param {String/Path} [home] [the home dir of all themes]
*
**/

var Theme = (function () {
  function Theme() {
    var home = arguments.length <= 0 || arguments[0] === undefined ? defaultHome : arguments[0];

    _classCallCheck(this, Theme);

    this.path = {};
    this.locals = {};
    this.pattern = '-theme-';
    this.path.home = home;

    // Fetch parent package.json
    this['package'] = finder.pkg(this.path.home);

    // Check public folder,
    // Where we are going to copy shadow links.
    this.path['public'] = _path2['default'].join(this.path.home, this['package']['public'] || './public');

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

  _createClass(Theme, [{
    key: 'set',
    value: function set(key, value) {
      if (!(key && value)) return this;

      this[key] = value;
      return this;
    }

    /**
    *
    * Inject locals to theme instance in res.locals.
    * @param {[String]} [key] [the keyname of this local in res.locals]
    *
    **/
  }, {
    key: 'local',
    value: function local(key) {
      var _this = this;

      return function (req, res, next) {
        if (!key) return next();

        _this.locals[key] = res.locals[key];

        return next();
      };
    }

    /**
    *
    * List all theme module in the seleced home dir
    * e.g: a vaild theme module'name is started with `<parentModuleName>-theme-<themeName>`,
    * 
    * @param {[Function]} [callback] [the callback function triggered when all module listed]
    *
    **/
  }, {
    key: 'list',
    value: function list() {
      return hub.themes().then(function (themes) {
        if (themes && themes.name) {
          return _bluebird2['default'].resolve(_defineProperty({}, themes.name, themes));
        }

        return _bluebird2['default'].resolve(themes);
      });
    }

    /**
    *
    * Install new theme module from npm
    * @param {[String | Array]} [name] [the module name or modules array]
    * @param {[Function]} [callback] [the callback function triggerd when installed]
    *
    **/
  }, {
    key: 'install',
    value: function install(name) {
      var _this2 = this;

      if (!name) return _bluebird2['default'].reject(new Error('Theme name required'));

      return hub.install(name).then(function (modules) {
        return finder.shadow(modules.dependencies[name], _this2.path['public']).then(function () {
          return _bluebird2['default'].resolve(modules);
        });
      });
    }

    /**
    *
    * Render html using selected target theme and template name
    * e.g: theme.render('myParent-theme-default/index', {a:1}, function(html){});
    *
    * Shortname is also supported:
    * e.g: theme.render(default/index, {a:a}, function(html){});
    *
    **/
  }, {
    key: 'render',
    value: function render(template, data) {
      // Check if it's valid filename
      var pkgname = finder.split(template);
      var filename = finder.split(template, 'filename');

      if (!filename) return _bluebird2['default'].reject(new Error('Theme.render(); target template not found'));

      if (!pkgname && filename) pkgname = this['default'];

      if (!pkgname) return _bluebird2['default'].reject(new Error('Theme.render(); target theme not found'));

      // Check if it's a shortname
      if (pkgname.indexOf('-') === -1 && this['package'].name) pkgname = this['package'].name + this.pattern + pkgname;

      // Mix locals, instead of `app.locals` and `res.locals`
      if (!_underscore2['default'].isEmpty(this.locals)) data = _underscore2['default'].extend(this.locals, data);

      // Return a Promise/A+
      return (0, _pkghubRender2['default'])([pkgname, filename].join('/'), data);
    }
  }]);

  return Theme;
})();

exports['default'] = Theme;
module.exports = exports['default'];
//# sourceMappingURL=theme.js.map