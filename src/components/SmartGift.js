import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

// buy onClick = show UI page to get inputs, start contract -- first
// spend onClick = get contract
export default function SmartGift({ buySmartGift, spendSmartGift }) {
    return(
        <Box className="center" sx={{ flexGrow: 1}}>
            <p>
                Welcome to the Smart Gift Card Contract
            </p>
            <Button onClick={buySmartGift} variant="contained" color="secondary">
                Buy Smart Gift Card
            </Button>
            <Button onClick={spendSmartGift} variant="contained" color="secondary">
                Spend Smart Gift Card
            </Button>
        </Box>
    );
}
