/* eslint-disable jsx-a11y/anchor-has-content */
import React from 'react';
import classNames from 'classnames';
import { useState } from 'react';
import { Tab } from '@headlessui/react';
import MintPanel from './MintPanel';
import SwapPanel from './SwapPanel';
import DepositPanel from './DepositPanel';
import WithdrawPanel from './WithdrawPanel';

type props = {
  className?: string;
  userBalances: any;
  fromDetails: any;
  setSwapDetailsFrom: any;
  toDetails: any;
  setSwapDetailsTo: any;
  switchTransferType: any;
  rate: any;
  isTokenApproved: any;
  isWalletConnected: any;
  isLoading: boolean;
  handleApprove: any;
  handleSubmit: any;
  connectWallet: any;
  tokenAllowances: any;
  onEvent: () => void;
};

const categories = ['Swap', 'Deposit', 'Withdraw', 'Mint'];

const TabContainer = ({
  className,
  userBalances,
  setSwapDetailsFrom,
  fromDetails,
  setSwapDetailsTo,
  toDetails,
  switchTransferType,
  rate,
  isTokenApproved,
  isWalletConnected,
  isLoading,
  handleApprove,
  handleSubmit,
  connectWallet,
  tokenAllowances,
  onEvent
}: props) => {
  return (
    <div
      className={classNames(
        'border border-foreground-500 h-fit rounded-lg py-8 px-6 text-md shadow-md bg-background-700 mb-8',
        className
      )}
    >
      <Tab.Group>
        <Tab.List className="p-1 space-x-1 bg-black border md:flex rounded-xl border-foreground-500">
          {categories.map(category => (
            <Tab
              key={category}
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-2.5 px-12 text-sm font-medium leading-5 uppercase',
                  selected
                    ? 'bg-success-900 shadow text-black'
                    : 'text-blue-100 hover:bg-white-900 hover:text-white hover:bg-background-700'
                )
              }
            >
              {category}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-2">
          <Tab.Panel className={classNames('rounded-xl  p-3')}>
            <SwapPanel
              userBalances={userBalances}
              setSwapDetailsFrom={setSwapDetailsFrom}
              fromDetails={fromDetails}
              setSwapDetailsTo={setSwapDetailsTo}
              toDetails={toDetails}
              switchTransferType={switchTransferType}
              rate={rate}
              isTokenApproved={isTokenApproved}
              isWalletConnected={isWalletConnected}
              isLoading={isLoading}
              handleApprove={handleApprove}
              handleSubmit={handleSubmit}
              connectWallet={connectWallet}
            />
          </Tab.Panel>
          <Tab.Panel className={classNames('rounded-xl  p-3')}>
            <DepositPanel
              balance={userBalances}
              allowance={tokenAllowances}
              onEvent={onEvent}
              isWalletConnected={isWalletConnected}
            />
          </Tab.Panel>
          <Tab.Panel className={classNames('rounded-xl  p-3')}>
            <WithdrawPanel
              onEvent={onEvent}
              isWalletConnected={isWalletConnected}
              balance={userBalances}
            />
          </Tab.Panel>
          <Tab.Panel className={classNames('rounded-xl p-3')}>
            <MintPanel onEvent={onEvent} />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default TabContainer;
