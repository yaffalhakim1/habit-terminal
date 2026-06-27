import React from "react";

interface Props {
  show: boolean;
  msg: string;
  type: "success" | "error" | "info";
}

const Toast = React.memo(function Toast({ show, msg, type }: Props) {
  if (!show) return null;
  return (
    <div className={`toast toast-${type}`}>
      {msg}
    </div>
  );
});

export default Toast;
