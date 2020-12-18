import { useFormik } from 'formik';
import { useBoolean } from './useBoolean';
import * as React from 'react';
import useOnClickOutside from 'use-onclickoutside';
import { TWButton } from './TWButton';

const TIMEOUT_BEFORE_CLOSE_AFTER_SUBMIT = 3000;

interface FeedbackInputProps {
  submitMessage: JSX.Element;
  onSubmit: (values: { feedback: string }) => Promise<void>;
}

export const FeedbackInput: React.FC<FeedbackInputProps> = ({
  submitMessage,
  onSubmit,
}) => {
  const textAreaRef = React.useRef<HTMLTextAreaElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const focusTimeoutId = React.useRef(0);
  const blurTimeoutId = React.useRef(0);

  const [
    isFeedbackOpen,
    { setTrue: openFeedback, setFalse: closeFeedback },
  ] = useBoolean(false);
  const [
    shouldShowSubmit,
    { setTrue: showSubmit, setFalse: hideSubmit },
  ] = useBoolean(false);

  const onFocus = React.useCallback(() => {
    focusTimeoutId.current = (setTimeout(showSubmit, 200) as unknown) as number;
    openFeedback();
  }, [openFeedback, showSubmit]);

  const close = React.useCallback(() => {
    clearTimeout(focusTimeoutId.current);
    hideSubmit();
    closeFeedback();
  }, [closeFeedback, hideSubmit]);

  useOnClickOutside(containerRef, close);

  const onBlur = React.useCallback(() => {
    blurTimeoutId.current = window.setTimeout(() => {
      if (
        containerRef.current &&
        !containerRef.current.contains(document.activeElement)
      ) {
        close();
      }
    }, 0);
  }, [close]);
  const { getFieldProps, handleSubmit, submitCount, isSubmitting } = useFormik({
    initialValues: { feedback: '' },
    onSubmit: async (values, { resetForm }) => {
      await onSubmit(values);
      hideSubmit();

      setTimeout(() => {
        close();
        resetForm();
      }, TIMEOUT_BEFORE_CLOSE_AFTER_SUBMIT);
    },
  });
  const hasSubmitted = submitCount > 0;
  return (
    <div ref={containerRef} onBlur={onBlur} data-fi-root="true">
      <div data-fi-container="true" data-fi-focused={isFeedbackOpen}>
        <form onSubmit={handleSubmit}>
          {hasSubmitted ? (
            <>{submitMessage}</>
          ) : (
            <>
              <label htmlFor="feedback" className="sr-only">
                Message
              </label>
              <textarea
                required={true}
                ref={textAreaRef}
                id="feedback"
                onFocus={onFocus}
                data-fi-textarea="true"
                {...getFieldProps({ name: 'feedback' })}
                rows={1}
                placeholder="Feedback"
              />
            </>
          )}

          {!hasSubmitted && (
            <div
              data-fi-footer="true"
              style={{ opacity: shouldShowSubmit ? 1 : 0 }}
            >
              <TWButton
                style={{ marginLeft: 'auto' }}
                className="mr-1"
                type="submit"
                size="xs"
                intent="primary"
                disabled={isSubmitting ?? !shouldShowSubmit}
              >
                Send
              </TWButton>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
