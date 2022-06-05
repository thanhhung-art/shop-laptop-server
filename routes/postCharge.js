const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const router = require('express').Router()

router.post("/charge", async (req, res) => {
  try {
    const { amount, source, receipt_email } = req.body

    const charge = await stripe.charges.create({
      amount,
      currency: 'usd',
      source,
      receipt_email
    })

    if (!charge) throw new Error('charge unsuccessful')

    res.status(200).json({
      charge,
      message: 'charge posted successfully'
    })
  } catch (error) {
    res.status(500).json({
      message: error.message
    })
  }
})

// async function postCharge(req, res) {
//   try {
//     const { amount, source, receipt_email } = req.body

//     const charge = await stripe.charges.create({
//       amount,
//       currency: 'usd',
//       source,
//       receipt_email
//     })

//     if (!charge) throw new Error('charge unsuccessful')

//     res.status(200).json({
//       charge,
//       message: 'charge posted successfully'
//     })
//   } catch (error) {
//     res.status(500).json({
//       message: error.message
//     })
//   }
// }

module.exports = router;