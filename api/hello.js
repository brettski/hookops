'use strict'
const log = require('../src/somemod')

module.exports = (req, res) => {
    // testing central code in now environment
    log.conout('Successful')
    res.status(200).send(`Test successful`)
}