import { memo, PropsWithChildren } from "react";

export interface IStep<TStep> {
  onNext(): void;
  onNextDisabled?: boolean;
  onPrev?(): void;
  title: string;
  step: TStep;
  currentStep: TStep;
}

export const Step = <TStep, _>({
  onNext,
  onPrev,
  title,
  onNextDisabled,
  children,
  step,
  currentStep
}: PropsWithChildren<IStep<TStep>>) => {
  if (step !== currentStep) {
    return null;
  }
  return (
    <div>
      <div style={{ position: "relative" }}>
        <h3>{title}</h3>
        <div style={{ position: "absolute", right: 20, top: 10 }}>
          {onPrev && <button onClick={onPrev}>prev</button>}
          <button onClick={onNext} disabled={onNextDisabled}>
            next
          </button>
        </div>
      </div>
      {children}
    </div>
  );
};

export const MemoizedStep = memo(Step);
