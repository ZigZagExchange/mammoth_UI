import { BigNumber } from "ethers";

export const toFloatingPoint = (input: string) => {
  let reversedAmount = input.toString().split("").reverse().join("");

  if (input.length === 3) {
    reversedAmount = reversedAmount + "0";
  } else if (input.length === 2) {
    reversedAmount = reversedAmount + "00";
  } else if (input.length === 1) {
    reversedAmount = reversedAmount + "000";
  }

  const amountToFpReversed =
    reversedAmount.slice(0, 4) + "." + reversedAmount.slice(4);

  return amountToFpReversed.split("").reverse().join("");
};

export const padDecimal = (input: string) => {
  if (input.length === 1) {
    input = input + "000";
  } else if (input.length === 2) {
    input = input + "00";
  } else if (input.length === 3) {
    input = input + "0";
  }
  return input;
};

export const decimalToBN = (input: string) => {
  let bnDecmial = BigNumber.from(input || 0);
  if (input.length === 1) {
    bnDecmial = bnDecmial.mul(1000);
  } else if (input.length === 2) {
    bnDecmial = bnDecmial.mul(100);
  } else if (input.length === 3) {
    bnDecmial = bnDecmial.mul(10);
  }

  return bnDecmial;
};
