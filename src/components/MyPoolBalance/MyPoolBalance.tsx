import React from 'react';
import classNames from 'classnames';

const MyPoolBalance = ({ className, poolbalances }: any) => {
  return (
    <div
      className={classNames(
        'border border-foreground-500 h-fit rounded-lg py-8 px-6 text-md shadow-md bg-background-700',
        className
      )}
    >
      <p className="font-semibold uppercase">My pool balance</p>
      <div className="space-y-4 mt-7">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">ETH</p>
            <p className="text-[12px] text-foreground-700">ETH:</p>
          </div>
          <div className="text-right">
            <p className="font-medium">
              {poolbalances[0] === '--'
                ? poolbalances[0]
                : parseFloat(poolbalances[0]).toFixed(4)}
            </p>
            <p className="text-[12px] text-foreground-700">$00.00</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">BTC</p>
            <p className="text-[12px] text-foreground-700">ETH:</p>
          </div>
          <div className="text-right">
            <p className="font-medium">
              {poolbalances[1] === '--'
                ? poolbalances[1]
                : parseFloat(poolbalances[1]).toFixed(4)}
            </p>
            <p className="text-[12px] text-foreground-700">$00.00</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">USDC</p>
            <p className="text-[12px] text-foreground-700">USDC:</p>
          </div>
          <div className="text-right">
            <p className="font-medium">
              {poolbalances[2] === '--'
                ? poolbalances[2]
                : parseFloat(poolbalances[2]).toFixed(4)}
            </p>
            <p className="text-[12px] text-foreground-700">$00.00</p>
          </div>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-foreground-500">
          <div>
            <p className="font-medium uppercase">Total</p>
          </div>
          <div className="text-right">
            <p className="font-medium">$00.00</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPoolBalance;
