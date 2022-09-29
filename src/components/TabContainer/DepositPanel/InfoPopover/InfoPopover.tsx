import React, { useState } from 'react';
import { IoMdHelpCircleOutline } from 'react-icons/io';

const InfoPopover = () => {
  const [tooltipStatus, setTooltipStatus] = useState(0);

  return (
    <div
      className="relative mt-0 md:mt-0"
      onMouseEnter={() => setTooltipStatus(1)}
      onMouseLeave={() => setTooltipStatus(0)}
    >
      <div className="mr-2 cursor-pointer">
        <IoMdHelpCircleOutline className="w-6 h-6" />
      </div>
      {tooltipStatus === 1 && (
        <div
          role="tooltip"
          className="absolute left-0 z-20 px-3 py-2 ml-8 -mt-12 transition duration-150 ease-in-out bg-black shadow-lg w-52 rounded-xl"
        >
          <svg
            className="absolute top-0 bottom-0 left-0 h-20 -ml-2 dark:fill-gray-900 fill-black-50"
            width="9px"
            height="16px"
            viewBox="0 0 9 16"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
          >
            <g
              id="Page-1"
              stroke="none"
              strokeWidth={1}
              fill="none"
              fillRule="evenodd"
            >
              <g
                id="Tooltips-"
                transform="translate(-874.000000, -1029.000000)"
                className="fill-black"
              >
                <g
                  id="Group-3-Copy-16"
                  transform="translate(850.000000, 975.000000)"
                >
                  <g id="Group-2" transform="translate(24.000000, 0.000000)">
                    <polygon
                      id="Triangle"
                      transform="translate(4.500000, 62.000000) rotate(-90.000000) translate(-4.500000, -62.000000) "
                      points="4.5 57.5 12.5 66.5 -3.5 66.5"
                    />
                  </g>
                </g>
              </g>
            </g>
          </svg>
          <div className="text-sm font-normal text-gray-200 font-poppins dark:text-white-900">
            When you add liquidity, you will receive pool tokens representing
            your position. These tokens automatically earn fees proportional to
            your share of the pool, and can be redeemed at any time.
          </div>
        </div>
      )}{' '}
    </div>
  );
};

export default InfoPopover;
