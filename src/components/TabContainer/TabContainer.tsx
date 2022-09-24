/* eslint-disable jsx-a11y/anchor-has-content */
import React from 'react';
import classNames from 'classnames';
import { useState } from 'react';
import { Tab } from '@headlessui/react';
import MintPanel from './MintPanel';
import SwapPanel from './SwapPanel';

type props = {
  className?: string;
  onEvent: () => void;
  userBalances: any;
};

const categories = ['Swap', 'Deposit', 'Withdraw', 'Mint'];

const TabContainer = ({ className, userBalances, onEvent }: props) => {
  return (
    <div
      className={classNames(
        'border border-foreground-500 h-fit rounded-lg py-8 px-6 text-md shadow-md bg-background-700',
        className
      )}
    >
      <Tab.Group>
        <Tab.List className="flex p-1 space-x-1 bg-black border rounded-xl border-foreground-500">
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
            <SwapPanel userBalances={userBalances} />
          </Tab.Panel>
          <Tab.Panel
            className={classNames(
              'rounded-xl bg-white p-3',
              'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
            )}
          >
            <ul>12312</ul>
          </Tab.Panel>
          <Tab.Panel
            className={classNames(
              'rounded-xl bg-white p-3',
              'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
            )}
          >
            <ul>23123sdfsdf</ul>
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
