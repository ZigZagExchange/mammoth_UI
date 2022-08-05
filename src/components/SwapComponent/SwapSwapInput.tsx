import React, { useCallback, useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import SwapCurrencySelector from "./SwapCurrencySelector";
import { tokens } from "../../services/constants";
import _ from "lodash";
import { getTokenIndex } from "../../libs/utils";
import useMobile from "../../libs/useMobile";

const SwapInputBox = styled((props: any)=>(<div {...props} />))`
  display: flex;
  flex-direction: row;
  align-items: center;
  position: relative;
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  background: ${props => props.readOnly ? "none" : "rgba(255, 255, 255, 0.05)"};
  /* Background[light]/300 */
  border: ${props => props.readOnly ? "none" : "1px solid rgba(255, 255, 255, 0.08)"};
  border-radius: 8px;

  input,
  input:focus {
    width: calc(100% - 148px);
    height: 40px;
    background: transparent !important;
    padding: 20px 10px 20px 7px;
    font-size: ${props => props.mobile==="true" ? "16px" : "28px"};
    border: none;
    outline: none;
    text-align: right;
    -webkit-appearance: none;
    appearance: none;
    color: white;
    font-weight: 600;
    cursor: ${props => props.readOnly ? "default !important" : "text"};
  }

  .currencySelector {
    width: ${props => props.readOnly ? "148px" : "208px"};
    display: flex;
    align-items: center;
  }
`;

const MaxButton = styled.button`
  outline: none;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 4px;
  gap: 2px;
  width: 36px;
  height: 28px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  border: none;
  font-weight: 400;
  font-size: 10px;
  color: #2AABEE;
  margin-left: 10px;
  margin-right: 10px;
`

interface Props {
  value?: any;
  onChange: (e: any) => void;
  currencies?: string;
  balances?: string[];
  className?: string;
  readOnly?: boolean;
  borderBox?: boolean;
  listWidth?: number;
  isWithdraw?: boolean;
  showMax?: boolean;
}

const SwapSwapInput = ({
  value = {},
  onChange,
  currencies,
  balances = [],
  className,
  readOnly,
  borderBox,
  listWidth = 510,
  isWithdraw,
  showMax = true
}: Props) => {

  const ref = useRef<any>(null);
  const [width, SetWidth] = useState(0);
  const {isMobile, windowWidth} = useMobile();

  useEffect(()=>{
    if(!ref?.current) return;
    console.log("adsasfdasdf",ref?.current.offsetWidth)
    SetWidth(ref?.current.offsetWidth)
  },[windowWidth])

  // const setCurrency = useCallback(
  //   (symbol) => onChange({ symbol, amount: "" }),
  //   [onChange]
  // );
  // const setAmount = useCallback(
  //   (e) => onChange({ amount: e.target.value.replace(/[^0-9.]/g, "") }),
  //   [onChange]
  // );

  const setCurrency = (symbol: any) => onChange({ symbol, amount: "" });
  const setAmount = (e: any) => onChange({ amount: e.target.value.replace(/[^0-9.]/g, "") });

  const setMax = () => {
    if(isWithdraw) onChange(null);
    onChange({ amount: Math.round(Number(balances[getTokenIndex(value.symbol)]) * 10000) / 10000})
  }

  return (
    <div ref={ref}>
    <SwapInputBox readOnly={readOnly} mobile={isMobile ? "true" : "false"}>
      <div className="currencySelector">
        <SwapCurrencySelector
          currencies={currencies}
          balances={balances}
          onChange={setCurrency}
          value={value.symbol}
          borderBox={borderBox}
          listWidth={listWidth * (width / 510) - 15}
        />
        {(showMax) && <MaxButton onClick={setMax}>Max</MaxButton>}
      </div>
      <input
        onChange={setAmount}
        value={value.amount}
        className={className}
        placeholder="0.00"
        type="text"
        disabled={readOnly}
      />
    </SwapInputBox>
    </div>
  );
};

export default SwapSwapInput;
