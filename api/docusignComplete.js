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
            .on('end', async () => {
                payload = Buffer.concat(payload).toString()
                //console.log('payload received:', payload)
                //console.log('end of payload')
                const result = await xml2js.parseStringPromise(payload, {explicitArray: false, mergeAttrs: true})
                console.log(result)
                res.writeHead(202, {'Content-Type': 'application/json'})
                //res.write(JSON.stringify(result))
                res.write(JSON.stringify(parseDocuSign(result)))
                res.end()
            })

    } else {
        console.error('Non POST request')
        res.writeHead(405, {'Content-Type': 'text/plain'})
        res.write(`What was that? I didn't like that much.`)
        res.end()
    }
}

const parseDocuSign = (docuload) => {
    const envlStatus = docuload.DocuSignEnvelopeInformation.EnvelopeStatus
    const rstatus = docuload.DocuSignEnvelopeInformation.EnvelopeStatus.RecipientStatuses.RecipientStatus
    const du = {
        extraFormField: '',
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
                du.extraFormField += `${f.value}\n`
        } 

    }

    // Envelope values
    du.envelopeId = envlStatus.EnvelopeID
    du.senderUserName = envlStatus.UserName
    du.senderEmail = envlStatus.Email

    return du
}