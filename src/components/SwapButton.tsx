import React from "react";
import styled from "@emotion/styled";
import { FaSync } from "react-icons/fa";

const StyledSwapButton = styled.button`
  border: 0;
  /* width: 60px; */
  height: 60px;
  border-radius: 60px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to right, #09aaf5, #05cfe9, #02f1de);

  > svg {
    transition: all 0.2s ease-in-out;
    transform: rotate(90deg);
    width: 20px;
    height: 20px;
  }

  &:hover > svg {
    transform: rotate(270deg);
  }
`;

export const SwapButton = (props: any) => {
  return (
    <StyledSwapButton type="button" className="swap_button" {...props}>
      <FaSync color="white" />
    </StyledSwapButton>
  );
};
