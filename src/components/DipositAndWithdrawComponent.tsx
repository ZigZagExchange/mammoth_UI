import React, { useCallback, useEffect, useState } from "react";
import { BigNumber } from "ethers";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import { Box } from '@mui/material';
import CoinInfo from "../libs/CoinInfo.json"
import SelectUnstyled, {
    SelectUnstyledProps,
    selectUnstyledClasses,
} from '@mui/base/SelectUnstyled';
import OptionUnstyled, { optionUnstyledClasses } from '@mui/base/OptionUnstyled';
import { styled } from '@mui/system';
import { PopperUnstyled } from '@mui/base';

import {
    approveToken,
    depositPool,
    getDepositERC20Amount,
    getTokeAllowance,
    getWithdrawERC20Amount,
    tokens,
    withdrawPool,
  } from "../services/pool.service";
  import LoadingIndicator from "./Indicator";
  import { waitForTransaction } from "../services/wallet.service";
  import {
    decimalToBN,
    padDecimal,
    toFloatingPoint,
  } from "../core/floating-point";

interface DipositDialogProps {
    open: boolean;
    onClose: () => void;
}


const blue = {
    100: '#DAECFF',
    200: '#99CCF3',
    400: '#3399FF',
    500: '#007FFF',
    600: '#0072E5',
    900: '#003A75',
};

const grey = {
    100: '#E7EBF0',
    200: '#E0E3E7',
    300: '#CDD2D7',
    400: '#B2BAC2',
    500: '#A0AAB4',
    600: '#6F7E8C',
    700: '#3E5060',
    800: '#2D3843',
    900: '#1A2027',
};

const StyledButton = styled('button')(
    ({ theme }) => `
    font-family: IBM Plex Sans, sans-serif;
    font-size: 0.875rem;
    box-sizing: border-box;
    min-height: calc(1.5em + 22px);
    min-width: 320px;
    background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
    border: 1px solid ${theme.palette.mode === 'dark' ? grey[800] : grey[300]};
    border-radius: 0.75em;
    margin: 0.5em;
    padding: 10px;
    text-align: left;
    line-height: 1.5;
    color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
  
    &:hover {
      background: ${theme.palette.mode === 'dark' ? '' : grey[100]};
      border-color: ${theme.palette.mode === 'dark' ? grey[700] : grey[400]};
    }
  
    &.${selectUnstyledClasses.focusVisible} {
      outline: 3px solid ${theme.palette.mode === 'dark' ? blue[600] : blue[100]};
    }
  
    &.${selectUnstyledClasses.expanded} {
      &::after {
        content: '▴';
      }
    }
  
    &::after {
      content: '▾';
      float: right;
    }
  
    & img {
      margin-right: 10px;
    }
    `,
);

const StyledListbox = styled('ul')(
    ({ theme }) => `
    font-family: IBM Plex Sans, sans-serif;
    font-size: 0.875rem;
    box-sizing: border-box;
    
    padding: 1px;
    margin: 0px 0;
    min-width: 370px;
    max-height: 400px;
    background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
    border: 1px solid ${theme.palette.mode === 'dark' ? grey[800] : grey[300]};
    border-radius: 0.75em;
    color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
    overflow: auto;
    outline: 0px;
    `,
);

const StyledOption = styled(OptionUnstyled)(
    ({ theme }) => `
    list-style: none;
    padding: 8px;
    border-radius: 0.45em;
    cursor: default;
    display: flex;
    align-items: center;
  
    &:last-of-type {
      border-bottom: none;
    }
  
    &.${optionUnstyledClasses.selected} {
      background-color: ${theme.palette.mode === 'dark' ? blue[900] : blue[100]};
      color: ${theme.palette.mode === 'dark' ? blue[100] : blue[900]};
    }
  
    &.${optionUnstyledClasses.highlighted} {
      background-color: ${theme.palette.mode === 'dark' ? grey[800] : grey[100]};
      color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
    }
  
    &.${optionUnstyledClasses.highlighted}.${optionUnstyledClasses.selected} {
      background-color: ${theme.palette.mode === 'dark' ? blue[900] : blue[100]};
      color: ${theme.palette.mode === 'dark' ? blue[100] : blue[900]};
    }
  
    &.${optionUnstyledClasses.disabled} {
      color: ${theme.palette.mode === 'dark' ? grey[700] : grey[400]};
    }
  
    &:hover:not(.${optionUnstyledClasses.disabled}) {
      background-color: ${theme.palette.mode === 'dark' ? grey[800] : grey[100]};
      color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
    }
  
    & img {
      margin-right: 10px;
    }
    `,
);

const StyledPopper = styled(PopperUnstyled)`
    z-index: 1;
  `;

const CustomSelect = React.forwardRef(function CustomSelect(
    props: SelectUnstyledProps<number>,
    ref: any,
) {
    const components: SelectUnstyledProps<number>['components'] = {
        Root: StyledButton,
        Listbox: StyledListbox,
        Popper: StyledPopper,
        ...props.components,
    };

    return <SelectUnstyled {...props} ref={ref} components={components} />;
});

const CustomInput = styled((props: any) => <input {...props} />)`
    border: none;
    height: 1.8vw;
    font-size: 1vw;
    background: #292929;
    color: white;
    &:focus-visible{
        outline: none;
        border: none;
    }
`

export default function DipositAndWithdrawComponent(props: DipositDialogProps) {
    const [open, setOpen] = React.useState(false);
    const [isDeposit, setDeposit] = React.useState(false);
    React.useEffect(() => {
        setOpen(props.open)
    }, [props.open])

    const handleClose = () => {
        props.onClose();
        setOpen(false);
    };

    const [depositAmount, changeAmount] = useState("0");
  const [depositAmountDecimal, changeAmountDecimal] = useState("");

  const [LPAmount, changeLPAmount] = useState("0");
  const [tokenIndex, changeIndex] = useState(0);
  const [isLoading, changeIsLoading] = useState(false);
  const [loadingMsg, changeLoadingMsg] = useState("Awaiting Deposit");
  const [txComplete, changeTxComplete] = useState(false);
  const [txMessage, changeTxMsg] = useState("Deposit Complete");
  const [failMsg, changeFailMsg] = useState("");
  const [isTokenApproved, changeTokenApproved] = useState(false);

  const [withdrawAmount, changeWithdrawAmount] = useState("0");
  const [withdrawAmountDecimal, changeWithdrawAmountDecimal] = useState("");

  useEffect(()=>{
    changeLPAmount("0")
    changeIndex(0);
    changeIsLoading(false);
    changeLoadingMsg("Awaiting Deposit");
    changeTxComplete(false)
    changeTxMsg("Deposit Complete")
    changeFailMsg("")
    changeTokenApproved(false)
    changeWithdrawAmount("0")
    changeWithdrawAmountDecimal("")
  }, [isDeposit])

  const tokenApproval = useCallback(async () => {
    const res: BigNumber = await getTokeAllowance(tokenIndex);
    if (res.isZero()) {
      changeTokenApproved(false);
    } else {
      changeTokenApproved(true);
    }
  }, [tokenIndex]);

  useEffect(() => {
    (async () => {
      await tokenApproval();
    })();
  });

  const predictDepositResult = async (number: string, decimal: string) => {
    const total = BigNumber.from(number).mul(10000).add(decimalToBN(decimal));
    const amount = await getDepositERC20Amount(tokenIndex, total.toString());
    changeLPAmount(toFloatingPoint(amount.toString()));
  };

  const handleInputChange = async (e: any) => {
      console.log(e.target.value);
    e.preventDefault();
    const val = e.target.value;
    const parts = val.split(".");

    const hasDecmial = depositAmountDecimal.length;

    if (val.length > 0) {
      let newNumber = "0";
      if (parts[0].length) {
        newNumber = parts[0];
      }
      changeAmount(newNumber);

      let newDecimal = "";

      if (parts[1]?.length) {
        newDecimal = parts[1].substring(0, 4);
      } else if (parts[1] === undefined && hasDecmial) {
        newDecimal = "";
      }
      changeAmountDecimal(newDecimal);

      await predictDepositResult(newNumber, newDecimal);
    } else {
      changeAmount("0");
      changeAmountDecimal("");
    }
  };

  const handleTokenSelect = async (e: any) => {
    // e.preventDefault();
    console.log(e)
    const val = e;
    //await tokenApproval();
    changeIndex(parseInt(val));
    await predictDepositResult(depositAmount, depositAmountDecimal);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    changeIsLoading(true);
    changeLoadingMsg(`Depositing ${tokens[tokenIndex].symbol}`);
    changeTxMsg(`Deposit ${tokens[tokenIndex].symbol} success`);
    let success = true;
    try {
      const tx = await depositPool(
        depositAmount + padDecimal(depositAmountDecimal),
        tokenIndex
      );
      await waitForTransaction(tx.transaction_hash);
    } catch (e) {
      success = false;
      changeFailMsg("Deposit failed");
    }
    changeIsLoading(false);
    if (success) {
      changeTxComplete(true);
      changeTokenApproved(true);
    }
  };

  const Withdraw = async (e: any) => {
    e.preventDefault();
    changeIsLoading(true);
    let success = true;
    try {
      const tx = await withdrawPool(
        withdrawAmount + padDecimal(withdrawAmountDecimal),
        tokenIndex
      );
      await waitForTransaction(tx.transaction_hash);
    } catch (e) {
      success = false;
      changeFailMsg("Withdraw failed");
    }
    changeIsLoading(false);
    if (success) {
      changeTxComplete(true);
    }
  };

  const handleApprove = async (e: any) => {
    e.preventDefault();

    changeLoadingMsg(`Approving ${tokens[tokenIndex].symbol}`);
    changeTxMsg(`${tokens[tokenIndex].symbol} approved`);
    changeIsLoading(true);
    let success = true;
    try {
      await approveToken(tokenIndex);
    } catch (e) {
      success = false;
      changeFailMsg("Approval failed");
    }
    changeIsLoading(false);
    if (success) {
      console.log("success");
      changeTxComplete(true);
      changeTokenApproved(true);
    }
  };

  const handleIndicatorClose = () => {
    changeTxComplete(false);
  };

  const handleFailIndicatorClose = () => {
    changeFailMsg("");
  };

  const getFPString = () => {
    if (depositAmountDecimal.length > 0) {
      return depositAmount + "." + depositAmountDecimal;
    }
    return depositAmount;
  };

  const handleWithdrawInputChange = async (e: any) => {
    e.preventDefault();
    const val = e.target.value;
    const parts = val.split(".");

    const hasDecmial = withdrawAmountDecimal.length;

    if (val.length > 0) {
      let newNumber = "0";
      if (parts[0].length) {
        newNumber = parts[0];
      }
      changeAmount(newNumber);

      let newDecimal = "";

      if (parts[1]?.length) {
        newDecimal = parts[1].substring(0, 4);
      } else if (parts[1] === undefined && hasDecmial) {
        newDecimal = "";
      }
      changeAmountDecimal(newDecimal);

      await predictWithdrawResult(newNumber, newDecimal);
    } else {
      changeAmount("0");
      changeAmountDecimal("");
    }
  };

  const predictWithdrawResult = async (number: string, decimal: string) => {
    const total = BigNumber.from(number).mul(10000).add(decimalToBN(decimal));
    const amount = await getWithdrawERC20Amount(tokenIndex, total.toString());
    changeLPAmount(toFloatingPoint(amount.toString()));
  };

    return (
        <Box>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                style={{backdropFilter: 'blur(2px)'}}
                PaperProps={{
                    style: {
                      background: '#292929',
                      borderRadius: '6px',
                      overflow: 'auto',
                      fontSize: '0.8rem',
                      minWidth: '500px',
                      paddingLeft: '20px',
                      paddingRight: '20px',
                    },
                  }}
            >
                {isLoading ? (
                    <LoadingIndicator msg={loadingMsg} isLoading={true} />
                ) : null}
                {txComplete ? (
                    <LoadingIndicator
                    closeable={true}
                    msg={txMessage}
                    onClose={handleIndicatorClose}
                    />
                ) : null}
                {failMsg.length ? (
                    <LoadingIndicator
                    closeable={true}
                    msg={failMsg}
                    onClose={handleFailIndicatorClose}
                    />
                ) : null}
                <Box display="flex" justifyContent={'space-around'} mt="50px">
                    <Box width="40%" onClick={()=>{setDeposit(true)}} textAlign="center" p="10px" bgcolor={isDeposit ? '#09aaf5': ''} color={'white'} borderRadius="5px" border={'1px #09aaf5 solid'} style={{cursor: 'pointer'}}>Deposit</Box>
                    <Box width="40%" onClick={()=>{setDeposit(false)}} textAlign="center" p="10px" bgcolor={!isDeposit ? '#09aaf5': ''} color={'white'} borderRadius="5px" border={'1px #09aaf5 solid'} style={{cursor: 'pointer'}}>Withdraw</Box>
                </Box>
                <Box fontSize="2vw" fontWeight="500" mt="2vw" px="2vw" pt="1vw" color="white">{isDeposit ? 'Deposit' : 'Withdraw'}</Box>
                <Box display="flex" flexDirection="column" px="2vw" pt="2vw" pb="4vw">
                    <CustomSelect onChange={handleTokenSelect}>
                        {CoinInfo.map((c:any, index: number) => (
                            <StyledOption key={c.coin} value={index}>
                                <img
                                    loading="lazy"
                                    width="20"
                                    src={c.url}
                                    srcSet={c.url}
                                    alt={`coin`}
                                />
                                {c.coin}
                            </StyledOption>
                        ))}
                    </CustomSelect>
                    <Box display="flex" mt="2vw" alignItems="flex-start" flexDirection="column" width="100%">
                        <Box flex={1} display="flex" flexDirection="column" mb="3vw" width="100%">
                            <Box color="lightgray" fontSize="1vw" mb="1vw" >Amount</Box>
                            <Box borderBottom=" 1px solid white" display="flex" justifyContent="space-between">
                                <CustomInput value={getFPString()} onChange={isDeposit ? handleInputChange : handleWithdrawInputChange}  />
                            </Box>

                            <Box color="white" fontSize="1vw" mt="1vw" textAlign="right">Receive&nbsp; <span style={{color: '#ff1268'}}>{LPAmount.toString()}</span> LP TOkens</Box>
                        </Box>
                    </Box>
                    <Box display="flex" width="50%">
                        <Box color="#09aaf5" width="100%" height="100%" mr="1vw">
                            {!isTokenApproved && isDeposit && <Button 
                                color="inherit" 
                                fullWidth 
                                variant="outlined" 
                                onClick={handleApprove} 
                                sx={{ borderRadius: '5px', height: '80%', textTransform: 'none' }}
                                // disabled={!checked || amount===0 || balance ===0}
                            >{'Approve'}</Button>}
                            {isDeposit && isTokenApproved && <Button 
                                disabled={isLoading || !isTokenApproved}
                                color="inherit" 
                                fullWidth 
                                variant="outlined" 
                                onClick={handleSubmit} 
                                sx={{ borderRadius: '5px', height: '80%', textTransform: 'none' }}
                            >{'Deposit'}</Button>}
                            {!isDeposit && <Button 
                                disabled={isLoading}
                                color="inherit" 
                                fullWidth 
                                variant="outlined" 
                                onClick={Withdraw} 
                                sx={{ borderRadius: '5px', height: '80%', textTransform: 'none' }}
                            >{'Withdraw'}</Button>}
                        </Box>
                        <Box color="orangered" width="100%" height="100%">
                            <Button color="inherit" fullWidth variant="outlined" onClick={handleClose} sx={{ borderRadius: '5px', height: '80%', textTransform: 'none' }}>Cancel</Button>
                        </Box>
                    </Box>
                </Box>
            </Dialog>
        </Box>
    );
}