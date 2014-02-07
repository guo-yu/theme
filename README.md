## theme ![npm](https://badge.fury.io/js/theme.png)

a theme loader for Express / Koa

### Installation

```
$ npm install theme
```

### Example

require theme module and init a valid theme
````javascript
var Theme = require('theme');
var candy = new Theme('/some/dir/name/to/theme');
````
use `candy` theme in `app.js`

````javascript
app.get('/article', function(req, res, next) {
    // some logic to fetch data ...
    return res.send(candy.render('article', data));
});
````
switch in multiple themes:
````javascript
var themes = new Theme({
    candy: '/some/dir/to/theme/candy',
    green: '/some/dir/to/theme/green'
});

app.get('/article/:theme', function(req, res, next){
    if (!themes[req.params.theme]) return res.send('404');
    return res.send(themes[req.params.theme].render('article'));
})
````
load NPM module as a theme by package name.
````javascript
// load a single theme by name
var candy = new Theme('candy-theme-default');
// or load themes
var themes = new Theme([
    'candy-theme-default',
    'candy-theme-green'
]);
````
auto-scan availables themes:

````javascript
// just init with no params.
var themes = new Theme();

console.log(themes);

// only modules' name contains 'theme' will be list.
{
    'candy-theme-default': {
        name: 'candy-theme-default',
        ......
    },
    'candy-theme-green': {
        name: 'candy-theme-default',
        ......
    }
}
````
enjoy your themes and try to publish them to NPM.

### API
check this file: `index.js`

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