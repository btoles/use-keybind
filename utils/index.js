import { CONTROL_KEYS, ALT_KEYS } from '../constants/keys';

export const toLower = value => value.toLowerCase();
export const normalizeModifiers = modifiers => {
    const ctrlKeys = CONTROL_KEYS.map(toLower);
    const altKeys = ALT_KEYS.map(toLower);
    return modifiers.map(modifier => {
        if (ctrlKeys.includes(modifier)) return 'control';
        if (altKeys.includes(modifier)) return 'alt';
        return modifier;
    });
};