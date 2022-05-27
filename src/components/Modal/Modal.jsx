// import React, { useEffect, useState } from "react";
// import ReactDOM from "react-dom";
// import { CSSTransition } from "react-transition-group";

// export const Modal = (props) => {
//   const closeOnEscapeKeyDown = (e) => {
//     if ((e.charCode || e.keyCode) === 27) {
//       props.onClose();
//     }
//   };

//   const [doc, setDoc] = useState();

//   useEffect(() => {
//     document.body.addEventListener("keydown", closeOnEscapeKeyDown);
//     console.log(props.show)
//     setDoc(document.getElementById("root"));
//     return function cleanup() {
//       document.body.removeEventListener("keydown", closeOnEscapeKeyDown);
//     };
//   }, []);

//   return doc ? ReactDOM.createPortal(
//     <CSSTransition
//       in={props.show}
//       unmountOnExit
//       timeout={{ enter: 0, exit: 300 }}
//     >
//       <div className="zig_modal" onClick={props.onClose}>
//         <div className="zig_modal_content" onClick={(e) => e.stopPropagation()}>
//           <div className="zig_modal_header">
//             <h4 className="zig_modal_title">{props.title}</h4>
//           </div>
//           <div className="zig_modal_body zig_scrollstyle">{props.children}</div>
//         </div>
//       </div>
//     </CSSTransition>,
//     doc
//   ) : null;
// };


import * as React from 'react';
import Dialog from '@mui/material/Dialog';

export function Modal(props) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(()=>{
    setOpen(props.show)
  }, [props.show])

  const handleClose = () => {
    setOpen(false);
    props.onClose();
  };

  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          style: {
            background: '#232735',
            borderRadius: '0 0 6px 6px',
            maxHeight: '400px',
            width: '400px',
            overflow: 'auto',
            fontSize: '0.8rem'
          },
        }}
      >
        
        {/* <div className="zig_modal" onClick={handleClose}> */}
          {/* <div className="zig_modal_content" onClick={(e) => e.stopPropagation()}> */}
            <div className="zig_modal_header">
              <h4 className="zig_modal_title">{props.title}</h4>
            </div>
            <div className="zig_modal_body zig_scrollstyle">{props.children}</div>
          {/* </div> */}
        {/* </div> */}
      </Dialog>
    </div>
  );
}