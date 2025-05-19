import {
    bytesToHex, Cip30Wallet, WalletHelper, TxOutput,
    Assets, bytesToText, hexToBytes, AssetClass,
    Tx, Address, NetworkParams, Value, MintingPolicyHash, Program, ByteArrayData, ConstrData, NetworkEmulator
} from "./helios.js";

import { opt, j } from "./jimba.js";


// import  {mintAssetsScript} from './mintAssetsScript';
import { txPrerequisites, init, txFunc, hlib, mint, sendADA, sendAssets, adaFunc, walletEssentials } from "./coxylib.js";

const connet = async () => {
    const wallet = await init(j); j.log({wallet});
    const walletData = await walletEssentials(wallet,Cip30Wallet,WalletHelper,Value, txPrerequisites.minAda,j);j.log({walletData});
    const balancelovelace = await adaFunc(walletData,j);j.log({balancelovelace});
    const ada = (balancelovelace/1000000).toLocaleString();j.log({ada})
    document.getElementById('connect-wallet-btn').innerText = `Connected`;
    window.location.href = "product.html";
}

document.getElementById('connect-wallet-btn').addEventListener('click', async (event) => {
    event.preventDefault();
    await connet();
});