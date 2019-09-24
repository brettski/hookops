'use strict'


module.exports = (req, res) => {
    res.status(202).json({
        body: req.body,
        query: req.query,
        cookies: req.cookies
    })
}