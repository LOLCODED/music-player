import React from "react";

interface PageTitleProps {
  title: string;
  meta?: string;
  phoneOnly?: boolean;
  children?: React.ReactNode;
}

/** The big stacked page title over a heavy rule. */
const PageTitle: React.FC<PageTitleProps> = ({ title, meta, phoneOnly = false, children }) => (
  <div className={phoneOnly ? "page-title-row phone-only" : "page-title-row"}>
    <h1 className="page-title">{title}</h1>
    {meta && <span className="page-title-meta">{meta}</span>}
    {children}
  </div>
);

export default PageTitle;
