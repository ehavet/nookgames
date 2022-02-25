const SCOPES = [
    // accès à l'ensemble des actions disponibles pour la boite e-mail
    'https://mail.google.com/'
]

export function getGmailApiAuthenticationUrlUsecaseFactory(oAuth2Client) {
    return async () => {
        return oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES
        })
    }
}
