import path from 'path'
import should from 'should'
import Theme from '../dist/theme'

const ROOT = path.resolve(__dirname, '../')
const theme = new Theme(ROOT)

describe('#install', () => {
  it('It should install spec module', function(done) {
    this.timeout(8000)
    theme.install('theme-theme-lily').then(modules => {
      done()
    }).catch(done)
  })
})

describe('#list', () => {
  it('It should list all local themes', done => {
    theme.list().then(list => {
      list.should.have.property('theme-theme-lily')
      list['theme-theme-lily'].should.have.property('name').and.equal('theme-theme-lily')
      list['theme-theme-lily'].should.have.property('author')
      list['theme-theme-lily'].author.should.have.property('name').and.equal('turing')
      done()
    }).catch(done)
  })
})

describe('#render', () => {
  it('It should render html', done => {
    const data = {
      site: 'siteName',
      banner: 'testBanner'
    }
    
    theme.render('theme-theme-lily/index', data)
      .then(html => {
        done()
      }).catch(done)
  })
})

