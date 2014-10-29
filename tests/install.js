var path = require('path');
var debug = require('debug')('theme:tests:install');
var Theme = require('../index');
var theme = new Theme(path.resolve(__dirname, '../'));

describe('#install', function() {
  it('It should install spec module', function(done) {
    theme.install('mails-flat', function(err, logs, modules){
      if (err)
        return done(err);
      debug(logs);
      debug(modules);
      done();
    });
  });
});