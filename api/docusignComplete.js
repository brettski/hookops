'use strict'

// Catch completed docusign webhook
import xml2js from 'xml2js'
import axios from 'axios'
import * as Sentry from '@sentry/node'

Sentry.init({ dsn: process.env.SENTRY_NODE_DSN })
console.log('the dsn', process.env.SENTRY_NODE_DSN)
console.log('zap', process.env.ZAP_DOCUSIGN_IN_HOOK_URL)

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
            .on('end', async () => {
                payload = Buffer.concat(payload).toString()
                //console.log('payload received:', payload)
                //console.log('end of payload')
                const result = await xml2js.parseStringPromise(payload, {explicitArray: false, mergeAttrs: true})
                //res.write(JSON.stringify(result))
                const docusign = parseDocuSign(result)
                try {
                    const axres = await axios.post(process.env.ZAP_DOCUSIGN_IN_HOOK_URL, docusign)
                    if (axres.status < 200 || axres.status > 299) {
                        console.error(`Issue sending hook. status ${axres.status}`)
                        Sentry.captureMessage(`Issue sending webhook request: ${axres}`)
                        return
                    }
                } catch (err) {
                    console.error(err)
                    Sentry.captureException(err)
                    res.writeHead(500, {'Content-Type':'text/plain'})
                    res.write(err.message)
                    res.end()
                    return
                }
                //ZAP_DOCUSIGN_IN_HOOK_URL
                
                res.writeHead(200, {'Content-Type': 'application/json'})
                res.write(JSON.stringify(docusign))
                res.end()


            })

    } else {
        console.error(`Non POST request, ${req.method}`)
        Sentry.captureMessage(`Non POST request, ${req.method}`, 'warning' )
        res.writeHead(405, {'Content-Type': 'text/plain'})
        res.write(`What was that? I didn't like that much.`)
        res.end()
    }
}

const parseDocuSign = (docuload) => {
    const envlStatus = docuload.DocuSignEnvelopeInformation.EnvelopeStatus
    const rstatus = docuload.DocuSignEnvelopeInformation.EnvelopeStatus.RecipientStatuses.RecipientStatus
    const du = {
        extraFormFields: '',
    } // docusign object

    // Receipent values
    du.type = rstatus.Type
    du.email = rstatus.Email
    du.username = rstatus.UserName
    du.sent = rstatus.Sent
    du.delivered = rstatus.delivered
    du.signed = rstatus.Signed
    du.status = rstatus.status

    const formdata = rstatus.FormData.xfdf.fields.field
    for (let i = 0; i < formdata.length; i++) {
        const f = formdata[i]
        switch(f.name) {
            case 'Radio Group e57d8e73-bed2-4588-8218-7c89aa04cf5a':
                du.radioGroup = f.value
                break
            case 'Dropdown 58cab66b-5588-43c1-9dbe-317f8d53b50e':
                du.dropdown = f.value
                break
            case 'Company':
                du.company = f.value
                break
            case 'DateSigned':
                du.dateSigned = f.value
                break
            default:
                du.extraFormFields += `${f.value}\n`
        } 

    }

    // Envelope values
    du.envelopeId = envlStatus.EnvelopeID
    du.senderUserName = envlStatus.UserName
    du.senderEmail = envlStatus.Email
    du.templateName = envlStatus.DocumentStatuses.DocumentStatus.TemplateName

    return du
}