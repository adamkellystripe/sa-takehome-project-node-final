const stripe = Stripe("{add publishable key}"); // Add your publishable key here


let checkout;
let actions;
initialize();

document
  .querySelector("#payment-form")
  .addEventListener("submit", handleSubmit);

// Fetches a Checkout Session and captures the client secret
async function initialize() {
     const item = new URLSearchParams(window.location.search).get("item");

  const promise = fetch("/create-checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ item }),

  })
    .then((r) => r.json())
    .then((r) => r.clientSecret);

  const appearance = {
    theme: 'stripe',
  };

  checkout = stripe.initCheckoutElementsSdk({
    clientSecret: promise,
    elementsOptions: { appearance },
     adaptivePricing: { allowed: true },
  });

  checkout.on('change', (session) => {
    // Handle changes to the checkout session
    document.getElementById('submit').disabled = !session.canConfirm;
    //Adaptive Pricing
    document.querySelector("#button-text").textContent = `Pay ${
      session.total.total.amount
    } now`;
  });

  const loadActionsResult = await checkout.loadActions();
  if (loadActionsResult.type === 'success') {
    actions = loadActionsResult.actions;
    const session = loadActionsResult.actions.getSession();
    //actions.updateEmail('jenny.rosen@example.com');
   document.querySelector("#button-text").textContent = `Pay ${
      session.total.total.amount
    } now`;
  }

  const contactDetailsElement = checkout.createContactDetailsElement();
  contactDetailsElement.mount("#contact-details-element");

  const paymentElement = checkout.createPaymentElement();
  paymentElement.mount("#payment-element");
  //Adaptive Pricing
  const currencySelectorElement = checkout.createCurrencySelectorElement();
  currencySelectorElement.mount("#currency-selector-element");
}

async function handleSubmit(e) {
  e.preventDefault();
  setLoading(true);

  const confirmResult = await actions.confirm();

  // This point will only be reached if there is an immediate error when
  // confirming the payment. Otherwise, your customer will be redirected to
  // your `return_url`. For some payment methods like iDEAL, your customer will
  // be redirected to an intermediate site first to authorize the payment, then
  // redirected to the `return_url`.
  if (confirmResult.type === 'error') {
    showMessage(confirmResult.error.message);
  }

  setLoading(false);
}

// ------- UI helpers -------

function showMessage(messageText) {
  const messageContainer = document.querySelector("#payment-message");

  messageContainer.classList.remove("hidden");
  messageContainer.textContent = messageText;
}

// Show a spinner on payment submission
function setLoading(isLoading) {
  if (isLoading) {
    // Disable the button and show a spinner
    document.querySelector("#submit").disabled = true;
    //document.querySelector("#spinner").classList.remove("hidden");
    document.querySelector("#button-text").classList.add("hidden");
  } else {
    document.querySelector("#submit").disabled = false;
   // document.querySelector("#spinner").classList.add("hidden");
    document.querySelector("#button-text").classList.remove("hidden");
  }
}