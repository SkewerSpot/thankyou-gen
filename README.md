# Thank You Note Generator

SkewerSpot is a small and innovative cafe in Jalandhar, India. We create a lot of software to solve our own problems and to automate things around. This little app is one such experiment, part of our offline promotion strategy.

## Why

The idea is simple. With every online delivery order we send a "thank you" note to the customer. If they collect a certain number (say three) of thank you notes, they'd be able to redeem them to get a free meal. The hope here is to make ordering from us fun and attractive, leading to increase in revenue for us.

The question is: how do we (cafe owners) keep track of thank you notes and ensure our customers do not keep reusing them to get free goodies?

The answer is: through unique codes.

## What

> A companion app of [SS Orders](https://github.com/SkewerSpot/ss-orders-app).

Thank You Gen is a JavaScript application that generates thank you notes, each with a unique 6-digit code and a corresponding QR code. The output is two files:

1. A PDF document with front page material
2. A PDF document with back page material

Front page contains thank you message and a unique 6-digit code. The app allows one to customize, among other things, how many unique codes (front pages) should be generated.

Back page contains instructions to redeem codes.

The generation of unique codes is handled at server side (Node/Express), whereas the generation of final PDF documents is handled at client side (browser). Unique codes are stored in a persistent SQLite database.


Currently it is possible to generate a maximum of 1 million codes. So, for example, you can generate a total of ten thousand  (only!) 100-page front PDFs.

## How

Here's a general idea of the business work flow:

1. An order arrives in our online delivery platform (eg. [Zomato](https://zomato.com)).
2. The order is prepared and made ready for dispatch.
3. From one of many printed thank you notes, one is taken out.
4. The note's QR code is scanned through a mobile POS app to tag it against the order.
5. The note is packed along with food.
6. Customer receives our note, and hopefully collects 3 of them.
7. When placing their 4th order, the customer may enter their 3 collected codes as "cooking instructions" on the order cart page.
8. Codes when received by us are entered in our mobile POS for validation.
9. If everything checks out, we pack a free goodie with customer's current order.

> This app does not take care of mobile POS or code validation aspects. Check [SS Orders](https://github.com/SkewerSpot/ss-orders-app) for the POS part.

## Run

1. Clone this repository:

```
git clone https://github.com/SkewerSpot/thankyou-gen.git
```

2. Go to app folder:

```
cd thankyou-gen
```

3. Download all dependencies:

```
npm install
```

4. Rename `.env.example` as `.env`. This file contains database path environment variable.

5. Seed the unique codes database (this step is important):
```
npm run dbseed
```

6. Start the app.

```
npm start
```

7. In browser, visit http://localhost:1337.

8. (optional) Run unit tests to ensure sanity:
```
npm run test
```

## Screenshot

![Thank You Note Generator](https://user-images.githubusercontent.com/1288616/73330992-6377c300-4288-11ea-8b5c-8d6a564e5dd0.png)

## Credits

This application heavily relies on the excellent work by developers behind [jsPDF](https://github.com/MrRio/jsPDF) library.

> We are using `debug` version of jsPDF since the `minified` / `production` version results in errors as of 2019-12-30.

Kazuhiko's [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) is used for client-side QR code generation.

[ExpressJS](https://expressjs.com) is our local server that exposes API endpoints to interact with unique codes database.

## Contact

Anurag Bhandari  
✉️ [skewerspot.cafe@gmail.com](mailto:skewerspot.cafe@gmail.com)
