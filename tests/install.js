import path from 'path'
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
