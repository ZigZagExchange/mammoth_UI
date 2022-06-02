import React from "react";
import styled from "@emotion/styled";
// import { FaSync } from "react-icons/fa";

const StyledSwapButton = styled.button`
  border: 0;
  padding: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to right, #09aaf5, #05cfe9, #02f1de);

  > svg {
    transition: all 0.2s ease-in-out;
    width: 15px;
    height: 15px;
  }

  &:hover > svg {
    transform: rotate(180deg);
  }
`;

export const SwapButton = (props: any) => {
  return (
    <StyledSwapButton type="button" className="swap_button" {...props}>
      <svg width="11" height="12" viewBox="0 0 11 12" fill="white" xmlns="http://www.w3.org/2000/svg">
        <path d="M5.59961 9.2L5.03561 8.636L3.19961 10.468L3.19961 4H2.39961L2.39961 10.468L0.56361 8.632L-0.000390053 9.2L2.79961 12L5.59961 9.2Z" fill="white"/>
        <path d="M4.66699 3.4665L5.23099 4.0305L7.06699 2.1985L7.06699 8.6665L7.86699 8.6665L7.86699 2.1985L9.70299 4.0345L10.267 3.4665L7.46699 0.666504L4.66699 3.4665Z" fill="white"/>
      </svg>
    </StyledSwapButton>
  );
};
