import Button from '@mui/material/Button';
import './index.css';

export default function SpendGift({ handleSpend, choiceFlag, handleDonate }){

    return(
        <div className="center">
            <p>
                This is the POS terminal that accepts your gift card. Please buy a ticket or donate your gift card.
            </p>
            <Button 
                variant="contained" 
                color="secondary"
                size="small"
                onClick={handleSpend}
                disabled={choiceFlag}
            >
                Buy ticket
            </Button>
            <Button
                variant="contained"
                color="secondary"
                size="small"
                disabled={choiceFlag}
                onClick={handleDonate}
            >
                Donate Card
            </Button>
        </div>
    );
};