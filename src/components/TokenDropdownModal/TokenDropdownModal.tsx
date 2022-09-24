import React, { Fragment, useState } from 'react';
import { Dialog, Combobox, Transition } from '@headlessui/react';
import classNames from 'classnames';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/solid';

import { getTokenIndex, formatPrice } from '../../libs/utils';

const TokenDropDownModal = ({
  tokens = [],
  userBalances,
  onSelectedOption,
  selectedOption,
  label = 'Select a token'
}: any) => {
  const [isOpen, setIsOpen] = useState(false);
  // const [selected, setSelected] = useState(tickers[0]);

  // console.log(isDark);
  // const tickers = api.getCurrencies();

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  const [query, setQuery] = useState('');

  const onSelectedToken = (e: any) => {
    // setSelected(e);
    onSelectedOption(e);
    setIsOpen(false);
    setQuery('');
  };

  const filteredToken =
    query === ''
      ? tokens
      : tokens.filter((token: any) =>
          token.name
            .toLowerCase()
            .replace(/\s+/g, '')
            .includes(query.toLowerCase().replace(/\s+/g, ''))
        );

  return (
    <>
      <div>
        <button
          type="button"
          onClick={openModal}
          className="flex items-center p-2 text-sm font-medium rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 hover:bg-foreground-400 "
        >
          <p className="ml-3 text-lg ">{selectedOption?.symbol}</p>
          <ChevronDownIcon className="w-5 h-5 ml-1 -mr-1" aria-hidden="true" />
        </button>
      </div>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className={classNames('relative z-10')}
          onClose={closeModal}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-full p-5 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel
                  className={classNames(
                    'w-full max-w-md transform overflow-hidden rounded-md bg-[#2B2E4A] text-left align-middle shadow-xl transition-all'
                  )}
                >
                  <Dialog.Title
                    as="h3"
                    className="pt-4 pl-5 text-lg font-semibold leading-6 divide-y font-work"
                  >
                    {label}
                  </Dialog.Title>
                  <div className="h-px mx-3 my-3 bg-foreground-400"></div>
                  <Combobox value={selectedOption} onChange={onSelectedToken}>
                    <div className="relative mt-2">
                      <div className="relative mx-3 overflow-hidden text-left rounded-md shadow-md cursor-default focus:outline-none ">
                        <Combobox.Input
                          className="w-full border-none py-2.5 pl-3 pr-10 text-base leading-5 focus:outline-none bg-foreground-100 font-work"
                          // displayValue={(token) => token.name}
                          onChange={event => setQuery(event.target.value)}
                          placeholder="Search..."
                        />
                      </div>
                      <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                        afterLeave={() => setQuery('')}
                        show={true}
                      >
                        <Combobox.Options
                          className={`mt-1 h-56 w-full overflow-auto rounded-md bg-[#2B2E4A] 
                            py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none 
                          `}
                        >
                          {filteredToken.length === 0 && query !== '' ? (
                            <div className="relative px-4 py-2 cursor-default select-none font-work">
                              Nothing found.
                            </div>
                          ) : (
                            filteredToken.map((item: any) => (
                              <Combobox.Option
                                key={item.id}
                                className={({ active }) =>
                                  `relative cursor-default select-none py-2 font-work pl-10 pr-4 mx-3 bg-foreground-100 rounded-md mb-2 border-t border-l border-r border-b border-foreground-400  ${
                                    item.symbol === selectedOption?.symbol
                                      ? 'bg-teal-600'
                                      : 'hover:opacity-75'
                                  }`
                                }
                                value={item}
                              >
                                {({ selected, active }) => {
                                  return (
                                    <>
                                      <div className="flex items-center justify-between">
                                        <div
                                          className={`flex items-center truncate   ${
                                            item.symbol ===
                                            selectedOption?.symbol
                                              ? 'font-medium'
                                              : 'font-normal '
                                          }`}
                                        >
                                          <img
                                            src={item.logo}
                                            alt={item.symbol}
                                            className="w-7 h-7"
                                          />
                                          <p className="pl-3">{item.symbol}</p>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-base text-white-900">
                                            {Number(
                                              userBalances[
                                                getTokenIndex(item.symbol)
                                              ]
                                            )
                                              ? Number(
                                                  userBalances[
                                                    getTokenIndex(item.symbol)
                                                  ]
                                                ).toFixed(4)
                                              : userBalances[
                                                  getTokenIndex(item.symbol)
                                                ]}{' '}
                                          </p>
                                        </div>
                                      </div>
                                      {item.symbol ===
                                      selectedOption?.symbol ? (
                                        <span
                                          className={`absolute  inset-y-0 left-0 flex items-center pl-3 ${
                                            item.symbol ===
                                            selectedOption?.symbol
                                              ? 'text-white'
                                              : 'text-teal-600'
                                          }`}
                                        >
                                          <CheckIcon
                                            className="w-5 h-5"
                                            aria-hidden="true"
                                          />
                                        </span>
                                      ) : null}
                                    </>
                                  );
                                }}
                              </Combobox.Option>
                            ))
                          )}
                        </Combobox.Options>
                      </Transition>
                    </div>
                  </Combobox>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default TokenDropDownModal;
