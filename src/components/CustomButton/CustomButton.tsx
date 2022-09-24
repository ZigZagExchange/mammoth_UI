import React from 'react';

import classNames from 'classnames';

const CustomButton = ({ children, className, ...props }: any) => {
  return (
    <button
      {...props}
      className={classNames(
        'bg-gradient-to-r from-primary-900 to-secondary-900 h-fit rounded-lg shadow-md hover:from-primary-500 hover:to-secondary-500 disabled:from-background-900 disabled:to-background-900 disabled:hover:bg-background-900',
        className
      )}
    >
      {children}
    </button>
  );
};

export default CustomButton;
