import type { useProcessExampleState } from "./State";

export type ProcessExampleProps = object;
export type ProcessExampleState = ReturnType<typeof useProcessExampleState>;

export type StepName = "dev" | "tst" | "uat" | "prd";