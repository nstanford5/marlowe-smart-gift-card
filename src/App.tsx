// React && helper imports
import './App.css';
import React from 'react';
import { useState, useEffect, createContext, useContext } from 'react';
import { views, constants, RUNTIME_URL } from './utils/constants.tsx';
import IntroPage from './components/IntroPage.js';
import ButtonAppBar from './components/ButtonAppBar.js';
import SmartGift from './components/SmartGift.js';
import BuyGift from './components/BuyGift.js';
import SpendGift from './components/SpendGift.js';
import {mkSmartGift, smartGiftTag} from './components/SmartGiftContract.tsx';

// marlowe TS-SDK imports
import { mkRuntimeLifecycle } from '@marlowe.io/runtime-lifecycle/browser';
import { SupportedWalletName } from '@marlowe.io/wallet/browser';
import { ApplyInputsRequest } from '@marlowe.io/runtime-lifecycle/api';
import { getInstalledWalletExtensions, mkBrowserWallet } from '@marlowe.io/wallet';
import { unAddressBech32, ContractId } from '@marlowe.io/runtime-core';
import { 
    Input, 
    IDeposit, 
    Party, 
    lovelace,
    ChoiceName,
    ChoiceId,
    IChoice,
    TimeInterval,
    Environment,
} from '@marlowe.io/language-core-v1';

const App: React.FC = () => {
    // some of these should be using Context
    const [view, setView] = useState(views.INTRO);
    const [nami, setNami] = useState(false);
    const [lace, setLace] = useState(false);
    const [eternl, setEternl] = useState(false);
    const [walletChoice, setWalletChoice] = useState('');
    const [openModal, setOpenModal] = useState(false);
    const [openSnack, setOpenSnack] = useState(false);
    const [choiceFlag, setChoiceFlag] = useState(false);
    const [buyFlag, setBuyFlag] = useState(false);
    const [ctcGift, setCtcGift] = useState<ContractId>();
    const handleSnackClose = () => { setOpenSnack(false); };
    const handleOpenModal = () => { setOpenModal(true); }
    const handleCloseModal = () => { setOpenModal(false); }
    const handleWalletChoice = (a: string) => { setWalletChoice(a); }
    let names: string[] = [];

    // converts ADA to Lovelace
    const parseADA = (num: number) => {
        const lovelace = num * 1000000;
        console.log(`The number you entered is: ${num} ADA\n` +
                            `We converted that to ${lovelace} lovelace`);
        return lovelace; 
    }; 

    // we only want this to run once
    useEffect(() => {
        const installedWalletExtensions = getInstalledWalletExtensions();
        installedWalletExtensions.forEach((i) => names.push(i.name));
        if(names.includes(constants.NAMI)){ setNami(true); }
        if(names.includes(constants.LACE)){ setLace(true); }
        if(names.includes(constants.ETERNL)){ setEternl(true); }
        console.log(`Browser Wallet Extensions: ${names}`);
    }, []);

    // this can probably move
    const buySmartGift = () => {
        setView(views.BUY_GIFT);
    };

    /**
     * 1st -- Build this for the demo
     * 
     * 1. Prepare addresses
     * 2. Connect to runtime
     * 3. Build Smart Contract
     * 4. Submit contract and wait confirmation
     * 5. Prepare and submit deposit, wait confirmation
     * 6. Choice from receiver
     * 7. Apply input choices
     */
    const handleBuyGift = async (amtRef: number, toAddrRef: string) => {
        setBuyFlag(true);

        const supportedWallet = walletChoice as SupportedWalletName;
        const browserWallet = await mkBrowserWallet(supportedWallet);
        const buyerAddr32 = await browserWallet.getChangeAddress();
        const buyerAddr = unAddressBech32(buyerAddr32);// TODO -- dep: hernan: this won't be needed soon

        const buyer: Party = {address: buyerAddr};
        const receiver: Party = {address: toAddrRef};

        console.log(`Connecting to runtime instance...`);
        const runtimeLifecycle = await mkRuntimeLifecycle({
            walletName: supportedWallet,
            runtimeURL: RUNTIME_URL,// TODO -- change this to the actual string for demo
        });

        const amtLovelace = parseADA(amtRef);

        const sGiftContract = mkSmartGift(amtLovelace, buyer, receiver);

        console.log(`Submitting contract to the blockchain...`);
        const [ctcID, txnID] = await runtimeLifecycle.contracts.createContract({
            contract: sGiftContract,
            tags: smartGiftTag,
        });
        setCtcGift(ctcID);

        const contractConfirm = await browserWallet.waitConfirmation(txnID);
        console.log(`Contract creation txn confirmed is: ${contractConfirm}\nTXID(input to Cardanoscan): ${txnID}`);

        const bintAmount = BigInt(amtLovelace);

        const deposit: IDeposit = {
            input_from_party: buyer,
            that_deposits: bintAmount,
            of_token: lovelace,
            into_account: receiver,
        };

        const depositInputs: Input[] = [deposit];
        const depositRequest: ApplyInputsRequest = {
            inputs: depositInputs
        };

        console.log(`Applying deposit txn...`);
        const depositTxnId = await runtimeLifecycle.contracts.applyInputs(ctcID, depositRequest);
        const depositConfirm = await browserWallet.waitConfirmation(depositTxnId);

        console.log(`Deposit Confirm is: ${depositConfirm}\nThe contract is waiting for a Choice from the receiver..`);

        // wait for choice at UI from receiver side
    };

    const spendSmartGift = () => {
        setView(views.SPEND_GIFT);
    };
    
    /**
     * Build this for the demo
     * 
     * 1. Wallet stuff same as before -- don't build
     * 2. Connect to runtime -- don't build
     * 3. Formulate choices
     * 4. ApplyInputs and wait confirmation
     * 5. Verify deposit to correct address
     */
    const handleChoiceSubmit = async (choiceNum: number) => {
        setChoiceFlag(true);
        // this is the same as the one we just did, but now for the receiver
        const supportedWallet = walletChoice as SupportedWalletName;
        const browserWallet = await mkBrowserWallet(supportedWallet);
        const receiverAddr32 = await browserWallet.getChangeAddress();
        const receiverAddr = unAddressBech32(receiverAddr32);
        const receiver: Party = { address: receiverAddr };

        console.log(`Connecting to runtime instance...`);
        const recRuntimeLifecycle = await mkRuntimeLifecycle({
            walletName: supportedWallet,
            runtimeURL: RUNTIME_URL,
        });
        // start here
        
        // we'll hardcode and force a certain choice here, but in future videos
        // I'll show you how to get this information from the blockchain for any
        // contract relevant to your address or with your specified tags or filters
        const choiceName: ChoiceName = "purchase";

        // we'll formulate our choices similar to how we do deposits
        // leaning on the TS-SDK to tell us the info it needs and what format
        const choices: ChoiceId = {
            choice_name: choiceName,
            choice_owner: receiver,
        };

        const purchaseChoice: IChoice = {
            for_choice_id: choices,
            input_that_chooses_num: BigInt(choiceNum),
        };
        
        // this part is exactly the same as a Deposit
        // we are just formulating an ApplyInputsRequest with
        // different information for the Input
        const choiceInputs: Input[] = [purchaseChoice];
        const choiceRequest: ApplyInputsRequest = {
            inputs: choiceInputs,
        };

        console.log(`Applying input choice...`);
        // we are grabbing the contract ID from state here, but in future videos -- we'll show you
        // how to retrieve this from the blockchain instead
        const choiceTxn = await recRuntimeLifecycle.contracts.applyInputs(ctcGift as ContractId, choiceRequest);
        console.log(`Choice TXN Receipt: ${choiceTxn}`);
        const choiceConfirm = await browserWallet.waitConfirmation(choiceTxn);

        console.log(`Choice confirm is: ${choiceConfirm}`);
        // end, check wallet for purchase
    };

    const handleSpend = () => { handleChoiceSubmit(1); };
    const handleDonate = () => { handleChoiceSubmit(0); };

    return(
        <div className='App'>
            <ButtonAppBar
                walletChoice={walletChoice} 
                handleWalletChoice={handleWalletChoice}
                openModal={openModal}
                handleOpenModal={handleOpenModal}
                handleCloseModal={handleCloseModal}
                openSnack={openSnack}
                handleSnackClose={handleSnackClose}
                setView={setView}
                setOpenSnack={setOpenSnack}
                nami={nami}
                lace={lace}
                eternl={eternl}
            />
            {view === views.INTRO && <IntroPage />}
            {view === views.SMART_GIFT && <SmartGift 
                buySmartGift={buySmartGift}
                spendSmartGift={spendSmartGift}   
            />}
            {view === views.BUY_GIFT && <BuyGift 
                handleBuyGift={handleBuyGift}
                buyFlag={buyFlag}    
            />}
            {view === views.SPEND_GIFT && <SpendGift 
                handleSpend={handleSpend}
                handleDonate={handleDonate}
                choiceFlag={choiceFlag}
            />}
        </div>
    );
};

export default App;
