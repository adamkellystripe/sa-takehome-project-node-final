#  Solutions Architect - Written Project

Please find the [SA Written Project - Adam Kelly (PDF)](docs/SA-written-project-AdamKelly.pdf) PDF attached containing the full walkthrough of Adam Kelly’s Solutions Architect take-home assignment: https://github.com/adamkellystripe/sa-takehome-project-node-final

To go straight to running the application, you can follow the below steps.

## How to Build, Configure and Run

- Open your terminal locally.

- Run the following command in order to clone the repo:

  ```bash
  git clone https://github.com/adamkellystripe/sa-takehome-project-node-final.git
  cd sa-takehome-project-node-final
  npm install
  ```

- Open the Stripe Dashboard and obtain your publishable and secret key.

- In `sample.env`, add your secret key.

- In `checkout.js`, replace `{add publishable key}` with your publishable key.

- On the Stripe Dashboard navigate to Product Catalog and click create. Repeat this 3 times for each product below.

  | Name | Pricing | Amount |
  | --- | --- | --- |
  | The Art of Doing Science and Engineering | One-off | 23.00 USD |
  | The Making of Prince of Persia: Journals 1985-1993 | One-off | 25.00 USD |
  | Working in Public: The Making and Maintenance of Open Source | One-off | 28.00 USD |

- Each product will now have a price ID (`price_…`) on the Dashboard. Copy and paste this into `app.js` on line 12, in the same order as above.

- In your terminal run: `npm start`

- You can also optionally initiate a local webhook listener to observe events sent upon checkout completion by opening another terminal window and running:

  ```bash
  stripe listen --events=checkout.session.completed --forward-to localhost:3000/webhook
  ```

- Copy the webhook signing secret (`whsec_..`) provided in the output and replace `{add webhook secret here}` on line 49 of `app.js` with the secret key.

- You can then purchase a product by entering `4242 4242 4242 4242` as the card number with any future date as in the expiry field and any cvc.

Once completed and saved, the user will be able to navigate to http://localhost:3000 in their browser to view the home page.