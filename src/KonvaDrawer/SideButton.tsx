type SideButtonProps = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & {
  active?: boolean;
};

const SideButton = ({ style, children, active, ...props }: SideButtonProps) => {
  const baseStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 32,
    padding: 0,
    borderWidth: 1,
    borderRadius: 4,
    ...style
  };
  if (active) {
    baseStyle.backgroundColor = "#9dffc4";
  }
  return (
    <button style={baseStyle} {...props}>
      {children}
    </button>
  );
};

export default SideButton;
