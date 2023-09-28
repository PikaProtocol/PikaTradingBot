<p align="center">
  <a href="https://pikaprotocol.com">
    <img src="https://www.pikaprotocol.com/images/logo_with_name.svg" width="200px" >
  </a>
</p>

# SDK for Pika Protocol

## Installing Pika Protocol SDK

```bash
yarn add @pikaprotocol/sdk
npm i @pikaprotocol/sdk
```

## Using Pika Protocol SDK


### Simple SDK

Refer to [example.js](https://github.com/PikaProtocol/PikaTradingBot/blob/master/example.js) for more examples.

```js
const PikaSDK = require("@pikaprotocol/sdk")

const position = await PikaSDK.getPosition(1, false);

```

### Partial SDK
For bundle-size savvy developers, you can construct a lightweight version of the SDK and bring only the functions you need.

e.g. for only getting position:

```js
const { 
    getPosition
} = require("@pikaprotocol/sdk");

const position = await getPosition(1, false);
```

## env variable

To use the SDK, it is necessary to provide `PRIVATE_KEY=<wallet_private_key>`, `TRADER_ADDRESS=<wallet_address>` and  `RPC_URL=<mainnet_rpc_url>` environment variables.
