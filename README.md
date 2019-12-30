# Thank You Note Generator

What's up with the weird name? Don't care too much about the name.

SkewerSpot is a small and innovative cafe in Jalandhar, India. We create a lot of software to solve our own problems and to automate things around. This little app is one such experiment, part of our offline promotion strategy.

## Why

The idea is simple. With every online delivery order we send a "thank you" note to the customer. If they collect a certain number (say three) of thank you notes, they'd be able to redeem them to get a free meal. The hope here is to make ordering from us fun and attractive, leading to increase in revenue for us.

The question is: how do we (cafe owners) keep track of thank you notes and ensure our customers do not keep reusing them to get free goodies?

The answer is: through unique codes.

## What

Thank You Gen is a browser-based JavaScript application that generates thank you notes, each with a unique 6-digit code and a corresponding QR code. The output is two files:

1. A PDF document with front page material
2. A PDF document with back page material

Front page contains thank you message and a unique 6-digit code. The app allows one to customize, among other things, how many unique codes (front pages) should be generated.

Back page contains instructions to redeem codes.

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

> This app does not make care of mobile POS or code validation aspects.

## Run

1. Clone this repository:

```
git clone https://github.com/SkewerSpot/thankyou-gen.git
```

2. Go to app folder:

```
cd thankyou-gen
```

3. Download all dependencies (really just one, `static-server`):

```
npm install
```

4. Start the app.

```
npm start
```

5. In browser, visit http://localhost:1337.

## Screenshot

![Thank You Note Generator](https://user-images.githubusercontent.com/1288616/71568376-b9701400-2aec-11ea-876c-7e7cb91e5c8d.png)

## Credits

This application heavily relies on the excellent work by developers behind [jsPDF](https://github.com/MrRio/jsPDF) library.

Kazuhiko's [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) is used for client-side qr code generation.

[static-server](https://github.com/nbluis/static-server) npm package to serve this web app in a local server.

> We are using `debug` version of jsPDF since the `minified` / `production` version results in errors as of 2019-12-30.

## Contact

Anurag Bhandari  
✉️ [skewerspot.cafe@gmail.com](mailto:skewerspot.cafe@gmail.com)
