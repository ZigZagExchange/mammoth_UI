import React from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import { tokens } from '../../services/constants';
import { getTokenIndex, formatPrice } from '../../libs/utils';

type props = {
  className: string;
  poolbalances: any;
  liquidityBalance: any;
};

const BalanceReportContainer = ({
  className,
  poolbalances,
  liquidityBalance
}: props) => {
  return (
    <div
      className={classNames(
        'border border-foreground-500 h-fit rounded-lg py-8 px-6 text-md shadow-md bg-background-700',
        className
      )}
    >
      <div>
        <p className="font-semibold text-center uppercase">
          Total Token amount
        </p>
        <p className="py-2 text-2xl font-semibold text-center">
          {formatPrice(liquidityBalance)}
        </p>
      </div>
      <div className="mt-5">
        <p className="font-semibold text-center uppercase">
          Detailed balance report
        </p>
        <div className="mt-4 space-y-2">
          {_.map(poolbalances, (each: any, index: number) => {
            return (
              <div key={index} className="flex justify-between">
                <p className="text-base font-normal">{tokens[index].name} :</p>
                <p className="text-base font-semibold">
                  {each === '--' ? each : parseFloat(each).toFixed(4)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BalanceReportContainer;
