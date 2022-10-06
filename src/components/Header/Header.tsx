import React, { Fragment } from 'react';

import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/solid';
import { FaCopy, FaExternalLinkAlt, FaSignOutAlt } from 'react-icons/fa';

import NetworkSelection from '../NetworkSelection';
import CustomButton from '../CustomButton';

import { truncateAddress } from '../../services/address.service';

type headerProps = {
  onClickConnectWallet: () => void;
  onClickCopyAddress: () => void;
  onClickDisconnect: () => void;
  connected: boolean;
  address: string;
  link: string;
};

const Header = ({
  onClickConnectWallet,
  onClickCopyAddress,
  onClickDisconnect,
  connected,
  address,
  link
}: headerProps) => {
  return (
    <div className="flex items-center justify-end gap-4 mx-6 my-6">
      <NetworkSelection disabled={true} />
      {!connected && (
        <CustomButton
          className="px-6 py-2.5 text-sm font-semibold uppercase"
          onClick={onClickConnectWallet}
        >
          Connect Wallet
        </CustomButton>
      )}
      {connected && (
        <Menu as="div" className="relative inline-block text-left">
          <div>
            <Menu.Button className="inline-flex justify-center w-full px-4 py-2.5 text-sm font-medium text-white bg-black border rounded-md bg-opacity-20 hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 border-foreground-500">
              {address && truncateAddress(address)}
              <ChevronDownIcon
                className="w-5 h-5 ml-2 -mr-1 text-violet-200 hover:text-violet-100"
                aria-hidden="true"
              />
            </Menu.Button>
          </div>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 w-56 mt-2 origin-top-right border divide-y divide-gray-100 rounded-md shadow-lg bg-background-900 border-foreground-400 ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="px-1 py-1 ">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`${
                        active ? 'bg-violet-500 text-white' : 'text-white-900'
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm gap-2`}
                      onClick={onClickCopyAddress}
                    >
                      <FaCopy className="w-4 h-4 text-white-900" />
                      Copy Address
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <a href={link} target="_blank" rel="noreferrer">
                      <button
                        className={`${
                          active ? 'bg-violet-500 text-white' : 'text-white-900'
                        } group flex w-full items-center rounded-md px-2 py-2 text-sm gap-2`}
                      >
                        <FaExternalLinkAlt className="w-4 h-4 text-white-900" />
                        View on Explorer
                      </button>
                    </a>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`${
                        active ? 'bg-violet-500 text-white' : 'text-white-900'
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm gap-2`}
                      onClick={onClickDisconnect}
                    >
                      <FaSignOutAlt className="w-4 h-4 text-white-900" />
                      Disconnect
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      )}
    </div>
  );
};

export default Header;
