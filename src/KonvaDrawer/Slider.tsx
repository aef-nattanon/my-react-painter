import React from "react";
import "./Slider.css";

type InputProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

type SliderProps = {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: InputProps["onChange"];
};
const Slider = ({
  value,
  min = 1,
  max = 100,
  step = 1,
  onChange
}: SliderProps) => {
  return (
    <div className="slidecontainer">
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        step={step}
        className="slider"
        id="myRange"
        onChange={onChange}
      />
    </div>
  );
};

export default Slider;
