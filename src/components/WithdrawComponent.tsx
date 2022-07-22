import React, { useState } from "react";
import Dialog from '@mui/material/Dialog';
import { Box } from '@mui/material';
import { tokens } from "../services/constants";
import _ from "lodash";
import {
  getWithdrawERC20Amount,
  withdrawPool,
  getLiquidityBalances
} from "../services/pool.service";
import { Button as CustomButton } from "./Button/Button";
import SwapSwapInput from "./SwapComponent/SwapSwapInput";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { formatPrice } from "../libs/utils";

interface WithdrawDialogProps {
  open: boolean;
  onClose: () => void;
  onEvent: () => void;
}

export default function WithdrawComponent(props: WithdrawDialogProps) {
  const [open, setOpen] = React.useState(false);

  const [withdrawAmount, changeWithdrawAmount] = useState(0);
  const [ERC20Amount, changeERC20Amount] = useState({
    0: '0',
  } as any);
  const [tokenIndex, changeIndex] = useState(0);
  const [isLoading, changeIsLoading] = useState(false);
  const [txComplete, changeTxComplete] = useState(false);
  const [failMsg, changeFailMsg] = useState("");
  const [withdrawDetails, _setWithdrawDetails] = useState(() => ({
    amount: "",
    symbol: tokens[0].symbol,
  }));
  const [liquidityBalance, changeLiquidityBalance] = useState('0');

  React.useEffect(() => {
    setOpen(props.open);
    (async()=>{
      const val= await getLiquidityBalances()
      changeLiquidityBalance(val);
    })();
  }, [props.open])

  const handleClose = () => {
    props.onClose();
    setOpen(false);
  };

  React.useEffect(()=>{
    if(!txComplete) return;
    openErrorWindow("Withdraw Completed", 1)
  }, [txComplete])

  React.useEffect(()=>{
    if(failMsg.length)
      openErrorWindow(failMsg, 2)
  },[failMsg])

  React.useEffect(()=>{
    if(!isLoading) return;
    openErrorWindow("Withdrawing...", 3)
    
  }, [isLoading])

  const openErrorWindow = (value: string, flag: number) => {
    if(toast.isActive(flag)) return;
    if(flag === 3) {
      toast.info(
        value,
        {
          closeOnClick: false,
          autoClose: 15000,
          position: toast.POSITION.BOTTOM_RIGHT,
          toastId: flag
        },
      );
    }
    if(flag === 2 ) {
      toast.error(
        value,
        {
          closeOnClick: false,
          autoClose: 15000,
          position: toast.POSITION.BOTTOM_RIGHT,
          toastId: flag
        },
      );
    }
    if(flag === 1) {
      toast.success(
        value,
        {
          closeOnClick: false,
          autoClose: 15000,
          position: toast.POSITION.BOTTOM_RIGHT,
          toastId: flag
        },
      );
    }
  }

  const handleWithdraw = async () => {
    if(!withdrawAmount) return;
    changeIsLoading(true);
    let success = true;
    try {
      await withdrawPool(
        withdrawAmount,
        tokenIndex
      );
    } catch (e) {
      success = false;
      changeFailMsg("Withdraw failed");
    } finally {
      const val= await getLiquidityBalances()
      changeLiquidityBalance(val);
      let val2: any = withdrawDetails.amount as any;
      if (typeof val2 === "string") {
        val2 = parseFloat(val.replace(",", "."));
      }
      await predictWithdrawResult(val2);
      props.onEvent();
    }
    changeIsLoading(false);
    if (success) {
      changeTxComplete(true);
    }
  };
  
  const predictWithdrawResult = async (amount: number) => {
    const result = await getWithdrawERC20Amount(tokenIndex, amount);
    const oldERC20: any = ERC20Amount;
    oldERC20[amount] = result;
    changeERC20Amount(oldERC20);
  };

  const setWithdrawDetails = async (values: any, from: boolean) => {
    const details = {
      ...withdrawDetails,
      ...values,
    };
    console.log(values)
    _setWithdrawDetails(details);
    console.log("val=========",details)

    let val = details.amount;

    if (typeof val === "string") {
      val = parseFloat(val.replace(",", "."));
    }
    val = Number.isNaN(val) ? 0 : val;
    const index = _.findIndex(tokens, {symbol: details.symbol});
    console.log("index", index);
    changeIndex(index);
    changeWithdrawAmount(val);
    await predictWithdrawResult(val);
  }

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
        <Box fontSize="18px" fontWeight="700" px="30px" py="25px" color="white">Withdraw</Box>
        <Box display="flex" flexDirection="column" px="40px" pb="50px" bgcolor={'#232735'}>
          <Box bgcolor="#181B25" color="#636EA8" mt="33px" mb="23px" p="11px 13px" fontFamily="Inter" fontWeight={700} fontSize="13px">
            Tip: When you add liquidity, you will receive pool tokens representing your position. These tokens automatically earn fees proportional to your share of the pool, and can be redeemed at any time.
          </Box>
          <SwapSwapInput
            // currencies={currencies}
            from={true}
            value={withdrawDetails}
            onChange={setWithdrawDetails}
            borderBox
            listWidth="505px"
          />
          <Box textAlign={'right'} mt="20px" mb="4px" color="rgb(256,256,256,0.5)" fontSize="14px">Balance: {formatPrice(liquidityBalance)} LP tokens</Box>
          <Box textAlign={'right'} mt="4px" mb="42px" color="rgb(256,256,256,0.5)" fontSize="14px">Estimated recived: {formatPrice(ERC20Amount[withdrawAmount])} LP tokens</Box>
          <Box display="flex" width="50%">
            <Box color="#09aaf5" width="100%" height="100%" mr="1vw">
              <CustomButton
                className="bg_btn_deposit"
                text="Withdraw"
                onClick={()=>handleWithdraw()}
              />
            </Box>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
}