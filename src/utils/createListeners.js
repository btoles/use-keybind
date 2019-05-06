import { CONTROL_KEYS, ALT_KEYS, MODIFIER_KEYS } from '../constants/keys';
import { normalizeModifiers, toLower } from './';

export default bindings => {
    const firstKeyRegex = /([^\+|\-]*)/;
    const otherKeysRegex = /(\+|\-)(.[^\+|\-]*)/g
    const ctrlKeys = CONTROL_KEYS.map(toLower);
    const altKeys = ALT_KEYS.map(toLower);
    const modifierKeys = MODIFIER_KEYS.map(toLower);
    const keyBinds = [];

    Object.entries(bindings).forEach(([rawBinding, callback]) => {
        const first = rawBinding.match(firstKeyRegex)[0];
        // Drop the "+" after finding our keys
        const otherMatches = rawBinding.match(otherKeysRegex) || [];
        const others = otherMatches.map(key => key.substring(1));
        const { keys, modifiers } = [first, ...others].reduce((acc, rawKey) => {
            const key = rawKey.toLowerCase();
            // split the keys from the modifier keys
            if (modifierKeys.includes(key)) {
                acc.modifiers.push(key);
            }
            else {
                acc.keys.push(key);
            }

            return acc;
        },
        {
            // the other keys in the binding
            keys: [],
            // the modifier keys in the binding
            modifiers: [],
        });

        const _combo = `${normalizeModifiers(modifiers).join('+')}+${keys.join('+')}`;
        const keyBind = {
            keys,
            nextKeyIdx: 0,
            lastKeyIdx: keys.length - 1,
            ctrlKey: modifiers.some(key => ctrlKeys.includes(key)),
            altKey: modifiers.some(key => altKeys.includes(key)),
            shiftKey: modifiers.some(key => key === 'shift'),
        };
        const keyBindExists = keyBinds.some(binding => binding._combo === _combo);

        if (keyBindExists) return;

        keyBinds.push({
            // only used to remove duplicate keybind definitions
            _combo,
            callback,
            keyBind,
        });
    });

    const keyDownListener = event => {
        keyBinds.forEach(({ callback, keyBind }) => {
            const key = event.key.toLowerCase();
            const { ctrlKey, altKey, shiftKey } = event;
            const isTerminal = keyBind.nextKeyIdx === keyBind.lastKeyIdx;
            const keyMatch = key === keyBind.keys[keyBind.nextKeyIdx];
            const invokeCb = () => {
                if (Array.isArray(callback)) {
                    callback.forEach(cb => {
                        if (typeof cb === 'function') {
                            cb();
                        }
                    });
                }
                else {
                    callback();
                }
            };
            if (
                altKey === keyBind.altKey && 
                ctrlKey === keyBind.ctrlKey &&
                shiftKey === keyBind.shiftKey
            ) {
                // Satisfy the case of a modifier key only keybinding
                if (keyBind.keys.length === 0) {
                    invokeCb();
                    return;
                }
                if (keyMatch) {
                    event.preventDefault();
                    // Last key in the binding
                    if (isTerminal) {
                        invokeCb();
                        return;
                    }
                    else {
                        // Advance next key pointer
                        keyBind.nextKeyIdx++;                        
                    }
                }
            }
        });
    }

    const keyUpListener = event => {
        keyBinds.forEach(({ keyBind }) => {
            const key = event.key.toLowerCase();
            const keysIdx = keyBind.keys.indexOf(key);
            /**
             * We should reset the next key pointer if a modifier key is let go.
             * Modifier keys, specifically ctrl+alt+shift, are always considered to be
             * "before" the other keys.
             */
            if (MODIFIER_KEYS.includes(key)) {
                keyBind.nextKeyIdx = 0;
            }
            // Check that the key is part of this keybind
            if (keysIdx > -1) {
                // Check that the key up events key comes before our key in the keybind
                if (keysIdx <= keyBind.nextKeyIdx) {
                    // Set the next key pointer to that key
                    keyBind.nextKeyIdx = keysIdx;
                }
            }
        });
    }

    return { keyDownListener, keyUpListener };
}