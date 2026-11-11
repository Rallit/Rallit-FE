import type { PropsWithChildren } from "react";
import "./PageLayout.css";

export function PageLayout({ children }: PropsWithChildren) {
  return <main className="page-layout">{children}</main>;
}
