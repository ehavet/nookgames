import fs from 'fs'
import {google} from 'googleapis'
import {Base64} from 'js-base64'
import cheerio from 'cheerio'

const TOKEN_PATH = 'token.json'

export function getLatestLbcSalesUsecaseFactory(auth) {
    return async () => {
        const token = await fs.readFileSync(TOKEN_PATH)
        await auth.setCredentials(JSON.parse(token))
        const gmail = google.gmail({version: 'v1', auth: auth})
        let messageIds
        let list
        try {
            list = await gmail.users.messages.list({
                userId: 'me',
                maxResults: 10,
                q: 'from:(Paiement sécurisé via leboncoin <*@messagerie.leboncoin.fr>)'
            })
        } catch (error) {
            return console.log('The API returned an error 1: ' + error)
        }

        if (list.data.resultSizeEstimate === 0) return []

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
                                const body = detailedMessage.data.payload.parts[0].parts[1].parts[0].body.data
                                const htmlBody = await Base64.decode(body)
                                console.log(htmlBody)
                                const $ = await cheerio.load(JSON.stringify(htmlBody))
                                const adLinkElement = await $("a[href^='https://www.leboncoin.fr/consoles_jeux_video/']")[0]
                                if (adLinkElement) {
                                    const adUriId = await $(adLinkElement).attr('href').split('/').pop().split('.htm').shift()
                                    return {id: id, header: {from: fromHeader.value, subject: subjectHeader.value}, ad: {uriId: adUriId}}
                                }
                            } catch (error) {
                                return console.log('The API returned an error 2: ' + error)
                            }

                        }

                    })
            )


            const cleanMessageList = messageList.filter((element) => {
                return element
            })

            console.log(`cleanMessageList => ${cleanMessageList}`)

            for (const message of cleanMessageList) {
                const subject = message.header.subject
                switch (true) {
                    case subject.includes('Nouveau message sur leboncoin'):
                    case subject.includes('Nouveau message concernant l\'annonce'):
                        //try {
                        //    await gmail.users.messages.delete({userId: 'me', id: message.id})
                        //} catch (error) {
                        //    return console.log('The API returned an error 3: ' + error)
                        //}
                        adToRepost.push(message.ad.uriId)
                        break;
                    default:
                        console.log(`rien`)
                }
            }
        }
        console.log(`LAST LBC SALES => ${adToRepost.uniq()}`)
        return adToRepost.uniq()
    }
}
