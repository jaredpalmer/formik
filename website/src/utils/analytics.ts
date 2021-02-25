const createFunctionWithTimeout = (
  callback: () => void,
  opt_timeout = 1000
) => {
  let called = false;
  const raceCallback = () => {
    if (!called) {
      called = true;
      callback();
    }
  };
  setTimeout(raceCallback, opt_timeout);
  return raceCallback;
};

interface CustomEvent {
  /** The value that will appear as the event action in Google Analytics Event reports. */
  action: string;
  /** The category of the event. */
  category?: string;
  /** The label of the event. */
  label?: string;
  /** A non-negative integer that will appear as the event value. */
  value: number;
  /**
   * Whether the even is non-interactive
   * @see https://support.google.com/analytics/answer/1033068#NonInteractionEvents
   * @default false
   */
  nonInteraction?: boolean;
  /**
   * A function that gets called as soon as an event has been successfully sent.
   * @see https://developers.google.com/analytics/devguides/collection/gtagjs/sending-data
   */
  hitCallback?: () => void;
  /**
   * Max ms timeout for callback
   * @default 1000
   */
  callbackTimeout?: number;
}
/**
 * This allows the user to create custom events within their Next projects.
 *
 * @see https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#events
 */
export function trackCustomEvent({
  category,
  action,
  label,
  value,
  nonInteraction = false,
  hitCallback,
  callbackTimeout = 1000,
}: CustomEvent) {
  if (typeof window !== `undefined` && (window as any).gtag) {
    const trackingEventOptions: any = {
      event_category: category,
      event_action: action,
      event_label: label,
      value,
      non_interaction: nonInteraction,
    };

    if (hitCallback && typeof hitCallback === `function`) {
      trackingEventOptions.event_callback = createFunctionWithTimeout(
        hitCallback,
        callbackTimeout
      );
    }

    (window as any).gtag(`event`, trackingEventOptions);
  }
}
