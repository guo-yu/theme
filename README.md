## ![logo](https://cdn1.iconfinder.com/data/icons/august/PNG/Colors.png) theme ![npm](https://badge.fury.io/js/theme.png)

a smart theme loader for CMS systems.

### Installation

```bash
$ npm install theme --save
```

### Example

require theme module and init a valid theme manager with `home` dir.
a `home` dir is the very parent dir of `node_modules` of your project.
assume your project named `candy`, of course in the package.json.

- `candy` (HOME)
  - package.json (name="candy")
  - `public` (static files locate here)
  - `node_modules`
    - `candy-theme-default`
      - package.json("view engine"="jade","static"="./static")
      - home.jade
      - `static` (your theme's static files)
    - `candy-theme-colorful`
    - `underscore` just a example
    - other-deps...

Theme will load NPM module as a theme by package name, and auto-search the correct result. even not fully filename provided. So here is a simple example, we provide `default/home` as a shortname of `candy-theme-default/home.jade`:

```js
import Theme from 'theme'
const themes = new Theme(__dirname)

app.get('/article', function(req, res, next) {
  // some logic to fetch data ...
  var data = [1,2,3,4,5];
  // render theme by shortname
  themes.render('default/home', data)
    then(html => {
      // theme will replace your static files root by {{static}}
      // so make sure in your theme, import static file like:
      // href="{{static}}/css/basic.css"
      res.send(html)
    })
    .catch(next)
});
```
In this case below, we list all available themes which named like `candy-theme-balabala`:

```js
theme.list()
  .then(list => {
    // underscore and other packages will not be listd here.
    // the result is a parsed JSON-like Object.
    console.log(list)
  })
```
Theme also support install theme by NPM package name:

```js
theme.install('mails-flat')
  .then(modules => {
    console.log(module)
  })
```

Enjoy your themes and be happy publishing them to NPM !

### Tests
```bash
$ npm install .
$ npm test
```

### Contributing
- Fork this repo
- Clone your repo
- Install dependencies
- Checkout a feature branch
- Feel free to add your features
- Make sure your features are fully tested
- Open a pull request, and enjoy <3

### MIT license
Copyright (c) 2014 turing &lt;o.u.turing@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

---
![docor](https://cdn1.iconfinder.com/data/icons/windows8_icons_iconpharm/26/doctor.png)
built upon love by [docor](https://github.com/turingou/docor.git) v0.1.2