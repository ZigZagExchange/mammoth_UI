import React from 'react';
import { toast } from 'react-toastify';
import { mintToken, mintAllTokens } from '../../../services/pool.service';

import { tokens } from '../../../services/constants';

import CustomButton from '../../CustomButton';
import { BsClipboardCheck } from 'react-icons/bs';

type props = {
  onEvent: () => void;
};

const MintPanel = ({ onEvent }: props) => {
  const [open, setOpen] = React.useState(false);
  const [isMintingAll, changeIsMintingAll] = React.useState(false);
  const [loadingMsg, changeLoadingMsg] = React.useState('Minting');
  const [txMessage, changeTxMsg] = React.useState('Complete');
  const [txComplete, changeTxComplete] = React.useState(false);
  const [failMsg, changeFailMsg] = React.useState('');
  const [isLoading, changeIsLoading] = React.useState([false, false, false]);

  React.useEffect(() => {
    if (!txComplete || !txMessage) return;
    openErrorWindow(txMessage, 1);
    changeTxMsg('');
  }, [txComplete]);

  React.useEffect(() => {
    if (
      (!isMintingAll && !isLoading[0] && !isLoading[1] && !isLoading[2]) ||
      !loadingMsg
    )
      return;
    openErrorWindow(loadingMsg, 3);
    changeLoadingMsg('');
  }, [loadingMsg]);

  React.useEffect(() => {
    if (!failMsg) return;
    openErrorWindow(failMsg, 2);
    changeFailMsg('');
  }, [failMsg]);

  const openErrorWindow = (value: string, flag: number) => {
    if (toast.isActive(flag)) return;
    if (flag === 3) {
      toast.info(value, {
        closeOnClick: false,
        autoClose: 15000,
        position: toast.POSITION.BOTTOM_RIGHT,
        toastId: flag
      });
    }
    if (flag === 2) {
      toast.error(value, {
        closeOnClick: false,
        autoClose: 15000,
        position: toast.POSITION.BOTTOM_RIGHT,
        toastId: flag
      });
    }
    if (flag === 1) {
      toast.success(value, {
        closeOnClick: false,
        autoClose: 15000,
        position: toast.POSITION.BOTTOM_RIGHT,
        toastId: flag
      });
    }
  };

  const handleMint = async (tokenIndex: number) => {
    const loadingStatus = isLoading;
    try {
      changeLoadingMsg(`Minting ${tokens[tokenIndex].symbol} !`);
      loadingStatus[tokenIndex] = true;
      changeIsLoading(loadingStatus);
      const amount = await mintToken(tokenIndex);
      changeTxMsg(`${amount} ${tokens[tokenIndex].symbol} minted`);
      changeTxComplete(true);
    } catch (e) {
      changeFailMsg('Minting Failed!');
    } finally {
      onEvent();
      loadingStatus[tokenIndex] = false;
      changeIsLoading(loadingStatus);
    }
  };

  const handleMintAll = async () => {
    try {
      changeIsMintingAll(true);
      changeLoadingMsg(`Minting all tokens!`);
      await mintAllTokens();
      changeTxMsg(`All tokens minted`);
      changeTxComplete(true);
    } catch (e) {
      changeFailMsg('Minting Failed!');
    } finally {
      onEvent();
      changeIsMintingAll(false);
    }
  };

  const handleCopy = (tokenIndex: number) => {
    navigator.clipboard.writeText(tokens[tokenIndex].address);
  };
  return (
    <div className="flex flex-col items-center justify-center py-5 ">
      <p className="text-xl font-medium text-center">L2 Goerli ETH</p>
      <p className="text-sm font-normal">( to pay transaction fees )</p>
      <div className="flex items-center justify-between w-2/3 mt-8">
        <div className="flex items-center justify-between gap-3">
          <img
            src={'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png'}
            width="30px"
            alt="image"
          />
          <p className="font-medium tracking-wider">ETH</p>
        </div>
        <CustomButton
          className="px-4 py-1.5 text-sm font-semibold uppercase rounded-md"
          onClick={() => {
            window.open('https://faucet.goerli.starknet.io/', '_blank');
          }}
        >
          Faucet
        </CustomButton>
      </div>
      <div className="w-2/3 mt-8 text-left">
        <p className="text-lg font-medium">Pool tokens</p>
        <div className="mt-5 space-y-6">
          {tokens.map((token: any, index: number) => {
            return (
              <div key={index} className="flex justify-between">
                <div className="flex items-center gap-3">
                  <img src={token.logo} width="30px" alt="image" />
                  <p>{token.symbol}</p>
                </div>
                <div className="flex items-center gap-3">
                  <CustomButton
                    className="px-4 py-1 text-sm font-semibold uppercase rounded-md"
                    onClick={() => handleMint(index)}
                  >
                    Mint
                  </CustomButton>
                  <CustomButton
                    className="px-4 py-1.5 text-sm font-semibold uppercase rounded-md"
                    onClick={() => handleCopy(index)}
                  >
                    <BsClipboardCheck className="w-4 h-4" />
                  </CustomButton>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-7">
          <CustomButton
            className="w-full px-4 py-1.5 font-semibold uppercase rounded-md"
            onClick={handleMintAll}
          >
            Mint All
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default MintPanel;
