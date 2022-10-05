import React from 'react';
import classNames from 'classnames';

const PoolTokenBalance = ({ className, userBalances }: any) => {
  return (
    <div
      className={classNames(
        'border border-foreground-500 h-fit rounded-lg py-8 px-6 text-md shadow-md bg-background-700',
        className
      )}
    >
      <p className="font-semibold uppercase">Pool tokens in my wallet</p>
      <div className="space-y-4 mt-7">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">ETH</p>
            <p className="text-[12px] text-foreground-700">ETH:</p>
          </div>
          <div className="text-right">
            <p className="font-medium">
              {Number(userBalances[0])
                ? Number(userBalances[0]).toFixed(4)
                : userBalances[0]}
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
              {Number(userBalances[1])
                ? Number(userBalances[1]).toFixed(4)
                : userBalances[1]}
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
              {Number(userBalances[2])
                ? Number(userBalances[2]).toFixed(4)
                : userBalances[2]}
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

export default PoolTokenBalance;
