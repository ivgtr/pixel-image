import classNames from "classnames";
import React, { memo } from "react";

const sizeArray = [...new Array(50)].map((_, i) => i + 1);

export const SizeInput = memo(
  ({
    handleChange,
    value,
    id,
  }: {
    handleChange: (size: string) => void;
    value: string;
    id: string;
  }) => {
    return (
      <select
        id={id}
        defaultValue={value}
        onChange={(e) => handleChange(e.currentTarget.value)}
        className={classNames("h-12", "px-4", "py-2", "border-2", "border-gray-600", "rounded-lg")}
      >
        {sizeArray.map((item, index) => {
          return (
            <option key={index} value={item}>
              {item}
            </option>
          );
        })}
      </select>
    );
  }
);
