import { getCandiesUsecaseFactory } from './api/domain/get-candies.usecase.js'
import { getCandyUsecaseFactory } from './api/domain/get-candy.usecase.js'
import { createCandyUsecaseFactory } from './api/domain/create-candy.usecase.js'
import { CandyRepository } from './api/infrastructure/candy.repository.js'
import { ItemRepository } from "./ihm/infrastructure/item.repository.js"
import { PriceDatasource } from './ihm/infrastructure/price.datasource.js'
import { getCartItemsUsecaseFactory } from "./ihm/domain/get-cart-items.usecase.js"
import db from './pg-promise.js'
export const database = db()
import { google } from 'googleapis'
import fs from 'fs'
import { getGmailApiAuthenticationUrlUsecaseFactory } from './api/domain/get-gmail-api-auth-url.usecase.js'
import { setGmailApiTokenFromCodeUsecaseFactory } from './api/domain/set-gmail-api-token-from-code.usecase.js'
import {getLatestLbcSalesUsecaseFactory} from "./api/domain/get-latest-lbc-sales.usecase"
import {getAllItemsUsecaseFactory} from './ihm/domain/get-all-items.usecase.js'
import {OrderRepository} from "./ihm/infrastructure/order.repository.js"
import {getOrdersUsecaseFactory} from "./ihm/domain/get-orders.usecase.js"
import {getSalesUsecaseFactory} from './ihm/domain/get-sales.usecase.js'
import {WithdrawalRepository} from "./ihm/infrastructure/withdrawal.repository"
import {LotRepository} from "./ihm/infrastructure/lot.repository"
import {PromoRepository} from "./ihm/infrastructure/promo.repository.js"
import {registerCollectedOrderUsecaseFactory} from './ihm/domain/register-collected-order.usecase.js'
import {getLotsUsecaseFactory} from "./ihm/domain/get-lots.usecase"
import {addItemLotUsecaseFactory} from "./ihm/domain/add-item-lot.usecase"
import {createOrderUsecaseFactory} from "./ihm/domain/create-order.usecase"
import {createClientUsecaseFactory} from "./ihm/domain/create-client.usecase"
import {ClientRepository} from "./ihm/infrastructure/client.repository"
import {OrderPromoDatasource} from "./ihm/infrastructure/order-promo.datasource";
import {getAllPromoCodesUsecaseFactory} from "./ihm/domain/get-all-promo-codes.usecase";

let credentialsContent
try {
    credentialsContent = await fs.readFileSync('credentials.json')
} catch (error) {
    console.log(`Error loading client secret file: ${error}`)
}
const credentials = JSON.parse(credentialsContent)
console.log(credentials)
const {client_secret, client_id, redirect_uris} = credentials.web
const oAuth2Client = await new google.auth.OAuth2(client_id, client_secret, redirect_uris[1])
const candyRepository = new CandyRepository()
const itemRepository = new ItemRepository(database)
const orderRepository = new OrderRepository(database)
const withdrawalRepository = new WithdrawalRepository(database)
const lotRepository = new LotRepository(database)
const clientRepository = new ClientRepository(database)
const promoRepository = new PromoRepository(database)
const priceDatasource = new PriceDatasource(database)
const orderPromoDatasource = new OrderPromoDatasource(database)
const getCandies = getCandiesUsecaseFactory(candyRepository)
const getCandy = getCandyUsecaseFactory(candyRepository)
const createCandy = createCandyUsecaseFactory(candyRepository)
const getCartItems = getCartItemsUsecaseFactory(itemRepository)
const getAllItems = getAllItemsUsecaseFactory(itemRepository)
const getOrders = getOrdersUsecaseFactory(orderRepository)
const getSales = getSalesUsecaseFactory(withdrawalRepository, lotRepository, promoRepository, priceDatasource, orderPromoDatasource)
const getGmailApiAuthenticationUrl = getGmailApiAuthenticationUrlUsecaseFactory(oAuth2Client)
const setGmailApiTokenFromCode = setGmailApiTokenFromCodeUsecaseFactory(oAuth2Client)
const getLatestLbcSales = getLatestLbcSalesUsecaseFactory(oAuth2Client)
const registerCollectedOrder = registerCollectedOrderUsecaseFactory(orderRepository, withdrawalRepository, lotRepository)
const getLots = getLotsUsecaseFactory(lotRepository)
const addItemLot = addItemLotUsecaseFactory(lotRepository)
const createOrder = createOrderUsecaseFactory(orderRepository)
const createClient = createClientUsecaseFactory(clientRepository)
const getAllPromoCodes = getAllPromoCodesUsecaseFactory(promoRepository)

export default {
    GetCandy: getCandy,
    CreateCandy: createCandy,
    GetCandies: getCandies,
    GetCartItems: getCartItems,
    GetAllItems: getAllItems,
    GetOrders: getOrders,
    GetSales: getSales,
    RegisterCollectedOrder: registerCollectedOrder,
    GetGmailApiAuthUrl: getGmailApiAuthenticationUrl,
    SetGmailApiTokenFromCode: setGmailApiTokenFromCode,
    GetLatestLbcSales: getLatestLbcSales,
    GetLots: getLots,
    AddItemLot: addItemLot,
    CreateOrder: createOrder,
    CreateClient: createClient,
    GetPromoCodes: getAllPromoCodes
}