import React, { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { tokens } from "../../services/constants";
import _ from "lodash"

import SelectUnstyled, {
  SelectUnstyledProps,
  selectUnstyledClasses,
} from '@mui/base/SelectUnstyled';
import { PopperUnstyled } from '@mui/base';
import { StyledOption } from "../DepositComponent";
import { Box } from "@mui/material";

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
  const components: SelectUnstyledProps<number>['components'] = {
    Root: props.borderBox ? StyledBorderedButton : StyledButton,
    Listbox: StyledListbox(props.width),
    Popper: StyledPopper,
    ...props.components,
  };

  console.log(props)

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


  const handleTokenSelect = async (e: any) => {
    // e.preventDefault();
    const val = e;
    //await tokenApproval();
    changeIndex(parseInt(val));
    onChange(tokens[e].symbol);
  };

  return (
    <CustomSelect onChange={handleTokenSelect} value={tokenIndex} borderBox={borderBox} width={listWidth}>
      {tokens.map((c: any, index: number) => (
        <Box display="flex" justifyContent="space-between" alignItems="center" px="10px" >
          <StyledOption key={c.symbol} value={index} >
            <Box display="flex" alignItems={"center"}>
              <img
                loading="lazy"
                width="30"
                src={c.logo}
                srcSet={c.logo}
                alt={`coin`}
              />
              {c.symbol}
            </Box>
          </StyledOption>
          <Box>{Number(balances[index]).toFixed(4)}</Box>
        </Box>
      ))}
    </CustomSelect>
    
  );
};

export default SwapCurrencySelector;
