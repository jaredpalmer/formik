
```
// reference equals could use a simple Object.is() or ===, depending on whether result is an object
// not sure if we should split that
const updateIfNotDeepEquals = (selector, listeners, prevSliceRef, newState) => {
  const newSlice = selector(newState);
  if (!deepEquals(newSlice, prevSliceRef.current) {
    prevSliceRef.current = newSlice;
    listeners.forEach(listener => listener(newSlice));
  }
}
```

```
useLayoutEffect(() => {
  unstable_batchedUpdates(() => {
    listeners.forEach(listener => listener.updater(listener.listeners, listener.prevSliceRef, state));
  });
}, [state, listeners]);
```

```
const useIsSubmitting = useFormikStateSlice(updateIfNotReferenceEquals, state => state.isSubmitting,
```

> TL;DR: I'm just going to outline this whole prototype to save for later when I try it out, SORRY!

```
// this version is the hardest to use, it's like useMemo in that deps passed initially to `selector` should also be passed here
// changes to updater WILL move the listener around and destroy performance
// we allow selector to be a custom function `state => { isSubmitting: state.isSubmitting, dirty: state.dirty }`
const useFormikStateSlice = (updater, selector, deps: primitives[]) => {
  const { getState, addFormListener } = useFormikApi();
  const memoizedUpdater = useMemo(() => updater(selector(...deps)), [updater, ...deps]);
  const [state, updateState] = useState(() => selector(...deps)(getState()));

  useLayoutEffect(() => {
    return addFormListener(updater, selector, args: primitives[]);
  }, [addFormListener, updater, selector, ...args]); // if underlying args change, we need
}