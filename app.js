const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

var app = express();
//const app = express();
//app.use(express.static('public'));

//Defining prices about the routes
const prices = new Map([
  ["1", "price_1Ud2ceRvKycpLr3m6FCHQLrX"],
  ["2", "price_1Ud7snRvKycpLr3mHKPzWmM0"],
  ["3", "price_1Ud7uFRvKycpLr3mmhiQD7Q2"],
]);

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
