export type EventListener = (...args: any[]) => void;

export interface EventListenerOptions {
    isFirst?: boolean;
}

interface EventListenerCollection<L extends EventListener> {
    /**
     * List of listeners to run before the others
     * They are ran in the opposite order of the registration order
     */
    highPriority: Map<L, true>;

    /**
     * List of events to run after the high priority listeners
     * They are ran in the registration order
     */
    regular: Map<L, true>;
}

// Used https://gist.github.com/mudge/5830382 as a starting point.
// See https://github.com/browserify/events/blob/master/events.js for
// the Node.js (https://nodejs.org/api/events.html) polyfill used by webpack.
export class EventManager<L extends EventListener> {
    events: {[eventName: string]: EventListenerCollection<L>} = {};

    on<LT extends L>(eventName: string, listener: LT, options: EventListenerOptions = {}) {
        let collection = this.events[eventName];

        if (!collection) {
            collection = {
                highPriority: new Map(),
                regular: new Map(),
            };
            this.events[eventName] = collection;
        }

        if (options.isFirst) {
            collection.highPriority.set(listener, true);
        } else {
            collection.regular.set(listener, true);
        }

        return () => {
            this.removeListener(eventName, listener);
        };
    }

    removeListener<LT extends L>(eventName: string, listener: LT): void {
        if (this.events[eventName]) {
            this.events[eventName].regular.delete(listener);
            this.events[eventName].highPriority.delete(listener);
        }
    }

    removeAllListeners(): void {
        this.events = {};
    }

    emit(eventName: string, ...args: any[]): void {
        const collection = this.events[eventName];
        if (!collection) {
            return;
        }

        const highPriorityListeners = Array.from(collection.highPriority.keys());
        const regularListeners = Array.from(collection.regular.keys());

        for (let i = highPriorityListeners.length - 1; i >= 0; i -= 1) {
            const listener = highPriorityListeners[i];
            if (collection.highPriority.has(listener)) {
                listener.apply(this, args);
            }
        }

        for (let i = 0; i < regularListeners.length; i += 1) {
            const listener = regularListeners[i];
            if (collection.regular.has(listener)) {
                listener.apply(this, args);
            }
        }
    }

    once(eventName: string, listener: L): void {
        const that = this;
        const oneTimeListener: EventListener = (...args: any[]) => {
            listener.apply(that, args);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            this.removeListener(eventName, oneTimeListener as L);
        };
        this.on(eventName, listener);
    }
}
