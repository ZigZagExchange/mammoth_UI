import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import { Box } from '@mui/material';
import { Button as CustomButton } from "./Button/Button";
import Image from "next/image";
import { mintToken } from "../services/pool.service";
import { tokens } from "../services/constants";
import cx from "classnames";
import { toast } from "react-toastify";

interface DepositDialogProps {
  open: boolean;
  onClose: () => void;
  onEvent: ()=>void;
}

export default function MintDialogComponent(props: DepositDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isLoading, changeIsLoading] = React.useState(false);
  const [loadingMsg, changeLoadingMsg] = React.useState("Minting");
  const [txMessage, changeTxMsg] = React.useState("Complete");
  const [txComplete, changeTxComplete] = React.useState(false);
  const [failMsg, changeFailMsg] = React.useState("");

  React.useEffect(() => {
    setOpen(props.open)
  }, [props.open])

  const handleClose = () => {
    props.onClose();
    setOpen(false);
  };

  React.useEffect(()=>{
    if(!txComplete || !txMessage) return;
    openErrorWindow(txMessage, 1)
    changeTxMsg("")
  }, [txComplete])

  React.useEffect(()=>{
    if(!isLoading || !loadingMsg) return;
    openErrorWindow(loadingMsg, 3)
    changeLoadingMsg("")
  }, [loadingMsg])

  React.useEffect(()=>{
    if(!failMsg) return;
    openErrorWindow(failMsg, 2)
    changeFailMsg("");
  },[failMsg])

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

  const handleMint = async (tokenIndex: number) => {
    try{
      changeIsLoading(true);
      changeLoadingMsg(`Minting ${tokens[tokenIndex].symbol} !`);
      await mintToken(tokenIndex);
      changeTxMsg(`25 ${tokens[tokenIndex].symbol} minted`)
      changeTxComplete(true);
    } catch (e) {
      changeFailMsg("Minting Failed!")
    } 
    finally {
      props.onEvent();
      changeIsLoading(false);
    }
  };

  const handleCopy = (tokenIndex: number) => {
    navigator.clipboard.writeText(tokens[tokenIndex].address);
  };

  let path = "";
  if (typeof window !== "undefined") {
    path = window.location.pathname.split("/")[2];
  }


  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        style={{ backdropFilter: 'blur(2px)' }}
        PaperProps={{
          style: {
            borderRadius: '6px    ',
            overflow: 'auto',
            fontSize: '0.8rem',
            background: '#2B2E4A'
          },
        }}
      >
        <Box fontSize="1vw" color="white" fontWeight="500" py="1vw" px="1.5vw">{'Mint'}</Box>
        <Box display="flex" flexDirection="column" px="2vw" pb="2vw" bgcolor={'#191A33'}>
          <Box display="flex" alignItems="flex-start" flexDirection="column" width="400px">
            {
              tokens.map((c, key: number) => (
                <Box display="flex" alignItems="center" width="100%" mb="10px" p="20px" key={key} justifyContent='space-between'>
                  <Box width="50%" display="flex" alignItems="center">
                    <img src={c.logo} width="30px" alt="image" />
                    <Box ml="20px" color="white">{c.symbol}</Box>
                  </Box>
                  <CustomButton className={cx("bg_btn", {zig_disabled: isLoading})} style={{ width: '100px', marginRight: '10px', background: 'linear-gradient(93.59deg, rgba(9, 170, 245, 0.5) 4.26%, rgba(8, 207, 232, 0.5) 52.59%, rgba(98, 210, 173, 0.5) 102.98%)' }} text="Mint" onClick={() => handleMint(key)} />
                  <CustomButton className={"bg_btn"} style={{ width: '100px', background: 'linear-gradient(93.59deg, rgba(9, 170, 245, 0.5) 4.26%, rgba(8, 207, 232, 0.5) 52.59%, rgba(98, 210, 173, 0.5) 102.98%)' }} onClick={() => handleCopy(key)}  >
                    <Image
                      src="/clipboard.svg"
                      width="20"
                      height="20"
                      alt="copy the first token address"
                    />
                  </CustomButton>
                </Box>
              ))
            }
          </Box>
        </Box>
      </Dialog>
    </div>
  );
}