# WalletConnect Integration for Augur

This document describes the WalletConnect v2 integration added to the Augur prediction market platform.

## Overview

Augur now supports WalletConnect v2, enabling users to connect using 100+ mobile wallets via QR code scanning, in addition to the existing wallet options (MetaMask, Fortmatic, Portis, Torus).

## Features

- **WalletConnect v2**: QR code modal for mobile wallet connections
- **100+ Wallets**: Support for Trust Wallet, Rainbow, MetaMask Mobile, Coinbase Wallet, and more
- **Network Validation**: Automatic network checking and mismatch warnings
- **Session Management**: Auto-reconnect, account switching, and disconnect handling
- **Seamless Integration**: Works alongside existing Portis, Fortmatic, and Torus integrations

## Implementation

### Dependencies Added

```json
{
  "@walletconnect/ethereum-provider": "^2.21.5",
  "@walletconnect/modal": "^2.7.0"
}
```

### Files Modified/Created

1. **New Login Action**: `packages/augur-ui/src/modules/auth/actions/login-with-walletconnect.ts`
   - Implements WalletConnect provider initialization
   - Handles QR code modal display
   - Manages session events (accountsChanged, chainChanged, disconnect)

2. **Constants Updated**: `packages/augur-ui/src/modules/common/constants.ts`
   - Added `ACCOUNT_TYPES.WALLETCONNECT`
   - Added `SIGNIN_LOADING_TEXT_WALLETCONNECT`

3. **Icon Added**: `packages/augur-ui/src/modules/common/icons.tsx`
   - Added `WalletConnectLogin` SVG icon

4. **Sign modal Updated**: `packages/augur-ui/src/modules/modal/containers/modal-signin.ts`
   - Added WalletConnect option to connect methods
   - Integrated with existing sign/signup flow

## Usage

### Installation

```bash
cd packages/augur-ui
yarn install
```

### Configuration

The WalletConnect Project ID is pre-configured. To use your own:

1. Get a free Project ID from [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Update the `projectId` in `packages/augur-ui/src/modules/auth/actions/login-with-walletconnect.ts`:

```typescript
const provider = await EthereumProvider.init({
  projectId: 'YOUR_PROJECT_ID_HERE',
  chains: [Number(networkId)],
  showQrModal: true,
  // ...
});
```

### Running the App

```bash
yarn dev
```

### Connecting with WalletConnect

1. Click "Login" or "Signup" on the Augur homepage
2. Select "Login with WalletConnect" option
3. Scan the QR code with your mobile wallet app
4. Approve the connection in your mobile wallet
5. The app will automatically connect and load your account

## Technical Details

### Architecture

The integration uses:
- **@walletconnect/ethereum-provider**: EIP-1193 compliant provider
- **Ethers.js v4**: Web3Provider wrapper for Augur SDK
- **Redux + Thunk**: State management
- **React 16.9**: UI framework
- **TypeScript**: Type safety

### Event Handling

The integration listens for three key events:

1. **accountsChanged**: Detects when users switch accounts in their wallet
   - Triggers logout and re-login flow

2. **chainChanged**: Detects network changes
   - Displays network mismatch modal if incorrect network

3. **disconnect**: Detects when session is ended
   - Triggers logout flow

### Network Support

WalletConnect automatically uses the network ID from Augur's environment configuration:
- Mainnet (chainId: 1)
- Kovan (chainId: 42)
- Custom networks as configured

## Supported Wallets

Via WalletConnect, Augur now supports:
- MetaMask Mobile
- Trust Wallet
- Rainbow
- Argent
- Coinbase Wallet
- Crypto.com DeFi Wallet
- imToken
- Zerion
- And 100+ more

## Error Handling

The integration includes comprehensive error handling:
- **User Cancellation**: Modal closes without error
- **Network Mismatch**: Clear error message with expected network
- **Connection Failures**: Detailed error messages for debugging
- **Session Timeouts**: Automatic cleanup and logout

## Development

### Building

```bash
yarn build
```

### Testing

Test the integration by:
1. Connecting with a mobile wallet via QR code
2. Switching accounts in the wallet
3. Switching networks in the wallet
4. Disconnecting from the wallet
5. Performing Augur transactions (creating markets, trading, etc.)

## Resources

- [WalletConnect Documentation](https://docs.walletconnect.com/)
- [Ethereum Provider API](https://docs.walletconnect.com/advanced/providers/ethereum)
- [Augur Documentation](https://docs.augur.net/)

## License

Same as Augur (AAL)
