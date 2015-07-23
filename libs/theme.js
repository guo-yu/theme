import fs from 'fs'
import path from 'path'
import Hub from 'pkghub'
import _ from 'underscore'
import Promise from 'bluebird'
import render from 'pkghub-render'
import * as finder from './finder'

const hub = new Hub
const defaultHome = path.resolve(__dirname, '../', '../', '../')

/**
*
* Class Theme
* @param {String/Path} [home] [the home dir of all themes]
*
**/
export default class Theme {
  constructor(home = defaultHome) {
    this.path = {}
    this.locals = {}
    this.pattern = '-theme-'
    this.path.home = home

    // Fetch parent package.json
    this.package = finder.pkg(this.path.home)

    // Check public folder,
    // Where we are going to copy shadow links.
    this.path.public = path.join(this.path.home, this.package.public || './public')
    
    // Create shadow links
    finder.shadows(this)
  }

  /**
  *
  * Lazy setter of Class Theme
  * @param {[String]} [key] [the key]
  * @param {[Any]} [value] [the value]
  *
  **/
  set(key, value) {
    if (!(key && value)) 
      return this

    this[key] = value
    return this
  }

  /**
  *
  * Inject locals to theme instance in res.locals.
  * @param {[String]} [key] [the keyname of this local in res.locals]
  *
  **/
  local(key) {
    return (req, res, next) => {
      if (!key) 
        return next()

      this.locals[key] = res.locals[key]

      return next()
    }
  }

  /**
  *
  * List all theme module in the seleced home dir
  * e.g: a vaild theme module'name is started with `<parentModuleName>-theme-<themeName>`,
  * 
  * @param {[Function]} [callback] [the callback function triggered when all module listed]
  *
  **/
  list() {
    return hub.themes().then(themes => {
      if (themes && themes.name) {
        return Promise.resolve({
          [themes.name]: themes
        })
      }

      return Promise.resolve(themes)
    })
  }

  /**
  *
  * Install new theme module from npm
  * @param {[String | Array]} [name] [the module name or modules array]
  * @param {[Function]} [callback] [the callback function triggerd when installed]
  *
  **/
  install(name) {
    if (!name) 
      return Promise.reject(new Error('Theme name required'))

    return hub.install(name).then(modules => {
      return finder.shadow(
        modules.dependencies[name], 
        this.path.public
      ).then(() => {
        return Promise.resolve(modules)
      })
    })
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
  render(template, data) {
    // Check if it's valid filename
    let pkgname = finder.split(template)
    let filename = finder.split(template, 'filename')

    if (!filename) 
      return Promise.reject(new Error('Theme.render(); target template not found'))

    if (!pkgname && filename) 
      pkgname = this.default

    if (!pkgname) 
      return Promise.reject(new Error('Theme.render(); target theme not found'))

    // Check if it's a shortname
    if (pkgname.indexOf('-') === -1 && this.package.name) 
      pkgname = this.package.name + this.pattern + pkgname

    // Mix locals, instead of `app.locals` and `res.locals`
    if (!_.isEmpty(this.locals)) 
      data = _.extend(this.locals, data)

    // Return a Promise/A+
    return render(
      [ pkgname, filename ].join('/'), 
      data
    )
  }
}
