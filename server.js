require('dotenv').config()

const express = require('express')
const app = express();
const cors = require('cors')

app.use(express.json())
app.use(cors({
  origin: 'http://localhost:3000'
}))

const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY)

const storeItems = [
  { id: 1, priceInCents: 10000, name: 'Learn React Today'},
  { id: 2, priceInCents: 20000, name: 'Learn CSS Today'}
]


app.get('/storeitems', async (req, res) => {
  try {
    res.send(Array.from(storeItems.values()))
  } catch (error) {
    res.status(500).json({ error: e.message })
  }
})

app.post('/create-checkout-session', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: req.body.items.map(item => {
        const storeItem = storeItems.find(storeItem => storeItem.id === item.id)
        return {
          price_data: {
            currency: 'usd',
            product_data: {
              name: storeItem.name
            },
            unit_amount: storeItem.priceInCents
          },
          quantity: item.quantity
        }
      }),
      success_url: `${process.env.CLIENT_URL}`,
      cancel_url: `${process.env.CLIENT_URL}`
    })
    res.json({ url: session.url })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.listen(5000, () => console.log('Listening on Port 5000'))