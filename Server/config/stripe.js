import stripe from "stripe"

const Stripe = stripe(process.env.STRIPE_STRPE_KEY)

export default Stripe