import path from 'path'
import should from 'should'
import * as finder from '../dist/finder'

describe('#pkg', () => {
  it('It should read package.json', done => {
    const pkg = finder.pkg(path.resolve(__dirname, '../'))
    pkg.should.have.property('name').and.equal('theme')
    done()
  })
  it('It should return a blank object when package.json not found', done => {
    const pkg = finder.pkg(path.resolve(__dirname, '../../'))
    pkg.should.not.have.property('name')
    done()
  })
})