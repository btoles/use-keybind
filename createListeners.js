import { CONTROL_KEYS, ALT_KEYS, MODIFIER_KEYS } from './constants/keys';
import { normalizeModifiers, toLower } from './utils';

export default bindings => {
    const ctrlKeys = CONTROL_KEYS.map(toLower);
    const altKeys = ALT_KEYS.map(toLower);
    const modifierKeys = MODIFIER_KEYS.map(toLower);
    const keyBinds = [];

    Object.entries(bindings).forEach(([rawBinding, callback]) => {
        const { keys, modifiers } = rawBinding
            .split('+')
            .reduce((acc, rawKey) => {
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
                // the keys in the binding
                keys: [],
                // the modifier keys in the binding
                modifiers: [],
            }
        );
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
            // console.log('altKey === keyBind.altKey', altKey , keyBind.altKey);
            // console.log('ctrlKey === keyBind.ctrlKey', ctrlKey, keyBind.ctrlKey);
            // console.log('shiftKey === keyBind.shiftKey', shiftKey, keyBind.shiftKey);
            if (
                // TODO: 🤔 Update this to possilby query getModifierState()
                // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/getModifierState
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
                    if (isTerminal) {
                        invokeCb();
                        return;
                    }
                    else {
                        keyBind.nextKeyIdx++;                        
                    }
                }
            }
        });
        event.preventDefault();
    }

    const keyUpListener = event => {
        keyBinds.forEach(({ keyBind }) => {
            const key = event.key.toLowerCase();
            const keysIdx = keyBind.keys.indexOf(key);
            if (MODIFIER_KEYS.includes(key)) {
                keyBind.nextKeyIdx = 0;
            }
            if (keysIdx > -1) {
                if (keysIdx <= keyBind.nextKeyIdx) {
                    keyBind.nextKeyIdx = keysIdx;
                }
            }
        });
        event.preventDefault();
    }

    return { keyDownListener, keyUpListener };
}