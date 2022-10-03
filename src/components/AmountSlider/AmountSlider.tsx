import React from 'react';

import Slider from 'rc-slider';
import raf from 'rc-util/lib/raf';
import Tooltip from 'rc-tooltip';
import type { SliderProps } from 'rc-slider';

// import 'rc-tooltip/assets/bootstrap.css';

type AmountSliderProps = {
  onChangeValue: any;
  onChangeInputValue: any;
  value: number;
  label: string;
};

const HandleTooltip = (props: {
  value: number;
  children: React.ReactElement;
  visible: boolean;
  tipFormatter?: (value: number) => React.ReactNode;
}) => {
  const {
    value,
    children,
    visible,
    tipFormatter = val => `${val} %`,
    ...restProps
  } = props;

  const tooltipRef = React.useRef<any>();
  const rafRef = React.useRef<number | null>(null);

  function cancelKeepAlign() {
    raf.cancel(rafRef.current!);
  }

  function keepAlign() {
    rafRef.current = raf(() => {
      tooltipRef.current?.forcePopupAlign();
    });
  }

  React.useEffect(() => {
    if (visible) {
      keepAlign();
    } else {
      cancelKeepAlign();
    }

    return cancelKeepAlign;
  }, [value, visible]);

  return (
    <Tooltip
      placement="top"
      overlay={tipFormatter(value)}
      overlayInnerStyle={{ minHeight: 'auto' }}
      ref={tooltipRef}
      visible={visible}
      {...restProps}
    >
      {children}
    </Tooltip>
  );
};

// const handleRender: SliderProps['handleRender'] = (node, props) => {
//   return (
//     <HandleTooltip value={props.value} visible={props.dragging}>
//       {node}
//     </HandleTooltip>
//   );
// };

const TooltipSlider = ({
  tipFormatter,
  tipProps,
  ...props
}: SliderProps & {
  tipFormatter?: (value: number) => React.ReactNode;
  tipProps: any;
}) => {
  const tipHandleRender: SliderProps['handleRender'] = (node, handleProps) => {
    return (
      <HandleTooltip
        value={handleProps.value}
        visible={handleProps.dragging}
        tipFormatter={tipFormatter}
        {...tipProps}
      >
        {node}
      </HandleTooltip>
    );
  };

  return <Slider {...props} handleRender={tipHandleRender} />;
};

const AmountSlider = ({
  onChangeValue,
  onChangeInputValue,
  value,
  label
}: AmountSliderProps) => {
  const marks = {
    0: '0%',
    25: '25%',
    50: '50%',
    75: '75%',
    100: '100%'
  };

  return (
    <div className="mt-5 mb-12 amountSlider">
      <p className="mb-2 text-base font-medium uppercase">{label}</p>
      <div className="flex items-center mt-5 ml-2 gap-9">
        <TooltipSlider
          min={0}
          marks={marks}
          step={1}
          onChange={onChangeValue}
          defaultValue={0}
          value={value}
          included={true}
          tipProps={undefined}
        />
        <div className="flex items-center">
          <input
            value={value}
            className="py-1 text-base font-medium text-right bg-transparent border rounded-tr-none rounded-br-none rounded-tl-md rounded-bl-md w-14 focus:outline-none read-only:bg-transparent"
            onChange={onChangeInputValue}
          />
          <p className="px-2 py-1 border-t border-b border-r rounded-tr-md rounded-br-md border-[#555] bg-[#555]">
            %
          </p>
        </div>
      </div>
    </div>
  );
};

export default AmountSlider;
