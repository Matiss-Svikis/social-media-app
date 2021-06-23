import React from "react";
import { IconButton } from "@material-ui/core";
import ToolTip from "@material-ui/core/Tooltip";
export default function MyButton({ children, onClick, btnClassName, tipClassName, tip }) {
  return (
    <ToolTip className={tipClassName} title={tip} placement="top">
      <IconButton onClick={onClick} className={btnClassName}>
        {children}
      </IconButton>
    </ToolTip>
  );
}
