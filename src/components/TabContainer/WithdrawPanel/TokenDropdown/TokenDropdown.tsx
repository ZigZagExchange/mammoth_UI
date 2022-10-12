import { Fragment, useState, useEffect } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/solid';

const TokenDropdown = ({
  selectedToken,
  onSelectedToken,
  allTokenImage,
  tokenList
}: any) => {
  return (
    <div>
      <Listbox value={selectedToken} onChange={onSelectedToken}>
        <div className="relative mt-1">
          <Listbox.Button className="flex items-center justify-between gap-2 px-2.5 py-1 mt-2 rounded-md min-w-[230px] bg-foreground-200 ring-1 ring-offset-0 ring-foreground-500">
            <div className="flex items-center p-2 text-sm font-medium rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 ">
              {selectedToken?.logo ? (
                <img
                  src={selectedToken.logo}
                  alt={selectedToken.symbol}
                  className="w-7"
                />
              ) : (
                allTokenImage()
              )}
              <p className="ml-3 text-base ">{selectedToken?.symbol}</p>
            </div>
            <span className="">
              <ChevronDownIcon
                className="w-5 h-5 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute py-1 mt-1 z-10  overflow-auto text-base rounded-md shadow-lg bg-[#2B2E4A] max-h-60 ring-1 ring-black ring-offset-0 ring-foreground-500 ring-opacity-5 focus:outline-none sm:text-sm">
              {tokenList?.map((token: any, tokenIdx: number) => (
                <Listbox.Option
                  key={tokenIdx}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? 'bg-green-100 text-amber-900' : 'text-white'
                    }`
                  }
                  value={token}
                >
                  {({ selected }) => (
                    <>
                      <div className="flex items-center p-1 text-sm font-medium rounded-md focus:outline-none">
                        {token.logo ? (
                          <img
                            src={token.logo}
                            alt={token.symbol}
                            className="w-7"
                          />
                        ) : (
                          allTokenImage()
                        )}
                        <p className="ml-3 text-base ">{token.symbol}</p>
                      </div>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                          <CheckIcon className="w-5 h-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
};

export default TokenDropdown;
