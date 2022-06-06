import React, { useEffect, useState } from "react";
// import { useSelector } from "react-redux";
// import { networkSelector } from "lib/store/features/api/apiSlice";
// import { userSelector } from "lib/store/features/auth/authSlice";
import styled from "@emotion/styled";
import { FiChevronDown } from "react-icons/fi";
// import { useCoinEstimator, Modal } from "components";
import { formatUSD } from "../../libs/utils";
// import api from "lib/api";
import { tokens } from "../../services/constants";
import _ from "lodash"

import SelectUnstyled, {
  SelectUnstyledProps,
  selectUnstyledClasses,
} from '@mui/base/SelectUnstyled';
import { PopperUnstyled } from '@mui/base';
import { StyledOption } from "../DepositComponent";

const blue = {
  100: '#DAECFF',
  200: '#99CCF3',
  400: '#3399FF',
  500: '#007FFF',
  600: '#0072E5',
  900: '#003A75',
};

const grey = {
  100: '#E7EBF0',
  200: '#E0E3E7',
  300: '#CDD2D7',
  400: '#B2BAC2',
  500: '#A0AAB4',
  600: '#6F7E8C',
  700: '#3E5060',
  800: '#2D3843',
  900: '#1A2027',
};

const StyledButton = styled('button')(
  ({ theme }) => `
    font-family: IBM Plex Sans, sans-serif;
    font-size: 0.875rem;
    box-sizing: border-box;
    height: 40px;
    min-width: 130px;
    background: transparent;
    border: none;
    border-radius: 5px;
    margin: 0.5em;
    padding: 10px;
    text-align: left;
    line-height: 1.5;
    color: white;
    display: flex;
    align-items: center;
  
    &:hover {
      background: transparent;
    }
  
    &.${selectUnstyledClasses.focusVisible} {
      outline: 3px solid '#232735';
    }
  
    &.${selectUnstyledClasses.expanded} {
      &::after {
        content: '▴';
        margin-left: 10px;
      }
    }
  
    &::after {
      content: '▾';
      float: right;
      margin-left: 10px;
    }
  
    & img {
      margin-right: 10px;
    }
    `,
);

const StyledBorderedButton = styled('button')(
  ({ theme }) => `
    font-family: IBM Plex Sans, sans-serif;
    font-size: 0.875rem;
    box-sizing: border-box;
    height: 40px;
    min-width: 130px;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 5px;
    margin: 0.5em;
    padding: 10px;
    text-align: left;
    line-height: 1.5;
    color: white;
    display: flex;
    align-items: center;
  
    &:hover {
      background: transparent;
    }
  
    &.${selectUnstyledClasses.focusVisible} {
      outline: 3px solid '#232735';
    }
  
    &.${selectUnstyledClasses.expanded} {
      &::after {
        content: '▴';
        margin-left: 10px;
      }
    }
  
    &::after {
      content: '▾';
      float: right;
      margin-left: 10px;
    }
  
    & img {
      margin-right: 10px;
    }
    `,
);

const StyledListbox = (width?: string) => styled('ul')(
  ({ theme }) => `
    font-family: IBM Plex Sans, sans-serif;
    font-size: 0.875rem;
    box-sizing: border-box;
    
    padding: 1px;
    margin: 0px 0;
    min-width: ${width ? width : "485px"};
    max-height: 485px;
    background: #25263d;
    border-radius: 5px;
    color: white;
    overflow: auto;
    outline: 0px;
    `,
);

const StyledPopper = styled(PopperUnstyled)`
    z-index: 1;
  `;

export const CustomSelect = React.forwardRef(function CustomSelect(
  props: SelectUnstyledProps<number> & {borderBox?: boolean, width?: string},
  ref: any,
) {
  console.log("listWidth==============", props.width)
  const components: SelectUnstyledProps<number>['components'] = {
    Root: props.borderBox ? StyledBorderedButton : StyledButton,
    Listbox: StyledListbox(props.width),
    Popper: StyledPopper,
    ...props.components,
  };

  return <SelectUnstyled {...props} ref={ref} components={components} />;
});

interface Props{
  onChange: (e:any)=>void;
  currencies: any;
  balances: string[];
  value: string;
  borderBox?: boolean;
  listWidth?: string;
}

const SwapCurrencySelector = ({
  onChange,
  currencies,
  balances = [],
  value,
  borderBox,
  listWidth,
}: Props) => {
  const [showingOptions, setShowingOptions] = useState(false);
  // const network = useSelector(networkSelector);
  // const user = useSelector(userSelector);
  // const coinEstimator = useCoinEstimator();

  const [tokenIndex, changeIndex] = useState(0);

  const hideOptions = (e: any) => {
    if (e) e.preventDefault();
    setShowingOptions(false);
  };

  useEffect(()=>{
    const index = _.findIndex(tokens, {symbol: value});
    changeIndex(index);
  },[value])

  useEffect(() => {
    if (showingOptions) {
      window.addEventListener("click", hideOptions, false);
    }

    return () => {
      window.removeEventListener("click", hideOptions);
    };
  }, [showingOptions]);

  if (!value) {
    return null;
  }

  // const symbol = api.getCurrencyInfo(value);
  const symbol = {};
  // const image = getCurrencyLogo(value);

  const handleTokenSelect = async (e: any) => {
    // e.preventDefault();
    console.log("a=================",e)
    const val = e;
    //await tokenApproval();
    changeIndex(parseInt(val));
    onChange(tokens[e].symbol);
  };

  return (
    <CustomSelect onChange={handleTokenSelect} value={tokenIndex} borderBox={borderBox} width={listWidth}>
      {tokens.map((c: any, index: number) => (
        <StyledOption key={c.symbol} value={index}>
          <img
            loading="lazy"
            width="30"
            src={c.logo}
            srcSet={c.logo}
            alt={`coin`}
          />
          {c.symbol}
        </StyledOption>
      ))}
    </CustomSelect>
    
  );
};

export default SwapCurrencySelector;
