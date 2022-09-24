import React, { Fragment, useEffect, useState } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, SelectorIcon } from '@heroicons/react/solid';
import { getStarknet } from 'get-starknet';

const networks = [{ name: 'StarkNet Goerli' }, { name: 'StarkNet' }];

const NetworkSelection = ({ disabled }: any) => {
  const [selected, setSelected] = useState(networks[0]);
  useEffect(() => {
    const { baseUrl } = getStarknet().provider;
    if (baseUrl.includes('alpha-mainnet.starknet.io')) {
      setSelected(networks[1]);
    } else if (baseUrl.includes('alpha4.starknet.io')) {
      setSelected(networks[0]);
    }
  });
  return (
    <div className="">
      <Listbox value={selected} onChange={setSelected} disabled={disabled}>
        <div className="relative">
          <Listbox.Button className="relative !my-0  w-48 border border-foreground-500 bg-black py-2.5  pl-3 pr-10 text-left rounded-lg cursor-default outline-none focus:outline-none  sm:text-sm">
            <span className="block font-medium text-white font-work">
              {selected.name}
            </span>
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <SelectorIcon
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
            <Listbox.Options className="absolute w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {networks.map((network, networkIdx) => (
                <Listbox.Option
                  key={networkIdx}
                  className={({ active }: any) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? 'bg-amber-100 text-amber-900' : 'text-gray-900'
                    }`
                  }
                  value={network}
                >
                  {({ selected }: any) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? 'font-medium' : 'font-normal'
                        }`}
                      >
                        {network.name}
                      </span>
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

export default NetworkSelection;
