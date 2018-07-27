const fs         = require('fs')
const http       = require('http')
const https      = require('https')
const express    = require('express')
const serveIndex = require('serve-index')
const app        = express()

const privateKey  = fs.readFileSync('server.key', 'utf8')
const certificate = fs.readFileSync('server.cert', 'utf8')

const vhost = (hostname, app) => (req, res, next) => {
    const host = req.headers.host.split(':')[0]

    hostname = new RegExp(hostname)

    if (hostname.test(host)) {
        return app(req, res, next)
    } else {
        next()
    }
}


// Configure your vhosts here
app.use(vhost('example.com(\.br)?', express()
    .get('/', (req, res) => res.sendFile(__dirname + '/projects/example/index.html'))
    .get('/test', (req, res) => res.send('example test page'))
    .use('/images', express.static('projects/example/images')) // example of static file
))

// localhost with directory listing
app.use('/', express.static('projects'), serveIndex('projects'))


const httpServer  = http.createServer(app)
const httpsServer = https.createServer({ key: privateKey, cert: certificate }, app)

httpServer.listen(80, () => console.log('Server listening on port 80.'))
httpsServer.listen(443, () => console.log('Server listening on port 443.'))


// Enable your user to run node apps on the default HTTP port (80)
// sudo apt-get install libcap2-bin
// sudo setcap cap_net_bind_service=+ep `readlink -f \`which node\``

// References
// https://www.youtube.com/watch?v=GV3hWa5VIQg