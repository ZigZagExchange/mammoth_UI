import React, { useCallback } from "react";
import styled from "@emotion/styled";
import SwapCurrencySelector from "./SwapCurrencySelector";

const SwapInputBox = styled((props: any) => (<div {...props} />))`
  display: flex;
  flex-direction: row;
  align-items: center;
  position: relative;
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  background: ${props => props.readOnly === "true" ? "none" : "rgba(255, 255, 255, 0.05)"};
  /* Background[light]/300 */
  border: ${props => props.readOnly === "true" ? "none" : "1px solid rgba(255, 255, 255, 0.08)"};
  border-radius: 8px;

  input,
  input:focus {
    width: calc(100% - 148px);
    height: 40px;
    background: transparent !important;
    padding: 20px 10px 20px 7px;
    font-size: 28px;
    border: none;
    outline: none;
    text-align: right;
    -webkit-appearance: none;
    appearance: none;
    color: white;
    font-weight: 600;
    cursor: ${props => props.readOnly === "true" ? "default !important" : "text"};
  }

  .currencySelector {
    width: ${props => props.readOnly === "true" ? "148px" : "208px"};
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
`

interface Props {
  value?: any;
  onChange: (e: any, from: boolean) => void;
  currencies?: string;
  balances?: any;
  className?: string;
  from: boolean;
  readOnly?: boolean;
}

const SwapSwapInput = ({
  value = {},
  onChange,
  currencies,
  balances = {},
  className,
  from,
  readOnly
}: Props) => {
  const setCurrency = useCallback(
    (currency) => onChange({ currency, amount: "" }, from),
    [onChange]
  );
  const setAmount = useCallback(
    (e) => onChange({ amount: e.target.value.replace(/[^0-9.]/g, "") }, from),
    [onChange]
  );

  let maxBalance = parseFloat(
    (balances[value.currency] && balances[value.currency].valueReadable) || 0
  );

  return (
    <SwapInputBox readOnly={readOnly ? "true" : "false"}>
      <div className="currencySelector">
        <SwapCurrencySelector
          currencies={currencies}
          balances={balances}
          onChange={setCurrency}
          value={value.currency}
        />
        {!readOnly && <MaxButton>Max</MaxButton>}
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
  );
};

export default SwapSwapInput;
