import classNames from "classnames";
import React from "react";

export const DefaultLayout: React.FC = ({ children }) => {
  return (
    <div className={classNames("w-full", "min-h-screen", "flex", "flex-col", "bg-[#252526]")}>
      <div className={classNames("flex-grow")}>{children}</div>
      <footer className={classNames("container", "mx-auto", "text-center")}>
        <small className={classNames("inline-block", "mt-12")}>
          Please contact{" "}
          <a className={classNames("underline", "text-blue-500")} href="https://twitter.com/iVgtr">
            @ivgtr
          </a>
          , If you have any.
        </small>
      </footer>
    </div>
  );
};
