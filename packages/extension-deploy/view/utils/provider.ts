/**
 * @deprecated
 */

// import { ethers } from 'ethers';
// import { sendMessage } from '@carpo-remix/common/webview/sendMessage';

// export type AccountType = {
//   address: string;
//   balance: string;
// };

// export type NetworkType = 'local' | 'wallet';

// export type ProviderType = ethers.providers.JsonRpcProvider | ethers.providers.Web3Provider;

// async function connectToProvider(
//   type: NetworkType,
//   url?: string
// ): Promise<{
//   provider: ProviderType;
//   accounts: AccountType[];
// }> {
//   if (type === 'wallet') {
//     if (!(window as any).ethereum) {
//       sendMessage('workspace.toast', `Please ensure that your browser has the metamask browser plug-in installed`);
//     }
//     const provider = new ethers.providers.Web3Provider((window as any).ethereum);
//     provider.send('eth_requestAccounts', []).then(() => {
//       const signer = provider.getSigner();
//       signer.getAddress().then(async (addr) => {
//         return {
//           provider,
//           accounts: [{ address: addr, balance: ethers.utils.formatEther(await signer.getBalance()) }]
//         };
//       });
//     });
//   }
//   const provider = new ethers.providers.JsonRpcProvider(url);
//   await provider.ready;
//   const list = await provider.listAccounts();
//   return Promise.all(
//     list.map(async (account) => {
//       const unFormatBalance = await provider.getBalance(account);
//       return { address: account, balance: ethers.utils.formatEther(unFormatBalance ?? 0) };
//     })
//   ).then((res) => ({ provider, accounts: res }));
// }

// export default connectToProvider;
