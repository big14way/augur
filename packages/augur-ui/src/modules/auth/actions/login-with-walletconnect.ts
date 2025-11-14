import { EthereumProvider } from '@walletconnect/ethereum-provider';
import { updateSdk } from 'modules/auth/actions/update-sdk';
import { toChecksumAddress } from 'ethereumjs-util';
import { ThunkDispatch } from 'redux-thunk';
import { Action } from 'redux';
import { Web3Provider } from 'ethers/providers';
import {
  ACCOUNT_TYPES,
  MODAL_NETWORK_MISMATCH,
  NETWORK_NAMES,
} from 'modules/common/constants';
import { IS_LOGGED, updateAuthStatus } from 'modules/auth/actions/auth-status';
import { augurSdk } from 'services/augursdk';
import { updateModal } from 'modules/modal/actions/update-modal';
import { closeModal } from 'modules/modal/actions/close-modal';
import { logout } from 'modules/auth/actions/logout';
import { AppState } from 'appStore';

let walletConnectProvider: any = null;

export const loginWithWalletConnect = () => async (
  dispatch: ThunkDispatch<void, any, Action>,
  getState: () => AppState
) => {
  const failure = error => {
    dispatch(closeModal());
    throw error;
  };

  const success = async (account: string, provider: any) => {
    if (!account) return failure('No Account');

    dispatch(login(account, provider));

    // Listen for account changes
    provider.on('accountsChanged', async accounts => {
      const loginAccount = getState().loginAccount;
      if (loginAccount.address && accounts.length > 0) {
        console.log('WalletConnect account changed to', accounts[0]);
        await dispatch(logout());
        dispatch(loginWithWalletConnect());
      } else if (accounts.length === 0) {
        // Disconnected
        await dispatch(logout());
      }
    });

    // Listen for chain changes
    provider.on('chainChanged', chainId => {
      if (augurSdk.networkId !== chainId.toString()) {
        console.log('WalletConnect network changed to', chainId);
        dispatch(
          updateModal({
            type: MODAL_NETWORK_MISMATCH,
            expectedNetwork: NETWORK_NAMES[Number(augurSdk.networkId)],
          })
        );
      }
    });

    // Listen for disconnection
    provider.on('disconnect', async () => {
      console.log('WalletConnect disconnected');
      await dispatch(logout());
    });
  };

  try {
    const networkId = getState().env['networkId'];

    // Initialize WalletConnect provider
    const provider = await EthereumProvider.init({
      projectId: '1eebe528ca0ce94a99ceaa2e915058d7', // WalletConnect Project ID
      chains: [Number(networkId)],
      showQrModal: true,
      metadata: {
        name: 'Augur',
        description: 'Augur - Decentralized Prediction Markets',
        url: typeof window !== 'undefined' ? window.location.origin : 'https://augur.net',
        icons: [`${typeof window !== 'undefined' ? window.location.origin : 'https://augur.net'}/favicon.ico`],
      },
    });

    // Enable session (shows QR Code modal)
    await provider.enable();

    // Store provider reference
    walletConnectProvider = provider;

    // Get account
    const accounts = await provider.request({ method: 'eth_accounts' });
    await success(accounts[0], provider);
  } catch (err) {
    console.error('WalletConnect Error:', err);
    return failure(err);
  }
};

const login = (account: string, provider: any) => (
  dispatch: ThunkDispatch<void, any, Action>,
  getState: () => AppState
) => {
  const web3Provider = new Web3Provider(provider);
  const networkId = getState().env['networkId'];
  const address = toChecksumAddress(account);
  const accountObject = {
    address,
    mixedCaseAddress: address,
    meta: {
      address,
      provider: web3Provider,
      signer: web3Provider.getSigner(),
      email: null,
      profileImage: null,
      openWallet: null,
      accountType: ACCOUNT_TYPES.WALLETCONNECT,
      isWeb3: true,
    },
  };
  dispatch(updateSdk(accountObject, networkId));
};

export const disconnectWalletConnect = () => async (
  dispatch: ThunkDispatch<void, any, Action>
) => {
  if (walletConnectProvider && walletConnectProvider.disconnect) {
    await walletConnectProvider.disconnect();
    walletConnectProvider = null;
  }
};
