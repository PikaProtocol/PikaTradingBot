<p align="center">
  <a href="https://pikaprotocol.com">
    <img src="https://www.pikaprotocol.com/images/logo_with_name.svg" width="200px" >
  </a>
</p>

# SDK for Pika Protocol SDK

Refer to the documentation of the Pika SDK
## Installing Pika Protocol SDK

```bash
yarn add @pikaprotocol/v1-sdk
npm i @pikaprotocol/v1-sdk
```

## Using Pika Protocol SDK

...

### Simple SDK

Can be created by providing `chainId` and either `axios` or `window.fetch` (or alternative `fetch` implementation). The resulting SDK will be able to use all methods that query the API.

```js
  const PikaSDK = require("@ethandev0/v1-sdk")

  const position = await PikaSDK.getPosition(1, false);

```

### Partial SDK
For bundle-size savvy developers, you can construct a lightweight version of the SDK and bring only the functions you need.

e.g. for only getting rates and allowances:

```js
    const { 
        getPosition
    } = require("@ethandev0/v1-sdk");

    const position = await getPosition(1, false);
```

Refer to [example.js](https://github.com/PikaProtocol/PikaTradingBot/example.js) for functions usage.

## env variable

To use the SDK, it is necessary to provide `PRIVATE_KEY=<wallet_private_key>`, `TRADER_ADDRESS=<wallet_address>` and  `RPC_URL=<mainnet_rpc_url>` environment variables.