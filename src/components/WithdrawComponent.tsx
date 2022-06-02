import React, { useState } from "react";
import { BigNumber } from "ethers";
import Dialog from '@mui/material/Dialog';
import { Box } from '@mui/material';
import CoinInfo from "../libs/CoinInfo.json"

import {
  getWithdrawERC20Amount,
  withdrawPool,
} from "../services/pool.service";
import LoadingIndicator from "./Indicator";
import { Button as CustomButton } from "./Button/Button";
import { CustomInput, CustomSelect, StyledOption } from "./DepositComponent";

interface WithdrawDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function WithdrawComponent(props: WithdrawDialogProps) {
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    setOpen(props.open)
  }, [props.open])

  const handleClose = () => {
    props.onClose();
    setOpen(false);
  };

  const [withdrawAmount, changeWithdrawAmount] = useState(0);
  const [LPAmount, changeLPAmount] = useState("0");
  const [tokenIndex, changeIndex] = useState(0);
  const [isLoading, changeIsLoading] = useState(false);
  const [txComplete, changeTxComplete] = useState(false);
  const [failMsg, changeFailMsg] = useState("");


  const handleTokenSelect = async (e: any) => {
    e.preventDefault();
    const val = e.target.value;
    //await tokenApproval();
    changeIndex(parseInt(val));
    await predictWithdrawResult(withdrawAmount);
  };

  const Withdraw = async (e: any) => {
    e.preventDefault();
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
    }
    changeIsLoading(false);
    if (success) {
      changeTxComplete(true);
    }
  };

  const handleInputChange = async (e: any) => {
    e.preventDefault();
    let val = e.target.value;
    if (typeof val === "string") {
      val = parseFloat(val.replace(",", "."));
    }
    val = Number.isNaN(val) ? 0 : val;
    changeWithdrawAmount(val);
    await predictWithdrawResult(val);
  };

  const predictWithdrawResult = async (amount: number) => {
    const result = await getWithdrawERC20Amount(tokenIndex, amount);
    changeLPAmount(result);
  };

  const handleIndicatorClose = () => {
    changeTxComplete(false);
  };

  const handleFailIndicatorClose = () => {
    changeFailMsg("");
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
            background: '#2B2E4A',
            borderRadius: '6px',
            overflow: 'auto',
            fontSize: '0.8rem',
            minWidth: '500px',
          },
        }}
      >
        {isLoading ? (
          <LoadingIndicator msg={"Awaiting Withdraw"} isLoading={true} />
        ) : null}
        {txComplete ? (
          <LoadingIndicator
            closeable={true}
            msg={"Withdraw Complete"}
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
        <Box fontSize="1vw" fontWeight="500" px="1.5vw" py="1vw" color="white">Withdraw</Box>
        <Box display="flex" flexDirection="column" px="2vw" pt="2vw" pb="4vw" bgcolor={'#191A33'}>
          <CustomSelect onChange={handleTokenSelect}>
            {CoinInfo.map((c: any, index: number) => (
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
                <CustomInput value={withdrawAmount} onChange={handleInputChange} />
              </Box>

              <Box color="white" fontSize="1vw" mt="1vw" textAlign="right">Receive&nbsp; <span style={{ color: '#ff1268' }}>{LPAmount.toString()}</span> LP TOkens</Box>
            </Box>
          </Box>
          <Box display="flex" width="50%">
            <Box color="#09aaf5" width="100%" height="100%" mr="1vw">
              <CustomButton
                className="bg_btn"
                text="Withdraw"
                onClick={Withdraw}
                style={{ width: '100px', marginRight: '10px', background: 'linear-gradient(93.59deg, rgba(9, 170, 245, 0.5) 4.26%, rgba(8, 207, 232, 0.5) 52.59%, rgba(98, 210, 173, 0.5) 102.98%)' }}
              />
            </Box>
            <Box color="orangered" width="100%" height="100%">
              <CustomButton
                className="bg_btn"
                text="Cancel"
                onClick={handleClose}
                style={{ width: '100px', marginRight: '10px', background: 'linear-gradient(93.59deg, rgba(9, 170, 245, 0.5) 4.26%, rgba(8, 207, 232, 0.5) 52.59%, rgba(98, 210, 173, 0.5) 102.98%)' }}
              />
            </Box>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
}