import React from "react";
import { ThemedView } from "../themed-view";

const If = ({
  condition,
  children,
}: {
  condition: boolean;
  children: React.ReactNode;
}) => {
  return condition ? <ThemedView>{children}</ThemedView> : null;
};

export default If;
