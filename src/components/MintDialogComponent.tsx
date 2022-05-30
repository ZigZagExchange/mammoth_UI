import * as React from 'react';
import {useState, useEffect} from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import { Box } from '@mui/material';
import { Button as CustomButton } from "./Button/Button";
import CoinInfo from "../libs/CoinInfo.json"
import { BigNumber } from "ethers";
import Image from "next/image";

import { toFloatingPoint } from "../core/floating-point";
import {
    mintToken,
    tokens,
  } from "../services/pool.service";

interface DipositDialogProps {
    open: boolean;
    onClose: () => void;
}

export default function MintDialogComponent(props: DipositDialogProps) {
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
                style={{backdropFilter: 'blur(2px)'}}
                PaperProps={{
                    style: {
                      background: '#292929',
                      borderRadius: '6px    ',
                      overflow: 'auto',
                      fontSize: '0.8rem',
                    },
                  }}
            >
                <Box fontSize="2vw" color="white" fontWeight="500" mt="2vw" px="2vw" pt="1vw">{'Mint'}</Box>
                <Box display="flex" flexDirection="column" px="2vw" pb="2vw">

                    <Box display="flex" alignItems="flex-start" flexDirection="column" width="400px">
                        {
                            CoinInfo.map((c, key: number) => (
                                <Box display="flex" alignItems="center" width="100%" mb="10px" p="20px" key={key} justifyContent='space-between'>
                                    <Box width="50%" display="flex" alignItems="center">
                                        <img src={c.url} width="30px" alt="image" />
                                        <Box ml="20px" color="white">{c.coin}</Box>
                                    </Box>
                                    <CustomButton className="bg_btn" style={{width: '100px', marginRight: '10px'}} text="MINT" onClick={() => handleMint(key)} />
                                    <CustomButton className="bg_btn" style={{width: '100px'}} onClick={() => handleCopy(key)} >
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
                            <CustomButton className="bg_btn" text="Approve All" onClick={handleClose} />
                        </Box>
                    </Box>
                </Box>
            </Dialog>
        </div>
    );
}