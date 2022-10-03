import React, { useState } from 'react';
import { RadioGroup } from '@headlessui/react';

const ModeSelection = ({ setSelected, selected, options }: any) => {
  return (
    <div>
      <RadioGroup value={selected} onChange={setSelected}>
        <RadioGroup.Label className="sr-only">Server size</RadioGroup.Label>
        <div className="flex gap-2">
          {options.map((mode: any) => (
            <RadioGroup.Option
              key={mode.name}
              value={mode}
              className={({ active, checked }) =>
                `${active ? '' : ''}
          ${checked ? 'bg-sky-900 bg-opacity-75 text-white' : 'bg-white'}
            relative flex cursor-pointer rounded-lg px-5 py-2.5 shadow-md focus:outline-none`
              }
            >
              {({ active, checked }) => (
                <>
                  <div className="flex items-center justify-between gap-5 ">
                    <div className="flex items-center">
                      <div className="text-sm">
                        <RadioGroup.Label
                          as="p"
                          className={`font-medium uppercase  ${
                            checked ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {mode.name}
                        </RadioGroup.Label>
                      </div>
                    </div>
                    {checked && (
                      <div className="text-white shrink-0">
                        <CheckIcon className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                </>
              )}
            </RadioGroup.Option>
          ))}
        </div>
      </RadioGroup>
    </div>
  );
};

function CheckIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx={12} cy={12} r={12} fill="#fff" opacity="0.2" />
      <path
        d="M7 13l3 3 7-7"
        stroke="#fff"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default ModeSelection;
