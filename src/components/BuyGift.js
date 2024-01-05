import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import './index.css';
import { useRef } from 'react';

export default function SmartGift({handleBuyGift, buyFlag}){
    const amountRef = useRef();
    const toAddrRef = useRef();
    // TODO -- add error handling to text fields  
    const sendValue = () => {
        handleBuyGift(Number(amountRef.current.value), toAddrRef.current.value);
    }
    
    return(
        <div className="center">
            Please enter an amount and an address to send the Smart Gift Card to.
            <p/>
            <TextField 
                id="amount"
                label="deposit amount in ADA"
                inputRef={amountRef}
            />
            <p/>
            <TextField 
                id="to-address"
                label="to-address"
                inputRef={toAddrRef}
            />
            <Button 
                variant="contained"
                color="secondary"
                size="small"
                onClick={sendValue}
                disabled={buyFlag}
            >
                Submit
            </Button>
        </div>
    );
};