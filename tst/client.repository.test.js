import {expect, database, dateFaker} from './toolbox'
import { ClientRepository } from '../src/ihm/infrastructure/client.repository'

describe('ClientRepository', function () {
    let repository
    const clientId = 'ab75a407-e1c9-4e85-b4ec-49ab48e5d11e'
    const currentDatetime = new Date('2021-06-23 18:30:17.000000')

    before(async () => {
        repository = new ClientRepository(database)
    })

    beforeEach(async () => {
        dateFaker.setCurrentDate(currentDatetime)
    })

    afterEach(async () => {
        await database.result(
            'DELETE FROM address WHERE address.client_id = $1', clientId, a => a.rowCount
        )
        await database.result(
            'DELETE FROM client WHERE id = $1', clientId, a => a.rowCount
        )
    })

    describe('#create', function () {
        it('doit enregistrer un client en base de donnée et retourner l\'objet crée', async function () {
            const expectedClient = {
                id: clientId,
                name: 'Jean Paul Dubois',
                email: 'jpd@gmail.com',
                phoneNumber: '0676548367',
                acquisitionChannel: 'home',
                address: {
                    street: '66 rue du paradis',
                    city: 'paris',
                    postalCode: '75010'
                }
            }

            const retournedClient = await repository.create(expectedClient)

            const result = await database.result(
                'SELECT client.id, client.name, client.email, client.phone_number, client.acquisition_channel, client.created_at, client.updated_at, address.street, address.city, address.postal_code FROM client, address WHERE client.id = $1 AND address.client_id = $1',
                clientId
            )
            expect(result.rows[0].id).to.equal(clientId)
            expect(result.rows[0].name).to.equal('Jean Paul Dubois')
            expect(result.rows[0].email).to.equal('jpd@gmail.com')
            expect(result.rows[0].phone_number).to.equal('0676548367')
            expect(result.rows[0].acquisition_channel).to.equal('home')
            expect(result.rows[0].street).to.equal('66 rue du paradis')
            expect(result.rows[0].city).to.equal('paris')
            expect(result.rows[0].postal_code).to.equal('75010')
            expect(result.rows[0].created_at).to.deep.equal(currentDatetime)
            expect(result.rows[0].updated_at).to.deep.equal(currentDatetime)
            expect(retournedClient).to.deep.equal(expectedClient)
        })

    })

    describe('#get', function () {
        it('doit retourner un client par son identifiant', async function () {
            // GIVEN
            const client = {
                id: clientId,
                name: 'Jean Raoul Ducon',
                email: 'jeanjean@gmail.com',
                phoneNumber: '0676548367',
                acquisitionChannel: 'home',
                address: {
                    street: '14 rue du fion',
                    city: 'paname',
                    postalCode: '75021'
                }
            }
            await repository.create(client)
            // WHEN
            const result = await repository.get(clientId)
            // THEN
            expect(result).to.deep.equal(client)
        })
    })

    describe('#update', function () {
        it('doit mettre à jour un client avec son adresse', async function () {
            // GIVEN
            const expectedClient = {
                id: clientId,
                name: 'Max Boulon',
                email: 'bouboul@gmail.com',
                phoneNumber: '0676548367',
                acquisitionChannel: 'home',
                address: {
                    street: '18 rue du boule',
                    city: 'paname',
                    postalCode: '75021'
                }
            }
            await repository.create({
                id: clientId,
                name: 'Jean Raoul Ducon',
                email: 'jeanjean@gmail.com',
                phoneNumber: '0676548367',
                acquisitionChannel: 'home',
                address: {
                    street: '14 rue du fion',
                    city: 'paname',
                    postalCode: '75021'
                }
            })
            // WHEN
            await repository.update(expectedClient)
            // THEN
            const result = await repository.get(clientId)
            expect(result).to.deep.equal(expectedClient)
        })
    })

    describe('#delete', function () {
        it('doit supprimer un client de la base de donnée', async function () {
            // GIVEN
            await repository.create({
                id: clientId,
                name: 'Jean Raoul Ducon',
                email: 'jeanjean@gmail.com',
                phoneNumber: '0676548367',
                acquisitionChannel: 'home',
                address: {
                    street: '14 rue du fion',
                    city: 'paname',
                    postalCode: '75021'
                }
            })
            // WHEN
            await repository.delete(clientId)
            // THEN
            const addressResult = await database.result(
                'SELECT client.id, client.name, client.email, client.phone_number, client.acquisition_channel, client.created_at, client.updated_at, address.street, address.city, address.postal_code FROM client,address WHERE client.id = $1 AND address.client_id = $1',
                clientId
            )
            const clientResult = await database.result(
                'SELECT client.id, client.name, client.email, client.phone_number, client.acquisition_channel, client.created_at, client.updated_at, address.street, address.city, address.postal_code FROM client,address WHERE client.id = $1 AND address.client_id = $1',
                clientId
            )
            expect(addressResult.rowCount).to.equal(0)
            expect(clientResult.rowCount).to.equal(0)
        })
    })
})