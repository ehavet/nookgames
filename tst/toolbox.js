import chai from 'chai'
import sinonChai from 'sinon-chai'
import sinon from 'sinon'
import db from '../src/pg-promise'

const { expect } = chai.use(sinonChai)
const database = db()
const dateFaker = (() => {
    let clock
    return {
        setCurrentDate: (date) => {
            clock = sinon.useFakeTimers({ now: date, toFake: ['Date'] })
        },
        restore: () => {
            if (clock) clock.restore()
        }
    }
})()

export {
    sinon,
    expect,
    database,
    dateFaker
}

afterEach(() => {
    sinon.restore()
    dateFaker.restore()
})