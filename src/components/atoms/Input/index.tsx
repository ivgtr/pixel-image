import classNames from "classnames";
import React, { memo } from "react";

export const Input = memo(
  ({
    handleChange,
    value,
    id,
  }: {
    handleChange: (origUrl: string) => void;
    value: string;
    id: string;
  }) => {
    return (
      <input
        type="text"
        id={id}
        onBlur={(e) => {
          e.preventDefault();
          if (e.target.value) {
            handleChange(e.target.value);
          }
        }}
        defaultValue={value}
        className={classNames(
          "w-full",
          "h-12",
          "px-4",
          "py-2",
          "border-2",
          "border-gray-600",
          "rounded-lg"
        )}
      />
    );
  }
);
