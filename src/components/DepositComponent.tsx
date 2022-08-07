import React, { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import { Box } from '@mui/material';
import { tokens } from '../services/constants';
import SelectUnstyled, {
    SelectUnstyledProps,
    selectUnstyledClasses,
} from '@mui/base/SelectUnstyled';
import OptionUnstyled, { optionUnstyledClasses } from '@mui/base/OptionUnstyled';
import { styled } from '@mui/system';
import { PopperUnstyled } from '@mui/base';

import {
    depositPool,
    approveMultibleTokens,
    getDepositERC20Amount,
    getProportinalDepositERC20Amount,
    proportinalDepositERC20Amount,
} from '../services/pool.service';
import ToggleButton from './Toggle/ToggleButton';

import { Button as CustomButton } from './Button/Button';
import SwapSwapInput from './SwapComponent/SwapSwapInput';
import cx from 'classnames';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { formatPrice } from '../libs/utils';
import { ethers } from 'ethers';

interface DepositDialogProps {
    open: boolean;
    onClose: () => void;
    balance: string[];
    allowance: string[];
    onEvent: () => void;
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
    () => `
    font-family: IBM Plex Sans, sans-serif;
    font-size: 0.875rem;
    box-sizing: border-box;
    min-height: calc(1.5em + 22px);
    min-width: 390px;
    background: #232735;
    border: 1px solid #3C435A;
    border-radius: 5px;
    margin: 0.5em;
    padding: 10px;
    text-align: left;
    line-height: 1.5;
    color: white;
  
    &:hover {
      background: #232735;
      border-color: grey[400];
    }
  
    &.${selectUnstyledClasses.focusVisible} {
      outline: 3px solid '#232735';
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
    () => `
    font-family: IBM Plex Sans, sans-serif;
    font-size: 0.875rem;
    box-sizing: border-box;
    
    padding: 1px;
    margin: 0px 0;
    min-width: 410px;
    max-height: 410px;
    background: #3C435A;
    border-radius: 5px;
    color: white;
    overflow: auto;
    outline: 0px;
    `,
);

export const StyledOption = styled(OptionUnstyled)(
    ({ theme }) => `
    list-style: none;
    padding: 8px;
    border-radius: 0.45em;
    cursor: default;
    display: flex;
    align-items: center;
    width: 100%;
  
    &:last-of-type {
      border-bottom: none;
    }
  
    // &.${optionUnstyledClasses.selected} {
    //   background-color: '#3C435A';
    //   color: ${theme.palette.mode === 'dark' ? blue[100] : blue[900]};
    // }
  
    // &.${optionUnstyledClasses.highlighted} {
    //   background-color: #3C435A;
    //   color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
    // }
  
    // &.${optionUnstyledClasses.highlighted}.${optionUnstyledClasses.selected} {
    //   background-color: #3C435A;
    //   color: #E0E3E7;
    // }
  
    // &.${optionUnstyledClasses.disabled} {
    //   color: ${theme.palette.mode === 'dark' ? grey[700] : grey[400]};
    // }
  
    // &:hover:not(.${optionUnstyledClasses.disabled}) {
    //   background-color: #3C435A;
    //   color: #E0E3E7;
    // }
  
    & img {
      margin-right: 10px;
    }
    `,
);

const StyledPopper = styled(PopperUnstyled)`
    z-index: 1;
`;

export const CustomSelect = React.forwardRef(function CustomSelect(
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

export const CustomInput = styled((props: any) => <input {...props} />)`
    border: none;
    height: 1.8vw;
    font-size: 1vw;
    background: #191a33;
    color: white;
    &:focus-visible {
        outline: none;
        border: none;
    }
`;

export default function DepositComponent(props: DepositDialogProps) {
    const [open, setOpen] = React.useState(false);
    React.useEffect(() => {
        setOpen(props.open);
    }, [props.open]);

    const handleClose = () => {
        props.onClose();
        setOpen(false);
    };

    const [isTokenApproved, setTokenApproved] = useState([false, false, false]);

    const [isUnLimitApprove, setUnlimitApprove] = useState([false, false, false]);

    const [tokenDetails, setTokenDetails] = useState(() => [
        {
            amount: '',
            symbol: tokens[0].symbol,
        },
        {
            amount: '',
            symbol: tokens[1].symbol,
        },
        {
            amount: '',
            symbol: tokens[2].symbol,
        },
    ]);

    const [LPAmount, setLPAmount] = useState(0);

    const [proportionalMode, setProportionalMode] = useState(false);

    const [isLoading, changeIsLoading] = useState(false);
    const [loadingMsg, changeLoadingMsg] = useState('Awaiting Deposit');
    const [txComplete, changeTxComplete] = useState(false);
    const [txMessage, changeTxMsg] = useState('Deposit Complete');
    const [failMsg, changeFailMsg] = useState('');

    useEffect(() => {
        const newTokenApprove = [false, false, false];
        const newTokenUnlimitApprove = [false, false, false];

        for (let i = 0; i <= 2; i++) {
            const allowanceString = props.allowance[i];
            const amount = tokenDetails[i].amount;
            if (allowanceString === '--' || allowanceString === '') continue;

            const userAllownace = ethers.BigNumber.from(allowanceString.split('.')[0]); // full number part
            const maxInt = ethers.BigNumber.from(Number.MAX_SAFE_INTEGER - 1); // MAX_SAFE_INTEGER - 1 because we use floor for userAllownace
            // userAllownace might be grater the the MAX_SAFE_INTEGER range
            if (userAllownace.gt(maxInt)) {
                newTokenApprove[i] = true;
                newTokenUnlimitApprove[i] = true;
                continue;
            }

            const minAllowance = ethers.constants.MaxUint256.div(100);
            newTokenUnlimitApprove[i] = minAllowance.lt(userAllownace);

            if (amount) {
                const amountBN = ethers.BigNumber.from(amount);
                newTokenApprove[i] = amountBN.lt(userAllownace);
            }
        }
        setTokenApproved(newTokenApprove);
        setUnlimitApprove(newTokenUnlimitApprove);
    }, [tokenDetails, props.allowance]);

    useEffect(() => {
        if (!txComplete) return;
        openErrorWindow(txMessage, 1);
    }, [txComplete]);

    useEffect(() => {
        if (failMsg.length) openErrorWindow(failMsg, 2);
    }, [failMsg]);

    useEffect(() => {
        if (!isLoading) return;
        openErrorWindow(loadingMsg, 3);
    }, [isLoading]);

    const openErrorWindow = (value: string, flag: number) => {
        if (toast.isActive(flag)) return;
        if (flag === 3) {
            toast.info(value, {
                closeOnClick: false,
                autoClose: 15000,
                position: toast.POSITION.BOTTOM_RIGHT,
                toastId: flag,
            });
        }
        if (flag === 2) {
            toast.error(value, {
                closeOnClick: false,
                autoClose: 15000,
                position: toast.POSITION.BOTTOM_RIGHT,
                toastId: flag,
            });
        }
        if (flag === 1) {
            toast.success(value, {
                closeOnClick: false,
                autoClose: 15000,
                position: toast.POSITION.BOTTOM_RIGHT,
                toastId: flag,
            });
        }
    };

    const updateNormalMode = async () => {
        if (proportionalMode) return;
        const result: Promise<any>[] = tokens.map(async (_, index) => {
            const amount = Number(tokenDetails[index].amount);
            return await getDepositERC20Amount(index, amount);
        });
        const lpAmounts: number[] = await Promise.all(result);
        const sum = lpAmounts.reduce((pv, cv) => pv + Number(cv), 0);
        setLPAmount(sum);
    };

    useEffect(() => {
        if (proportionalMode) return;
        updateNormalMode();
    }, [proportionalMode, tokenDetails]);

    const updateProportionalMode = async () => {
        if (!proportionalMode) return;
        const result = await getProportinalDepositERC20Amount(Number(LPAmount));

        const newTokenDetails = tokenDetails.map((details, index) => {
            details.amount = formatPrice(result[index]);
            return details;
        });
        setTokenDetails(newTokenDetails);
    };

    useEffect(() => {
        if (!proportionalMode) return;
        updateProportionalMode();
    }, [proportionalMode, LPAmount]);

    const handleSubmitNormal = async () => {
        if (proportionalMode) return;
        const depositTokensDetails = [];
        const tokenSymbols = [];
        for (let i = 0; i < 3; i++) {
            const amount = Number(tokenDetails[i].amount);
            if (amount > 0) {
                depositTokensDetails.push([i, amount]);
                tokenSymbols.push(tokens[i].symbol);
            }
        }
        if (depositTokensDetails.length === 0) return;

        changeIsLoading(true);
        changeLoadingMsg(`Depositing ${tokenSymbols}`);
        changeTxMsg(`Deposit ${tokenSymbols} success`);
        let success = true;
        try {
            await depositPool(depositTokensDetails);
        } catch (e) {
            success = false;
            changeFailMsg('Deposit failed');
        } finally {
            props.onEvent();
        }
        changeIsLoading(false);
        if (success) {
            changeTxComplete(true);
        }
    };

    const handleSubmitProportional = async () => {
        if (!proportionalMode) return;
        const tokenSymbols = [];
        for (let i = 0; i < 3; i++) {
            tokenSymbols.push(tokens[i].symbol);
        }

        changeIsLoading(true);
        changeLoadingMsg(`Depositing ${tokenSymbols}`);
        changeTxMsg(`Deposit ${tokenSymbols} success`);
        let success = true;
        try {
            await proportinalDepositERC20Amount(Number(LPAmount));
        } catch (e) {
            console.log(e);
            success = false;
            changeFailMsg('Deposit failed');
        } finally {
            props.onEvent();
        }
        changeIsLoading(false);
        if (success) {
            changeTxComplete(true);
        }
    };

    const handleApprove = async (maxApprove = false) => {
        const approveTokens = [];
        const tokenSymbols = [];
        for (let i = 0; i < 3; i++) {
            if (!isTokenApproved[i]) {
                approveTokens.push(tokens[i].address);
                tokenSymbols.push(tokens[i].symbol);
            }
        }
        if (approveTokens.length === 0) return;

        changeLoadingMsg(`Approving ${tokenSymbols}`);
        changeTxMsg(`${tokenSymbols} approved`);
        changeIsLoading(true);
        let success = true;
        try {
            await approveMultibleTokens(approveTokens);
        } catch (e) {
            success = false;
            changeFailMsg('Approval failed');
        } finally {
            props.onEvent();
        }
        changeIsLoading(false);
        if (success) {
            console.log('success');
            changeTxComplete(true);
        }
    };

    const setDepositDetailsOne = (values: any, from: boolean) => {
        const details = {
            ...tokenDetails[0],
            ...values,
        };
        setTokenDetails([details, tokenDetails[1], tokenDetails[2]]);
    };

    const setDepositDetailsOTwo = (values: any, from: boolean) => {
        const details = {
            ...tokenDetails[1],
            ...values,
        };
        setTokenDetails([tokenDetails[0], details, tokenDetails[2]]);
    };

    const setDepositDetailsThree = (values: any, from: boolean) => {
        const details = {
            ...tokenDetails[2],
            ...values,
        };
        setTokenDetails([tokenDetails[0], tokenDetails[1], details]);
    };

    const changeLpAmount = (values: any) => {
        setLPAmount(values.amount);
    };

    return (
        <Box>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                style={{ backdropFilter: 'blur(2px)' }}
                PaperProps={{
                    style: {
                        background: 'linear-gradient(180deg, #32374B 0%, #1C1E27 100%)',
                        borderRadius: '6px',
                        overflow: 'auto',
                        fontSize: '0.8rem',
                    },
                }}
            >
                <Box fontSize="18px" fontWeight="700" px="30px" py="25px" color="white">
                    Deposit
                </Box>
                <Box display="flex" flexDirection="column" px="40px" pb="50px" bgcolor={'#232735'}>
                    <Box
                        bgcolor="#181B25"
                        color="#636EA8"
                        mt="33px"
                        mb="23px"
                        p="11px 13px"
                        fontFamily="Inter"
                        fontWeight={700}
                        fontSize="13px"
                    >
                        Tip: When you add liquidity, you will receive pool tokens representing your
                        position. These tokens automatically earn fees proportional to your share of
                        the pool, and can be redeemed at any time.
                    </Box>
                    <Box
                        textAlign={'right'}
                        mt="20px"
                        mb="4px"
                        color="rgb(256,256,256,0.5)"
                        fontSize="14px"
                    >
                        Balance: {formatPrice(props.balance[0])} {tokenDetails[0].symbol}
                    </Box>
                    <SwapSwapInput
                        balances={props.balance}
                        from={true}
                        value={tokenDetails[0]}
                        onChange={setDepositDetailsOne}
                        borderBox
                        listWidth="505px"
                        readOnly={proportionalMode}
                    />
                    <Box
                        textAlign={'right'}
                        mt="20px"
                        mb="4px"
                        color="rgb(256,256,256,0.5)"
                        fontSize="14px"
                    >
                        Balance: {formatPrice(props.balance[1])} {tokenDetails[1].symbol}
                    </Box>
                    <SwapSwapInput
                        balances={props.balance}
                        from={true}
                        value={tokenDetails[1]}
                        onChange={setDepositDetailsOTwo}
                        borderBox
                        listWidth="505px"
                        readOnly={proportionalMode}
                    />
                    <Box
                        textAlign={'right'}
                        mt="20px"
                        mb="4px"
                        color="rgb(256,256,256,0.5)"
                        fontSize="14px"
                    >
                        Balance: {formatPrice(props.balance[2])} {tokenDetails[2].symbol}
                    </Box>
                    <SwapSwapInput
                        balances={props.balance}
                        from={true}
                        value={tokenDetails[2]}
                        onChange={setDepositDetailsThree}
                        borderBox
                        listWidth="505px"
                        readOnly={proportionalMode}
                    />
                    {proportionalMode && (
                        <div>
                            <SwapSwapInput
                                balances={props.balance}
                                from={true}
                                value={{ amount: LPAmount, symbol: 'MLP' }}
                                onChange={changeLpAmount}
                                borderBox
                                listWidth="505px"
                            />
                        </div>
                    )}
                    {!proportionalMode && (
                        <Box
                            textAlign={'right'}
                            mt="4px"
                            mb="42px"
                            color="rgb(256,256,256,0.5)"
                            fontSize="14px"
                        >
                            Estimated amount: {LPAmount ? LPAmount : '--'} MLP
                        </Box>
                    )}
                    <ToggleButton
                        type="option"
                        size="sm"
                        leftLabel="Single Mode"
                        rightLabel="Proportional Mode"
                        width="160"
                        leftSelected={!proportionalMode}
                        toggleClick={() => setProportionalMode(!proportionalMode)}
                    />
                    <Box display="flex" width="100%">
                        <Box width="100%" height="100%" display="flex">
                            {!isUnLimitApprove && (
                                <CustomButton
                                    className={cx('bg_btn_deposit', {})}
                                    text="ApproveUnlimit"
                                    onClick={() => handleApprove(true)}
                                    style={{ marginRight: '10px' }}
                                />
                            )}
                            {!isUnLimitApprove && (
                                <CustomButton
                                    className={cx('bg_btn_deposit', {
                                        zig_disabled: isTokenApproved,
                                    })}
                                    text="Approve"
                                    onClick={() => handleApprove()}
                                    style={{ marginRight: '10px' }}
                                />
                            )}
                            <CustomButton
                                className={cx('bg_btn_deposit', {
                                    zig_disabled: !isTokenApproved,
                                })}
                                text="Supply"
                                onClick={() =>
                                    proportionalMode
                                        ? handleSubmitProportional()
                                        : handleSubmitNormal()
                                }
                            />
                        </Box>
                    </Box>
                </Box>
            </Dialog>
        </Box>
    );
}
