import React from "react";
import styled from "@xstyled/styled-components";

const Text = styled.div`
  display: grid;
  grid-auto-flow: column;
  gap: 10px;
  text-align: center;
  word-break: break-word;
  white-space: pre-wrap;
`;

const ToggleButtonWrapper = styled.ul`
  display: flex;
  flex-direction: row;
  align-items: center;
  background: #ddf1f7;
  border: 1px solid #292D3F14;
  border-radius: 12px;
  width: fit-content;
  padding: 4px;
`;

const ToggleItem = styled.li`
  display: block;
  width: ${({ width }) => width}px;
  border-radius: 8px;
  padding-top: ${({ size }) => (size === "sm" ? "4px" : "8px")};
  padding-bottom: ${({ size }) => (size === "sm" ? "4px" : "8px")};
  // padding-left: ${({ type }) => (type === "option" ? "16px" : "40.5px")};
  // padding-right: ${({ type }) => (type === "option" ? "16px" : "40.5px")};
  box-shadow: ${({ show }) =>
    show ? "0px 3px 3px -1px #00000014, 0px 1px 1px 0px #00000014" : "unset"};
  text-align: center;
  text-transform: uppercase;
  user-select: none;
  cursor: pointer;
  background: ${({ show }) =>
    show
      ? `linear-gradient(93.46deg, #2AABEE 16.94%, #0CCFCF 97.24%)`
      : "transparent"};
  opacity: 1;
  div {
    transition: color 0.25s;
  }
  &:hover div {
    color: ${({ show }) =>
      !show
        ? `#2AABEE !important`
        : "#ddf1f7"};
  }
  &:hover {
    opacity: 0.7;
  }
`;

const ToggleButton = ({ ...props }) => {
  const {
    type,
    leftLabel,
    size,
    width,
    rightLabel,
    leftSelected = true,
    toggleClick = () => {},
  } = props;

  return (
    <ToggleButtonWrapper {...props}>
      <ToggleItem
        onClick={() => toggleClick(1)}
        show={leftSelected}
        type={type}
        size={size}
        width={width}
        leftLabel={leftLabel}
      >
        <Text
          font="primaryBoldDisplay"
          color={
            leftSelected
              ? "backgroundMediumEmphasis"
              : "foregroundHighEmphasis"
          }
          textAlign="center"
        >
          {leftLabel}
        </Text>
      </ToggleItem>
      <ToggleItem
        onClick={() => toggleClick(2)}
        show={!leftSelected}
        type={type}
        size={size}
        width={width}
        rightLabel={rightLabel}
      >
        <Text
          font="primaryBoldDisplay"
          color="foregroundHighEmphasis"
          textAlign="center"
        >
          {rightLabel}
        </Text>
      </ToggleItem>
    </ToggleButtonWrapper>
  );
};

export default ToggleButton;