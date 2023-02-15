import * as React from 'react';
import { mergeProps, useButton, useHover } from 'react-aria';
import Image from 'next/legacy/image';
import cn from 'classnames';
import { trackCustomEvent } from 'utils/analytics';
import { useRouter } from 'next/router';

export interface FeedbackButtonProps {
  intent: 'tears' | 'meh' | 'happy' | 'awesome';
  onPress: () => void;
}

const mapIntentToSource = {
  tears: '/twemoji/1f62d.svg',
  meh: '/twemoji/1f615.svg',
  happy: '/twemoji/1f600.svg',
  awesome: '/twemoji/1f929.svg',
};

export function FeedbackButton({ intent, ...props }: FeedbackButtonProps) {
  const ref = React.useRef<HTMLButtonElement | null>(null);
  const { buttonProps } = useButton(props, ref);
  const { isHovered, hoverProps } = useHover({});
  const mergedProps = mergeProps(hoverProps, buttonProps);
  return (
    <>
      <button
        {...mergedProps}
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center py-2',
          isHovered
            ? ' none transition duration-150 scale-125   ease-in-out '
            : ' grayed transition duration-150 scale-100  ease-in-out '
        )}
      >
        <img src={mapIntentToSource[intent]} height="24" width="24" />
      </button>
      <style jsx>{`
        .grayed {
          filter: grayscale(100%);
        }
        .none {
          filter: none;
        }
      `}</style>
    </>
  );
}

FeedbackButton.displayName = 'FeedbackButton';

export function ReactionForm() {
  const [feedbackGiven, setFeedbackGiven] = React.useState(false);

  const { asPath } = useRouter();
  React.useEffect(() => {
    setFeedbackGiven(false);
  }, [asPath, setFeedbackGiven]);

  const makeTrackedHandler = (value: number) => () => {
    trackCustomEvent({
      category: 'Feedback Button',
      action: 'feedback',
      name: 'feedback',
      label: window.location.pathname,
      value,
    });
    setFeedbackGiven(true);
  };

  if (feedbackGiven) {
    return (
      <div className="mb-4 text-lg font-semibold text-center ">
        Thanks for letting us know!
      </div>
    );
  } else {
    return (
      <>
        <div className="mb-4 text-lg font-semibold text-center ">
          Was this page helpful?
        </div>
        <div className="grid w-64 grid-cols-4 gap-2 mx-auto">
          <FeedbackButton intent="tears" onPress={makeTrackedHandler(0)} />
          <FeedbackButton intent="meh" onPress={makeTrackedHandler(1)} />
          <FeedbackButton intent="happy" onPress={makeTrackedHandler(2)} />
          <FeedbackButton intent="awesome" onPress={makeTrackedHandler(3)} />
        </div>
      </>
    );
  }
}

ReactionForm.displayName = 'ReactionForm';
