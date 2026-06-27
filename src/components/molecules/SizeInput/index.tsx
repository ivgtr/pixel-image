import classNames from "classnames";
import React, { memo } from "react";
import type { ChangeEvent } from "react";

const sizeArray = [...new Array(50)].map((_, i) => i + 1);

export const SizeInput = memo(
  ({
    onValueChange,
    defaultValue,
    id,
    ariaDescribedBy,
  }: {
    onValueChange: (size: string) => void;
    defaultValue: string;
    id: string;
    ariaDescribedBy?: string;
  }) => {
    return (
      <select
        id={id}
        defaultValue={defaultValue}
        aria-describedby={ariaDescribedBy}
        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
          onValueChange(e.currentTarget.value)
        }
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
  },
);
