import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, onClick, ...props }) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (props.type !== "submit") {
      event.preventDefault(); // Chặn hành vi submit nếu không phải button submit
    }
    onClick?.(event); // Gọi onClick nếu có
  };
  return (
    <button {...props} onClick={handleClick}>
      {children}
    </button>
  );
};
export default Button;
