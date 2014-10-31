var path = require('path');
var debug = require('debug')('theme:tests:render');
var Theme = require('../index');
var theme = new Theme(path.resolve(__dirname, '../'));

describe('#render', function() {
  it('It should render html', function(done) {
    var data = {
      site: 'siteName',
      banner: 'testBanner'
    };
    theme.render('theme-theme-lily/index', data, function(err, html){
      if (err)
        return done(err);
      
      debug(html);
      done();
    });
  });
});