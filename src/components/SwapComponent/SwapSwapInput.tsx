import React, { useCallback } from "react";
import styled from "@emotion/styled";
import SwapCurrencySelector from "./SwapCurrencySelector";

const SwapInputBox = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  background: #fff;
  border-radius: 24px;
  border: none;
  position: relative;
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  background: rgba(0, 0, 0, 0.3);
  box-shadow: 0px 0px 22px -5px black inset;
  color: white;

  input,
  input:focus {
    font-family: "Iceland", sans-serif;
    width: calc(100% - 148px);
    height: 70px;
    background: transparent;
    padding: 20px 20px 20px 7px;
    font-size: 28px;
    border: none;
    outline: none;
    text-align: right;
    -webkit-appearance: none;
    appearance: none;
  }

  .maxLink {
    position: absolute;
    color: #05cbea;
    top: -58px;
    right: 0;
    padding: 6px 12px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 8px;
    user-select: none;

    &:hover {
      background: rgba(0, 0, 0, 0.7);
    }
  }

  .currencySelector {
    width: 148px;
    margin-left: 15px;
  }
`;

interface Props {
  value?: any;
  onChange: (e:any, from: boolean)=>void;
  currencies?: string;
  balances?: any;
  className?: string;
  from: boolean;
}

const SwapSwapInput = ({
  value = {},
  onChange,
  currencies,
  balances = {},
  className,
  from
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

  const setMax = () => {
    if (maxBalance > 0) {
      onChange({ amount: maxBalance || "" }, from);
    }
  };

  return (
    <SwapInputBox>
      <div className="currencySelector">
        <SwapCurrencySelector
          currencies={currencies}
          balances={balances}
          onChange={setCurrency}
          value={value.currency}
        />
      </div>
      <input
        onChange={setAmount}
        value={value.amount}
        className={className}
        placeholder="0.00"
        type="text"
      />
      <a className="maxLink" href="#max" onClick={setMax}>
        Max
      </a>
    </SwapInputBox>
  );
};

export default SwapSwapInput;
