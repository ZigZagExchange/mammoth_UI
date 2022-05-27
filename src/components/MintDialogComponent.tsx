import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import { Box, Checkbox, FormControlLabel } from '@mui/material';
import { pink } from '@mui/material/colors';
import { Button as CustomButton } from "./Button/Button";

interface DipositDialogProps {
    open: boolean;
    onClose: () => void;
}

export default function MintDialogComponent(props: DipositDialogProps) {
    const [open, setOpen] = React.useState(false);
    // const {chainId, account} = useAuth()
    const [balance, setBalance] = React.useState(0);
    const [amount, setAmount] = React.useState(100);
    const [checked, setChecked] = React.useState(false);
    const [coinName, setCoinName] = React.useState('')

    React.useEffect(() => {
        setOpen(props.open)
        setAmount(0)
        setBalance(0)
        setCoinName('')
    }, [props.open])

    const handleClose = () => {
        props.onClose();
        setOpen(false);
    };

    const depositOrWithdraw = async() => {
        handleClose();
    }

    const changeStableCoin = async(e: any) => {
    }

    const changeAmount = (e: any) => {
        setAmount(Number(e.target.value))
    }

    const setAmountPercentage = (percentage:  number) => () => {
        setAmount(parseFloat((balance * percentage / 100).toFixed(2)))
    }

    return (
        <div>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <Box fontSize="2vw" fontWeight="500" mt="2vw" px="2vw" pt="1vw">{'Mint'}</Box>
                <Box display="flex" flexDirection="column" px="2vw" pt="2vw" pb="4vw">

                    <Box display="flex" mt="2vw" alignItems="flex-start" flexDirection="column" width="400px">
                        <Box display="flex" alignItems="center" width="100%" mb="20px" p="20px" justifyContent='space-between'>
                            <Box width="100%">USDC</Box>
                            <CustomButton className="bg_btn" style={{width: '100px'}} text="MINT" onClick={()=>{}} />
                        </Box>
                        <Box display="flex" alignItems="center" width="100%" mb="20px" p="20px" justifyContent='space-between'>
                            <Box width="100%">ZZUSDC</Box>
                            <CustomButton className="bg_btn" style={{width: '100px'}} text="MINT" onClick={()=>{}} />
                        </Box>
                        <Box display="flex" alignItems="center" width="100%" mb="20px" p="20px" justifyContent='space-between'>
                            <Box width="100%">PONZI LUNA</Box>
                            <CustomButton className="bg_btn" style={{width: '100px'}} text="MINT" onClick={()=>{}} />
                        </Box>
                    </Box>
                    <Box mb="1vw" >
                        Total Mint Value ~ 2.43
                    </Box>
                    <Box display="flex" width="100%">
                        <Box color="orangered" width="100%" height="100%">
                            <Button color="inherit" fullWidth variant="outlined" onClick={handleClose} sx={{ borderRadius: '8px', height: '80%', textTransform: 'none' }}>Approve All</Button>
                        </Box>
                    </Box>
                </Box>
            </Dialog>
        </div>
    );
}