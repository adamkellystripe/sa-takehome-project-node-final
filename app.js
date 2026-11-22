const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

var app = express();
//const app = express();
//app.use(express.static('public'));

//Defining prices about the routes. Add Prices here
const prices = new Map([
  ["1", "{Add Price ID}"],
  ["2", "{Add Price ID}"],
  ["3", "{Add Price ID}"],
]);

//Adding Webhook Function 

async function fulfillCheckout(sessionId) {
  // Don't put any keys in code. See https://docs.stripe.com/keys-best-practices.
  // Find your keys at https://dashboard.stripe.com/apikeys.
  console.log('Fulfilling Checkout Session ' + sessionId);
  

  // TODO: Make this function safe to run multiple times,
  // even concurrently, with the same session ID

  // TODO: Make sure fulfillment hasn't already been
  // performed for this Checkout Session

  // Retrieve the Checkout Session from the API with line_items expanded
  const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items'],
  });

  // Check the Checkout Session's payment_status property
  // to determine if fulfillment should be performed
  if (checkoutSession.payment_status !== 'unpaid') {
    // TODO: Perform fulfillment of the line items

    // TODO: Record/save fulfillment status for this
    // Checkout Session
  }
}

// Use the secret provided by Stripe CLI for local testing
// or your webhook endpoint's secret.
// const endpointSecret = '{add webhook signing secret here}'; 

// Use body-parser to retrieve the raw body as a buffer
const bodyParser = require('body-parser');

app.post('/webhook', express.raw({type: 'application/json'}), async (request, response) => {
  const payload = request.body;
  const sig = request.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err) {
    console.log(err.message);
    return response.status(400).send(`Webhook Error: ${err.message}`);
  
  }

  if (
    event.type === 'checkout.session.completed'
    || event.type === 'checkout.session.async_payment_succeeded'
  ) {
    fulfillCheckout(event.data.object.id);
  }

  response.status(200).end();
});

// view engine setup (Handlebars)
app.engine('hbs', exphbs({
  defaultLayout: 'main',
  extname: '.hbs'
}));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }))
app.use(express.json({}));



/**
 * Home route
 */
app.get('/', function(req, res) {
  res.render('index');
});

/**
 * Checkout route
 */
app.get('/checkout', function(req, res) {
  // Just hardcoding amounts here to avoid using a database
  const item = req.query.item;
  let title, amount, error;

  switch (item) {
    case '1':
      title = "The Art of Doing Science and Engineering"
      amount = 2300    
    //  price =   "price_1Ud2ceRvKycpLr3m6FCHQLrX"
      break;
    case '2':
      title = "The Making of Prince of Persia: Journals 1985-1993"
      amount = 2500
    //  price = "price_1Ud7snRvKycpLr3mHKPzWmM0"
      break;     
    case '3':
      title = "Working in Public: The Making and Maintenance of Open Source"
      amount = 2800  
     // price = "price_1Ud7uFRvKycpLr3mmhiQD7Q2"
      break;     
    default:
      // Included in layout view, feel free to assign error
      error = "No item selected"      
      break;
  }

  res.render('checkout', {
    title: title,
    amount: amount,
    error: error
  });
});

// Adding endpoint that creates the checkout session here because it is after /checkout is rendered and we can build from that

app.post("/create-checkout-session", async (req, res) => {
    const price = prices.get(req.body?.item);
    if (!price) {
    return res.status(400).json({ error: "Invalid item selected" });
  }
  const session = await stripe.checkout.sessions.create({

    ui_mode: "elements",
    line_items: [
      {
        // Provide the exact Price ID (for example, price_1234) of the product you want to sell
       // price: "price_1Ud2ceRvKycpLr3m6FCHQLrX",
        price: price,
        quantity: 1,
      },
    ],
    mode: 'payment',
    return_url: `http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}`,
  });

  res.send({ clientSecret: session.client_secret });
});

app.get("/session-status", async (req, res) => {
  const session = await stripe.checkout.sessions.retrieve(req.query.session_id, {expand: ["payment_intent", "subscription"]});

   res.send({
    status: session.status,
    payment_status: session.payment_status,
    payment_intent_id: session.payment_intent?.id,
    payment_intent_status: session.payment_intent?.status,
    amount_total: session.amount_total,
    subscription_id: session.payment_intent ? null : session.subscription?.id,
    subscription_status: session.payment_intent ? null : session.subscription?.status
  });
});

/**
 * Success route
 */
app.get('/success', function(req, res) {
  res.render('success');
});

/**
 * Start server
 */
app.listen(3000, () => {
  console.log('Getting served on port 3000');
});
