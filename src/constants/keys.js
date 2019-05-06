/** 
 * Others may be supported in the future.
 * https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent
 */

export const ALT_KEYS = [    
    // Actual KeyboardEvent `key`s
    'Alt',
    // Aliases for the above keys
    'option', // alt
    'opt', // alt
];
export const CONTROL_KEYS = [    
    // Actual KeyboardEvent `key`s
    'Control',
    // Aliases for the above keys
    'ctrl',
    'ctl',
];
export const MODIFIER_KEYS = [
    ...ALT_KEYS,
    ...CONTROL_KEYS,
    // Actual KeyboardEvent `key`s
    'Shift',
];