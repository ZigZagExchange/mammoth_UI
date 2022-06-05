import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import { Box } from '@mui/material';
import { Button as CustomButton } from "./Button/Button";
import Image from "next/image";
import { mintToken, approveAllTokens } from "../services/pool.service";
import { tokens } from "../services/constants";

interface DepositDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function MintDialogComponent(props: DepositDialogProps) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setOpen(props.open)
  }, [props.open])

  const handleClose = () => {
    props.onClose();
    setOpen(false);
  };

  const handleMint = async (tokenIndex: number) => {
    await mintToken(tokenIndex);
  };

  const approveAll = async () => {
    console.log('allow all')
    await approveAllTokens();
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
                  <CustomButton className="bg_btn" style={{ width: '100px', marginRight: '10px', background: 'linear-gradient(93.59deg, rgba(9, 170, 245, 0.5) 4.26%, rgba(8, 207, 232, 0.5) 52.59%, rgba(98, 210, 173, 0.5) 102.98%)' }} text="MINT" onClick={() => handleMint(key)} />
                  <CustomButton className="bg_btn" style={{ width: '100px', background: 'linear-gradient(93.59deg, rgba(9, 170, 245, 0.5) 4.26%, rgba(8, 207, 232, 0.5) 52.59%, rgba(98, 210, 173, 0.5) 102.98%)' }} onClick={() => handleCopy(key)}  >
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
          <Box mb="1vw" color="white">
            Total Mint Value ~ 2.43
          </Box>
          <Box display="flex" width="100%">
            <Box color="orangered" width="100%" height="100%">
              <CustomButton className="bg_btn" style={{ background: 'linear-gradient(93.59deg, rgba(9, 170, 245, 0.5) 4.26%, rgba(8, 207, 232, 0.5) 52.59%, rgba(98, 210, 173, 0.5) 102.98%)' }} text="Approve All" onClick={() => approveAll()} />
            </Box>
          </Box>
        </Box>
      </Dialog>
    </div>
  );
}