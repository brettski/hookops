module.exports = (req, res) => {
    const out = {
        status: 'ok',
        time: Date.now(),
        comment: 'Some coment, who knows',
    }
    res.writeHead(200, {'Content-Type':'application/json'});
    res.write(JSON.stringify(out));
    res.end()
}