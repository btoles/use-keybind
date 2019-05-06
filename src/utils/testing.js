import React, { useRef } from 'react';
import { CONTROL_KEYS, ALT_KEYS } from '../constants/keys';
import { toLower } from './';
import { fireEvent } from 'react-testing-library';
import useKeyBind from '../useKeyBind';

const ctrlKeys = CONTROL_KEYS.map(toLower);
const altKeys = ALT_KEYS.map(toLower);

export const TestComponent = ({keys, callback, element = null, ...props}) => {
    const keyRef = useRef();
    const bindings = keys.reduce((bindings, keys) => ({
        ...bindings,
        [keys]: callback,
    }), {})
    useKeyBind(element || keyRef, bindings);
    return <input ref={keyRef} data-testid="expected" {...props}/>
};

export const useCombination = (element, combo) => {
    /** (+) is keyDown, (-) is keyUp */
    const otherKeysRegex = /(\+|\-)(.[^\+|\-]*)/g
    const otherKeys = combo.match(otherKeysRegex);
    const firstKeyRegex = /([^\+|\-]*)/;
    const firstKey = combo.match(firstKeyRegex).pop();
    const modifiers = { ctrlKey: false, altKey: false, shiftKey: false };
    let keys = [ `+${firstKey}` ];
    if (otherKeys) {
        keys = [ ...keys, ...otherKeys ];
    }
    keys.forEach(keyCombo => {
        if (!keyCombo) return;
        const keyDirection = keyCombo.charAt(0);
        const key = keyCombo.substring(1);
        const isKeyDown = keyDirection !== '-';
        if (ctrlKeys.includes(key)) modifiers.ctrlKey = isKeyDown;
        if (altKeys.includes(key)) modifiers.altKey = isKeyDown;
        if (key === 'shift') modifiers.shiftKey = isKeyDown;

        const keyboardEvent = { key, ...modifiers };

        if (element) {
            if (isKeyDown) {
                fireEvent.keyDown(element, keyboardEvent);
            }
            else {
                fireEvent.keyUp(element, keyboardEvent);
            }
        }
    });
};