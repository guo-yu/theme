var path = require('path');
var debug = require('debug')('theme:tests:list');
var Theme = require('../index');
var theme = new Theme(path.resolve(__dirname, '../'));

describe('#list', function() {
  it('It should list all local themes', function(done) {
    theme.list(function(err, list){
      if (err)
        return done(err);
      debug(list);
      done();
    });
  });
});