import fs from 'fs'
import path from 'path'
import _ from 'underscore'
import Promise from 'bluebird'

/**
*
* Create a shadow link of theme's static folder.
* 
* @param {Theme} [theme] the theme object.
* @param {String} [realPath] [the realPath of target theme]
* @return {Promise}
*
**/
export function shadow(theme, publicPath) {
  if (!theme || !theme.realPath || !publicPath) 
    return Promise.reject(new Error('shadow() invalid arguments'))

  // Ignore URIs.
  if (isRemote(theme.static)) 
    return Promise.resolve()

  const statics = path.join(theme.realPath, theme.static || './static')
  const shadow = path.join(publicPath, theme.name)

  // Check if public folder exist,
  // If not, create a blank public folder using given
  try {
    if (!fs.existsSync(publicPath)) 
      fs.mkdirSync(publicPath)
  } catch (err) {
    return Promise.reject(err)
  }

  // Check if a shadow is linked to real static folder
  try {
    if (fs.readlinkSync(shadow) === statics)
      return Promise.resolve()
  } catch (err) {
    // If link do not exist,
    // Create a shadow link.
    try {
      fs.symlinkSync(statics, shadow, 'dir')
    } catch (err) {
      return Promise.reject(err)
    }

    return Promise.resolve()
  }

  // If a shadow is not linked to the given static folder path
  // Remove it first
  try {
    fs.unlinkSync(shadow)
    fs.symlinkSync(statics, shadow, 'dir')
    return Promise.resolve()
  } catch (err) {
    return Promise.reject(err)
  }
}

/**
*
* Create static folders' shadows of a theme instance.
* @param {Theme} [self]
*
**/
export function shadows(self) {
  const node_modules = path.join(self.path.home, './node_modules')

  if (!fs.existsSync(node_modules)) 
    return

  const files = fs.readdirSync(node_modules)

  if (!files || files.length === 0) 
    return

  var modules = files.filter(function(folder) {
    const modulePath = path.join(node_modules, folder)
    const isDir = fs.statSync(modulePath).isDirectory()
    const packagePath = path.join(modulePath, './package.json')

    // Check if it's a valid folder
    if (!isDir) 
      return

    // Check if the folder is a theme module
    if (folder.indexOf(self.pattern) === -1) 
      return

    // Check if there is a exist shadow
    if (fs.existsSync(path.join(self.path.public, folder))) 
      return

    var pkg = {}

    if (fs.existsSync(packagePath))
      pkg = readPkg(packagePath)

    // The relative static folder path of this theme module.
    const staticPath = pkg.static || './static'

    // Check if there is a valid static folder in this theme module
    if (!fs.existsSync(path.join(modulePath, staticPath))) 
      return

    const theme = {
      name: folder,
      realPath: modulePath,
      static: staticPath
    }

    shadow(theme, self.path.public)
    
    return true
  })

  return modules
}

export function split(name, isFilename) {
  if (!name || name.indexOf('/') === -1) 
    return
  if (!isFilename) 
    return name.substr(0, name.indexOf('/'))

  return name.substr(name.indexOf('/') + 1)
}

// Fetch package.json from parent dir
export function pkg(home) {
  return readPkg(path.join(home, './package.json'))
}

function readPkg(filepath) {
  try {
    return require(filepath)
  } catch (err) {
    return {}
  }
}

// Check if a string is uri
function isRemote(dir) {
  return dir && (dir.indexOf('http') === 0 || dir.indexOf('https') === 0)
}
