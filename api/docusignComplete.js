'use strict'

// Catch completed docusign webhook
import xml2js from 'xml2js'

export default (req, res) => {
    let payload = []
    if (req.method == 'POST') {
        req
            .on('error', err => {
                console.error(err)
            })
            .on('data', chunk => {
                payload.push(chunk);
            })
            .on('end', () => {
                payload = Buffer.concat(payload).toString()
                //console.log('payload received:', payload)
                //console.log('end of payload')
                xml2js.parseStringPromise(payload, {explicitArray: false})
                    .then(result => {
                        console.log(result.DocuSignEnvelopeInformation)
                        /console.log('*next*')
                        const val0 = result.DocuSignEnvelopeInformation.EnvelopeStatus.RecipientStatuses
                        console.log(val0)
                        const formdata = val0.RecipientStatus.FormData.xfdf.fields.field
                        console.log('BREAK')
                        console.log(formdata)
                        console.log(formdata[1].$)
                        console.log(formdata[1].value)
                    })
                    .catch((err) => {
                        console.error('oh crap:', err)
                    })
                
                
                
                res.statusCode = 202
                res.end()
            })

    } else {
        console.error('Non POST request')
        res.writeHead(405, {'Content-Type': 'text/plain'})
        res.write(`What was that? I didn't like that much.`)
        res.end()
    }
}

const parsePayload = (payload) => {

}