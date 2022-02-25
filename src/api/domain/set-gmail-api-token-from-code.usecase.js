import fs from 'fs'
const TOKEN_PATH = 'token.json'

export function setGmailApiTokenFromCodeUsecaseFactory(oAuth2Client) {
    return async (code) => {
        //let response
        //try {
        //    response = await oAuth2Client.getToken(decodeURIComponent(code))
        //} catch (error) {
        //    console.error(`Error retrieving token : ${error}`)
        //}
        //try {
        //    await fs.writeFileSync(TOKEN_PATH, JSON.stringify(response.tokens))
        //    console.log('Token stored to', TOKEN_PATH)
        //} catch (error) {
        //    console.error(`Error writing token : ${error}`)
        //}
        oAuth2Client.getToken(decodeURIComponent(code), async (err, token) => {
            if (err) return console.error('Error retrieving access token', err)
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                console.log(`TOKEN ${JSON.stringify(token)}`)
                if (err) return console.error(err)
                console.log('Token stored to', TOKEN_PATH)
            })
        })
    }
}
