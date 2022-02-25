export default function (router, container) {
    router.get('/dashboard/collects', async (req, res) => {
        let items
        try {
            items = await container.GetAllItems()
        } catch (error) {
            console.log(error)
        }
        let orders
        try {
            orders = await container.GetOrders()
            console.log(JSON.stringify(orders))
        } catch (error) {
            console.log(error)
        }
        let promos
        try {
            promos = await container.GetPromoCodes()
            console.log(JSON.stringify(promos))
        } catch (error) {
            console.log(error)
        }
        res.render('./dashboard/collects', { items: items, orders: orders.filter(order => order.delivery.type === 'collect'), promo_codes: promos })
    })

    router.post('/dashboard/collects', async (req, res) => {
        const body = req.body
        const promo_codes = (Array.isArray(body.promo_codes) && body.promo_codes.every(code => code.length >= 6)) ? body.promo_codes : null
        try {
            await container.RegisterCollectedOrder(body.sales_channel, body.cart, promo_codes)
        } catch (error) {
            console.log(error)
        }
        res.redirect('/dashboard/collects')
    })

    router.get('/dashboard/items', async (req, res) => {
        let items
        try {
            items = await container.GetAllItems()
        } catch (error) {
            console.log(error)
        }
        res.render('./dashboard/items', {items: items})
    })

    router.get('/dashboard/lots', async (req, res) => {
        let lots
        try {
            lots = await container.GetLots()
        } catch (error) {
            console.log(error)
        }
        let items
        try {
            items = await container.GetAllItems()
        } catch (error) {
            console.log(error)
        }
        res.render('./dashboard/lots', {lots: lots, items: items})
    })

    router.post('/dashboard/lots', async (req, res) => {
        const body = req.body
        try {
            await container.AddItemLot(
                body.item_id,
                body.unit_price,
                body.quantity
            )
        } catch (error) {
            console.log(error)
        }
        res.redirect('/dashboard/lots')
    })

    router.get('/dashboard', async (req, res) => {
        let items
        try {
            items = await container.GetAllItems()
        } catch (error) {
            console.log(error)
        }
        let orders
        try {
            orders = await container.GetOrders()
        } catch (error) {
            console.log(error)
        }
        let sales
        try {
            sales = await container.GetSales()
        } catch (error) {
            console.log(error)
        }
        res.render('./dashboard/index', {items: items, orders: orders, sales: sales})
    })

    router.get('/index', function (req, res) {
        res.render('index', {title: 'Hey', message: 'Hello there!'});
    });

    router.get('/cart', async function (req, res) {
        let cartItems = []
        if (req.headers.cookie) {
            const cookies = req.headers.cookie
                .split('; ')
                .map(rawCookie => JSON.parse(rawCookie.split('=')[1]))
            const cartCookie = cookies.find(cookie => cookie.cart)
            if (cartCookie) {
                try {
                    cartItems = await container.GetCartItems(cartCookie.cart)
                } catch (error) {
                    console.log(error)
                }
            }
        }
        res.render('cart', {cartItems: cartItems});
    });

    router.get('/address', async function (req, res) {
        let cartItems = []
        if (req.headers.cookie) {
            const cookies = req.headers.cookie
                .split('; ')
                .map(rawCookie => JSON.parse(rawCookie.split('=')[1]))
            const cartCookie = cookies.find(cookie => cookie.cart)
            if (cartCookie) cartItems = await container.GetCartItems(cartCookie.cart)
        }
        res.render('address', {cartItems: cartItems});
    });

    router.post('/address', async function (req, res) {
        let cartItems = []
        if (req.headers.cookie) {
            const cookies = req.headers.cookie
                .split('; ')
                .map(rawCookie => JSON.parse(rawCookie.split('=')[1]))
            const cartCookie = cookies.find(cookie => cookie.cart)
            if (cartCookie) cartItems = await container.GetCartItems(cartCookie.cart)
        }
        const client = {
            name: req.body.name,
            address: req.body.address,
            city: req.body.city,
            postalCode: req.body.postal_code,
            email: req.body.email,
            phoneNumber: req.body.phone_number
        }

        res.redirect('payment')
    });

    router.get('/payment', async function (req, res) {
        let cartItems = []
        if (req.headers.cookie) {
            const cookies = req.headers.cookie
                .split('; ')
                .map(rawCookie => JSON.parse(rawCookie.split('=')[1]))
            const cartCookie = cookies.find(cookie => cookie.cart)
            if (cartCookie) {
                try {
                    cartItems = await container.GetCartItems(cartCookie.cart)
                } catch (error) {
                    console.log(error)
                }
            }
        }
        const client = {
            name: req.params.name,
            address: req.params.address,
            city: req.params.city,
            postalCode: req.params.postal_code,
            email: req.params.email,
            phoneNumber: req.params.phone_number
        }
        res.render('payment', {client: client, cartItems: cartItems});
    });
    return router
}