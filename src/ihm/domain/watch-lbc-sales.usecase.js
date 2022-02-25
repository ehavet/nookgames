import fs from 'fs'
import readline from 'readline'
import {google} from 'googleapis'
import {Base64} from 'js-base64'
import cheerio from 'cheerio'

// If modifying these scopes, delete token.json.
const SCOPES = [
    'https://mail.google.com/'
]
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json'

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Gmail API.
    authorize(JSON.parse(content), getAdsToRepost);
})

// export async function getSoldItems() {
//    try {
//        // Load client secrets from a local file.
//        const credentialsContent = await fs.readFileSync('credentials.json')
//        // Authorize a client with credentials, then call the Gmail API.
//        return await authorize(JSON.parse(credentialsContent), getAdsToRepost)
//    } catch (error) {
//        return console.log('Error loading client secret file:', err);
//    }
//}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
async function authorize(credentials, callback) {
    console.log(credentials)
    const {client_secret, client_id, redirect_uris} = credentials.web
    const oAuth2Client = await new google.auth.OAuth2(client_id, client_secret, redirect_uris[0])

    try {
        // Check if we have previously stored a token.
        const token = await fs.readFileSync(TOKEN_PATH)
        await oAuth2Client.setCredentials(JSON.parse(token))
        return await callback(oAuth2Client)
    } catch (error) {
        return getNewToken(oAuth2Client, callback)
    }

}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
    console.log('dfssfdsfsfsfsfsf')
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    })
    console.log('Authorize this app by visiting this url:', authUrl)
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    })
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close()
        oAuth2Client.getToken(decodeURIComponent(code), async (err, token) => {
            if (err) return console.error('Error retrieving access token', err)
            oAuth2Client.setCredentials(token)
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err)
                console.log('Token stored to', TOKEN_PATH)
            })
            await callback(oAuth2Client)
        })
    })
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function getAdsToRepost(auth) {
    const gmail = google.gmail({version: 'v1', auth})
    let messageIds

    let list
    try {
        list = await gmail.users.messages.list({
            userId: 'me',
            maxResults: 10,
            q: 'from:(Paiement sécurisé via leboncoin <*@messagerie.leboncoin.fr>)'
        })
    } catch (error) {
        return console.log('The API returned an error: ' + error)
    }

    if (list.data.messages.length > 0) {
        messageIds = list.data.messages.map((message) => {
            return message.id
        })
        console.log(messageIds)
    }

    Array.prototype.uniq = function () {
        return Array.from(new Set(this))
    }

    let adToRepost = []
    if (messageIds.length > 0) {
        const messageList = await Promise.all(
            messageIds
                .map(async (id) => {
                    const detailedMessage = await gmail.users.messages.get({userId: 'me', id: id})
                    const subjectHeader = detailedMessage.data.payload.headers.find((header) => {
                        return header.name === 'Subject'
                    })
                    const fromHeader = detailedMessage.data.payload.headers.find((header) => {
                        return header.name === 'From'
                    })

                    if (fromHeader.value.includes('Paiement sécurisé via leboncoin')) {
                        try {
                            const body = detailedMessage.data.payload.parts[0].parts[0].parts[1].body.data
                            const htmlBody = await Base64.decode(body.replace(/-/g, '+').replace(/_/g, '/'))
                            const $ = await cheerio.load(htmlBody)
                            const adLinkElement = await $("a[href^='https://www.leboncoin.fr/consoles_jeux_video/']")[0]
                            if (adLinkElement) {
                                const adUriId = await $(adLinkElement).attr('href').split('/').pop().split('.htm').shift()
                                return {id: id, header: {from: fromHeader.value, subject: subjectHeader.value}, ad: {uriId: adUriId}}
                            }
                        } catch (error) {
                            return console.log('The API returned an error : ' + error)
                        }

                    }

                })
        )


        const cleanMessageList = messageList.filter((element) => {
            return element
        })

        console.log(`LOOOL ${cleanMessageList}`)

        for (const message of cleanMessageList) {
            const subject = message.header.subject
            switch (true) {
                case subject.includes('Nouveau message sur leboncoin'):
                case subject.includes('Nouveau message concernant l\'annonce'):
                    try {
                        await gmail.users.messages.delete({userId: 'me', id: message.id})
                    } catch (error) {
                        return console.log('The API returned an error : ' + error)
                    }
                    adToRepost.push(message.ad.uriId)
                    break;
                default:
                    console.log(`rien`)
            }
        }
    }
    //adToRepost.push(2017885578)
    console.log(`soldItems ${adToRepost.uniq()}`)
    return adToRepost.uniq()
}
