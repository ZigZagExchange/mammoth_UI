import React, { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import { Avatar, AvatarGroup, Box, DialogTitle, Slider } from '@mui/material';
import MuiInput from '@mui/material/Input';
import Collapse from '@mui/material/Collapse';
import SettingsIcon from '@mui/icons-material/Settings';
import { tokens } from '../services/constants';
import _ from 'lodash';
import styled from '@emotion/styled';
import SelectUnstyled, {
  SelectUnstyledProps,
  selectUnstyledClasses
} from '@mui/base/SelectUnstyled';
import { PopperUnstyled } from '@mui/base';
import { StyledOption } from './DepositComponent';
import {
  getWithdrawERC20Amount,
  withdrawPool,
  getLiquidityBalances
} from '../services/pool.service';
import { Button as CustomButton } from './Button/Button';
import DepositWithdrawInput from './SwapComponent/DepositWithdrawInput';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { formatPrice } from '../libs/utils';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ReactTooltip from 'react-tooltip';

interface WithdrawDialogProps {
  onEvent: () => void;
  open?: boolean;
  selectedValue?: string;
  onClose?: (value: string) => void;
}

const Input = styled(MuiInput)`
  width: 42px;
`;

export default function WithdrawComponent(props: WithdrawDialogProps) {
  const [open, setOpen] = React.useState(false);

  const [withdrawAmount, changeWithdrawAmount] = useState(0);
  const [ERC20Amount, changeERC20Amount] = useState({
    0: '0'
  } as any);
  const [tokenIndex, changeIndex] = useState(0);
  const [isLoading, changeIsLoading] = useState(false);
  const [txComplete, changeTxComplete] = useState(false);
  const [failMsg, changeFailMsg] = useState('');
  const [withdrawDetails, _setWithdrawDetails] = useState(() => ({
    amount: 0,
    symbol: tokens[0].symbol
  }));
  const [liquidityBalance, changeLiquidityBalance] = useState('0');

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = (value: string) => {
    setOpen(false);
  };

  React.useEffect(() => {
    (async () => {
      const val = await getLiquidityBalances();
      changeLiquidityBalance(val);
    })();
  });

  React.useEffect(() => {
    if (!txComplete) return;
    openErrorWindow('Withdraw Completed', 1);
  }, [txComplete]);

  React.useEffect(() => {
    if (failMsg.length) openErrorWindow(failMsg, 2);
  }, [failMsg]);

  React.useEffect(() => {
    if (!isLoading) return;
    openErrorWindow('Withdrawing...', 3);
  }, [isLoading]);

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

  const handleWithdraw = async () => {
    if (!withdrawAmount) return;
    changeIsLoading(true);
    let success = true;
    try {
      await withdrawPool(withdrawAmount, tokenIndex);
    } catch (e) {
      success = false;
      changeFailMsg('Withdraw failed');
    } finally {
      const val = await getLiquidityBalances();
      changeLiquidityBalance(val);
      let val2: any = withdrawDetails.amount as any;
      if (typeof val2 === 'string') {
        val2 = parseFloat(val.replace(',', '.'));
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

  const setWithdrawDetails = async (values: any) => {
    const details = {
      ...withdrawDetails,
      ...values
    };
    _setWithdrawDetails(details);

    let val = details.amount;

    if (typeof val === 'string') {
      val = parseFloat(val.replace(',', '.'));
    }
    val = Number.isNaN(val) ? 0 : val;
    const index = _.findIndex(tokens, { symbol: details.symbol });
    changeIndex(index);
    changeWithdrawAmount(val);
    await predictWithdrawResult(val);
  };

  const AllTokens = () => {
    return (
      <Box>
        <Box display="flex" alignItems="center">
          <AvatarGroup>
            {tokens.map((c, i) => (
              <Avatar
                style={{
                  width: '25px',
                  height: '25px',
                  zIndex: i + 100
                }}
                src={c.logo}
                srcSet={c.logo}
                alt="coins"
                key={c.symbol}
              />
            ))}
          </AvatarGroup>
          <Box ml="10px">AllTokens</Box>
        </Box>
      </Box>
    );
  };

  const SelectedToken = (index: any, data: any) => {
    return (
      <Box display="flex" alignItems="center">
        <img
          style={{
            width: '25px',
            height: '25px',
            zIndex: index + 100
          }}
          src={data.logo}
          alt="coin"
        />
        <Box ml="10px">{data.symbol}</Box>
      </Box>
    );
  };

  const [coin, setCoin] = useState(AllTokens());
  const [noShow, setNoShow] = useState('none');
  const [coinStage, setCoinStage] = useState(0);
  const [collapse, setCollapse] = useState(false);
  const [value, setValue] = useState<number | string | Array<number | string>>(
    0
  );

  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    setValue(newValue);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value === '' ? '' : Number(event.target.value));
  };

  const handleBlur = () => {
    if (value < 0) {
      setValue(0);
    } else if (value > 100) {
      setValue(100);
    }
  };

  const inputElements = (coinStage: any) => {
    if (coinStage > 0) {
      return (
        <DepositWithdrawInput
          // currencies={currencies}
          value={withdrawDetails}
          onChange={setWithdrawDetails}
          borderBox
          listWidth={505}
          imageSource={tokens[coinStage - 1].logo}
          imageSymbol={tokens[coinStage - 1].symbol}
          imageLogo={tokens[coinStage - 1].logo}
        />
      );
    } else {
      return (
        <div>
          {tokens.map((coin, index) => (
            <Box
              key={coin.symbol}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              p="10px"
            >
              <Box display="flex" alignItems="center">
                <img src={coin.logo} alt="" height="30" width="30" />
                <Box ml="10px">{coin.symbol}</Box>
              </Box>
              <Box>
                <Box fontSize="18px">00.00</Box>
                <Box fontSize="12px" textAlign="right">
                  $00.00
                </Box>
              </Box>
            </Box>
          ))}
        </div>
      );
    }
  };

  const SliderComponent = () => {
    if (coinStage === 0) {
      return (
        <div style={{ marginTop: '10px' }}>
          <Box display="flex" justifyContent="space-between">
            <Box>Proportional Withdraw</Box>
            <Box display="flex">
              <Input
                value={value}
                size="small"
                style={{
                  color: 'white'
                }}
                onChange={handleInputChange}
                onBlur={handleBlur}
                inputProps={{
                  step: 1,
                  min: 0,
                  max: 100,
                  type: 'number',
                  'aria-labelledby': 'input-slider'
                }}
              />
              <Box>%</Box>
            </Box>
          </Box>

          <Slider
            value={typeof value === 'number' ? value : 0}
            onChange={handleSliderChange}
            aria-labelledby="input-slider"
          />
        </div>
      );
    } else {
      return <div></div>;
    }
  };

  return (
    <Box>
      <Box
        display="flex"
        flexDirection="column"
        px="40px"
        pb="50px"
        style={{ position: 'relative' }}

        // bgcolor={'#232735'}
      >
        <SettingsIcon
          cursor="pointer"
          style={{ position: 'absolute', top: '5px', right: '40px' }}
        />
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
          <p data-tip="When you add liquidity, you will receive pool tokens representing your position. These tokens automatically earn fees proportional to your share of the pool, and can be redeemed at any time.">
            Tip:
          </p>
          <ReactTooltip />
        </Box>
        <Box mb="40px">
          <ul>
            <li>
              <Box style={{ position: 'relative' }}>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    onClick={() => {
                      if (noShow === 'none') {
                        setCollapse(prev => !prev);
                        setNoShow('block');
                      }

                      if (noShow === 'block') {
                        setCollapse(prev => !prev);
                        setNoShow('none');
                      }
                    }}
                    style={{
                      padding: '10px',
                      width: '200px',
                      cursor: 'pointer',
                      border: '1px solid #e5e7eb25',
                      borderRadius: '5px'
                    }}
                  >
                    {coin}
                    <KeyboardArrowDownIcon />
                  </Box>

                  <Box>
                    <Box>00.00</Box>
                  </Box>
                </Box>
                <Collapse
                  in={collapse}
                  style={{
                    position: 'absolute',
                    opacity: '1',
                    zIndex: '100',
                    backgroundColor: '#191a33'
                  }}
                >
                  <ul
                    style={{
                      // display: noShow,
                      width: '200px',
                      border: '1px solid #e5e7eb25',
                      borderRadius: '10px'
                    }}
                  >
                    <li style={{ padding: '10px', cursor: 'pointer' }}>
                      <Box
                        display="flex"
                        alignItems="center"
                        onClick={() => {
                          setCoin(AllTokens());
                          setCollapse(prev => !prev);
                          setNoShow('none');
                          setCoinStage(0);
                        }}
                      >
                        <AvatarGroup>
                          {tokens.map((c, i) => (
                            <Avatar
                              style={{
                                width: '25px',
                                height: '25px',
                                zIndex: i + 100
                              }}
                              src={c.logo}
                              srcSet={c.logo}
                              alt="coins"
                              key={c.symbol}
                            />
                          ))}
                        </AvatarGroup>
                        <Box ml="10px">AllTokens</Box>
                      </Box>
                    </li>

                    {tokens.map((c, i) => (
                      <li
                        key={c.symbol}
                        style={{ padding: '10px', cursor: 'pointer' }}
                      >
                        <Box
                          display="flex"
                          alignItems="center"
                          onClick={() => {
                            setCoin(SelectedToken(i, c));
                            setCollapse(prev => !prev);
                            setNoShow('none');
                            setCoinStage(i + 1);
                          }}
                        >
                          <img
                            style={{
                              width: '25px',
                              height: '25px',
                              zIndex: i + 100
                            }}
                            src={c.logo}
                            alt=""
                          />
                          <Box ml="10px">{c.symbol}</Box>
                        </Box>
                      </li>
                    ))}
                  </ul>
                </Collapse>
              </Box>
            </li>
          </ul>

          {SliderComponent()}
        </Box>

        {inputElements(coinStage)}

        {/* <Box
          textAlign={'right'}
          mt="20px"
          mb="4px"
          color="rgb(256,256,256,0.5)"
          fontSize="14px"
        >
          Balance: {formatPrice(liquidityBalance)} LP tokens
        </Box>
        <Box
          textAlign={'right'}
          mt="4px"
          mb="42px"
          color="rgb(256,256,256,0.5)"
          fontSize="14px"
        >
          Estimated recived: {formatPrice(ERC20Amount[withdrawAmount])} LP
          tokens
        </Box> */}
        <Box display="flex" width="100%">
          <Box color="#09aaf5" width="100%" height="100%" mt="20px">
            <CustomButton
              className="bg_btn_deposit"
              text="Preview"
              // onClick={() => handleWithdraw()}
              onClick={() => handleClickOpen()}
            />
          </Box>
        </Box>
      </Box>
      <Dialog onClose={handleClose} open={open}>
        <Box
          style={{
            backgroundColor: '#191a33',
            color: '#ffffff',
            width: '400px',
            border: '1px solid #ffffff25'
          }}
        >
          <Box p="10px">
            <Box style={{ color: '#fff' }} fontSize="22px" mb="40px">
              Withdraw Preview
            </Box>

            <Box>
              {tokens.map((coin, index) => (
                <Box
                  key={coin.symbol}
                  display="flex"
                  // justifyContent="space-between"
                  alignItems="center"
                  p="10px"
                >
                  <Box display="flex" alignItems="center">
                    <img src={coin.logo} alt="" height="30" width="30" />
                  </Box>
                  <Box>
                    <Box ml="10px">0 {coin.symbol}</Box>
                    <Box>
                      <Box fontSize="12px" ml="10px" color="#ffffff50">
                        00.00 (0%)
                      </Box>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
            <Box>
              <Box p="10px" mt="40px">
                Summery
              </Box>
              <Box p="10px">
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box>Total</Box>
                  <Box>$00.00</Box>
                </Box>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box>Price Impact</Box>
                  <Box>0%</Box>
                </Box>
                <Box></Box>
              </Box>
            </Box>
            <Box display="flex" width="100%">
              <Box color="#09aaf5" width="100%" height="100%" mr="1vw">
                <CustomButton
                  className="bg_btn_deposit"
                  text="Withdraw"
                  onClick={() => handleWithdraw()}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
}
