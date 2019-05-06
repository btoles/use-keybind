import React, { useEffect } from 'react';
import createListeners from './utils/createListeners';

function useKeyBind(element, bindings) {
    const { keyDownListener, keyUpListener } = createListeners(bindings);

    useEffect(() => {
        const { current: node } = element;
        if (node) {
            node.addEventListener('keydown', keyDownListener);
            node.addEventListener('keyup', keyUpListener);
        }
        if (element) {
            /**
             * At this point we know we've been passed a value but we don't know if it is
             * a React ref or an Element.  We need to make an attempt to add an event listener
             * to the `element` variable directly -- in the case that it is an element.
             */
            try {
                element.addEventListener('keydown', keyDownListener);
                element.addEventListener('keyup', keyUpListener);
            }
            catch (e) {
                /** If we hit this catch block the assumption is that the passed `element` variable
                 * is a React ref whose `current` value just has not been set yet.  If this is not the case
                 * then the passed Element is not an EvertTarget.
                 */
            }
        }
        return () => {
            if (node) {
                node.addEventListener('keydown', keyDownListener);
                node.addEventListener('keyup', keyUpListener);
            }
            if (element) {
                try {
                    element.removeEventListener('keydown', keyDownListener);
                    element.removeEventListener('keyup', keyUpListener);
                }
                catch (e) {
                    /** This will error if the `element` variable given was not an EventTarget. */
                }
            }
        }
    }, [element]);
}

export default useKeyBind;