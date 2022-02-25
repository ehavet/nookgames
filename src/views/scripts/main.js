import {CookieRepository} from './cookieRepository'

const CART_COOKIE_ID = 'nkgc4rt'
const USER_COOKIE_ID = 'nkgu53r'

const cartridges = document.getElementsByClassName('cartridge')
const cartItemRemoveBtnList = document.getElementsByClassName('cart__cart-item__infos__remove__btn')
const dynamicCartValues = document.getElementsByClassName('dynamic_cart_value')
const cookieRepository = new CookieRepository()

for (const element of dynamicCartValues) {
    element.addEventListener('change', function () {
        updateOrderTotal()
    })
}

function updateOrderTotal() {
    const orderTotal = document.getElementsByClassName('dynamic_order_total')[0]
    const subTotalValue = getSubTotalValue()
    const discountValue = getDiscountValue()
    const total = subTotalValue - discountValue
    orderTotal.setAttribute('data-order-total', total)
    orderTotal.textContent = `${truncateNumber(total, 2)} €`
}

function init() {
    cookieRepository.create(CART_COOKIE_ID)
    cookieRepository.create(USER_COOKIE_ID)
    updateCartBadge()
    updateSubTotal()
}

function getDiscountValue() {
    const discountValues = document.getElementsByClassName('dynamic_discount_value')[0]
    return parseFloat(discountValues.getAttribute('data-discount-value'))
}

function getSubTotalValue() {
    const itemPrices = document.getElementsByClassName('cart__cart-item__price__value')
    const prices = Array.from(itemPrices).map(element => element.getAttribute('data-item-price'))
    return prices.reduce(function (acc, val) {
        return acc + parseFloat(val)
    }, 0)
}

function updateCartBadge() {
    const cookie = cookieRepository.get(CART_COOKIE_ID)
    const uniqCartItemArray = [...new Set(cookie.cart)]
    if (uniqCartItemArray.length >= 1) {
        const shoppingCartLink = document.getElementsByClassName('header__shopping-cart-link')[0]
        shoppingCartLink.innerHTML += `<div class="header__shopping-cart-badge">${uniqCartItemArray.length}</div>`
    } else {
        const shoppingCartBadge = document.getElementsByClassName('header__shopping-cart-badge')[0]
        if (shoppingCartBadge) shoppingCartBadge.remove()
    }
}

function updateSubTotal() {
    const subTotalValue = getSubTotalValue()
    for (const element of dynamicCartValues) {
        element.setAttribute('data-subtotal-value', subTotalValue)
        element.textContent = `${truncateNumber(subTotalValue, 2)} €`
    }
    updateOrderTotal()
}

for (const el of cartridges) {
    el.addEventListener('click', function () {
        console.log('dsfdsfjdsmsdf')
        if (!this.classList.contains('clickable')) return
        this.classList.remove('clickable')
        const gameId = this.getAttribute('data-game-id')
        const cookie = cookieRepository.get(CART_COOKIE_ID)
        if (cookie.cart) {
            cookie.cart.push(gameId)
            cookieRepository.update(CART_COOKIE_ID, cookie)
        } else {
            cookieRepository.update(CART_COOKIE_ID, {cart: [gameId]})
        }
    })
}

for (const btn of cartItemRemoveBtnList) {
    btn.addEventListener('click', function () {
        console.log('ici')
        const itemId = this.getAttribute('data-item-id')
        console.log(`item id => ${itemId}`)
        const cookie = cookieRepository.get(CART_COOKIE_ID)
        console.log(`cookie retrieved => ${cookie.cart}`)
        const cartItems = cookie.cart.filter(item => item !== itemId)
        console.log(`cart after remove => ${cartItems}`)
        cookieRepository.update(CART_COOKIE_ID, {cart: cartItems})
        document.getElementById(itemId).remove()
        document.location.reload()
    })
}

function truncateNumber(number, fixed) {
    const re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
    return number.toString().match(re)[0];
}

init()
