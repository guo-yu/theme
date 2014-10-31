var path = require('path');
var should = require('should');
var debug = require('debug')('theme:tests:list');
var Theme = require('../index');
var theme = new Theme(path.resolve(__dirname, '../'));

describe('#list', function() {
  it('It should list all local themes', function(done) {
    theme.list(function(err, list){
      if (err)
        return done(err);

      debug(list);

      list.should.have.property('theme-theme-lily');
      list['theme-theme-lily'].should.have.property('name').and.equal('theme-theme-lily');
      list['theme-theme-lily'].should.have.property('author');
      list['theme-theme-lily'].author.should.have.property('name').and.equal('turing');

      done();
    });
  });
});