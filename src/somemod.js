'use strict'

// Can we call this from an api function?
const conout = msg => {
    console.log(`TIME: ${msg}`)
}
module.exports = {
    conout
}