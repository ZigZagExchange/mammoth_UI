import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import CustomButton from '../../../CustomButton';
import { tokens } from '../../../../services/constants';

const PreviewModal = ({
  isTokenApproved,
  tokenDetails,
  handleSubmitNormal,
  balance
}: any) => {
  const [isOpen, setIsOpen] = useState(false);

  function closeModal() {
    setIsOpen(false);
    handleSubmitNormal();
  }

  function openModal() {
    setIsOpen(true);
  }

  return (
    <>
      <div className="">
        <CustomButton
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 font-semibold uppercase rounded-md mt-5"
          disabled={!isTokenApproved}
          onClick={openModal}
        >
          Preview
        </CustomButton>
      </div>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
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
            <div className="flex items-center justify-center min-h-full p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md p-8 overflow-hidden text-left align-middle transition-all transform bg-[#2c3147] shadow-xl rounded-2xl">
                  <Dialog.Title
                    as="h3"
                    className="text-2xl font-medium leading-6 text-white"
                  >
                    Investment Preview
                  </Dialog.Title>
                  <div className="mt-4">
                    {tokens.map((token, index) => {
                      return (
                        <div key={index}>
                          <div className="flex items-center justify-between space-y-8">
                            <div className="flex items-center gap-2">
                              <img
                                src={token.logo}
                                alt={token.symbol}
                                className="w-8 h-8"
                              />
                              <p>{token.symbol}</p>
                            </div>
                            <p>
                              {tokenDetails[index].amount
                                ? tokenDetails[index].amount
                                : 0}{' '}
                              (
                              {tokenDetails[index].amount
                                ? (
                                    (parseFloat(tokenDetails[index].amount) /
                                      parseFloat(balance[index])) *
                                    100
                                  ).toString()
                                : 0}
                              %)
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="py-6 mt-3 space-y-2 border-t border-foreground-500">
                    <div className="flex items-center justify-between">
                      <p className="font-normal text-md">Total</p>
                      <p className="text-lg font-semibold">$00.00</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="font-normal text-md">Price Impact</p>
                      <p className="text-lg font-semibold">0.00%</p>
                    </div>
                  </div>

                  <div className="">
                    <CustomButton
                      type="button"
                      className="w-full tracking-wide flex items-center justify-center gap-2 px-4 py-2.5 font-semibold uppercase rounded-md"
                      onClick={closeModal}
                    >
                      Deposit
                    </CustomButton>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default PreviewModal;
