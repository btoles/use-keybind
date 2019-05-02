import React, { useRef } from 'react';
import useKeyBind from './useKeyBind';
import { CONTROL_KEYS, ALT_KEYS } from './constants/keys';
import { toLower } from './utils';
import { render, fireEvent, cleanup } from 'react-testing-library';

const ctrlKeys = CONTROL_KEYS.map(toLower);
const altKeys = ALT_KEYS.map(toLower);

const TestCmp = ({keys, callback, element = null, ...props}) => {
    const keyRef = useRef();
    const bindings = keys.reduce((bindings, keys) => ({
        ...bindings,
        [keys]: callback,
    }), {})
    useKeyBind(element || keyRef, bindings);
    return <input ref={keyRef} data-testid="expected" {...props}/>
};

const useCombination = (element, combo) => {
    const shittyButItDoesTheTrickRegExp = /([.*?]*)(\+|\-)?([^(\+|\-)]+)/g;
    const modifiers = { ctrlKey: false, altKey: false, shiftKey: false };
    const matches = combo.match(shittyButItDoesTheTrickRegExp);
    matches.forEach(keyCombo => {
        let _key = '';
        for (let char of keyCombo) {
            if (!['+', '-'].includes(char)) {
                _key = _key + char;
            }
        }
        const keyDirection = keyCombo[0];
        const isKeyDown = keyDirection !== '-';
        if (ctrlKeys.includes(_key)) modifiers.ctrlKey = isKeyDown;
        if (altKeys.includes(_key)) modifiers.altKey = isKeyDown;
        if (_key === 'shift') modifiers.shiftKey = isKeyDown;

        const keyboardEvent = { key: _key, ...modifiers };

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

// TODO: update the tests to pass the proper structure to the components instead of mapping them from an array

describe('useKeyBind', () => {
    const callback = jest.fn();
    beforeEach(() => {
        jest.resetAllMocks();
        cleanup();
    });
    describe('should invoke the callback', () => {
        beforeEach(() => {
            cleanup();
        });
        it('should fire array of callbacks', () => {
            const cb = jest.fn();
            const { getByTestId } = render(<TestCmp keys={['a']} callback={[callback, cb]} />);
            useCombination(getByTestId('expected'), 'a');
            expect(cb).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenCalledTimes(1);
        });
        it('on match', () => {
            const { getByTestId } = render(<TestCmp keys={['a']} callback={callback} />);
            useCombination(getByTestId('expected'), 'a');
            expect(callback).toHaveBeenCalledTimes(1);
        });
        it('on document match', () => {
            const { getByTestId } = render(<TestCmp element={document} keys={['a']} callback={callback} />);
            useCombination(getByTestId('expected'), 'a');
            expect(callback).toHaveBeenCalledTimes(1);
        });
        it('with modifier only keybinds', () => {
            const { getByTestId } = render(<TestCmp keys={['control', 'alt', 'shift']} callback={callback} />);
            useCombination(getByTestId('expected'), 'ctrl');
            useCombination(getByTestId('expected'), 'alt');
            useCombination(getByTestId('expected'), 'shift');
            expect(callback).toHaveBeenCalledTimes(3);
        });
    })
    it('should respect modifier keys', () => {
        const { getByTestId } = render(<TestCmp keys={['control']} callback={callback} />);
        useCombination(getByTestId('expected'), 'ctrl');
        expect(callback).toHaveBeenCalledTimes(1);
    });
    it('should accept multiple keybinds', () => {
        const { getByTestId } = render(<TestCmp keys={['a', 'b']} callback={callback} />);
        useCombination(getByTestId('expected'), 'a+b');
        expect(callback).toHaveBeenCalledTimes(2);
    });
    it('should ignore invalid keys', () => {
        const { getByTestId } = render(<TestCmp keys={['control+a']} callback={callback} />);
        useCombination(getByTestId('expected'), 'ctrl+a');
        expect(callback).toHaveBeenCalledTimes(1);
    });
    it('should reset keybind on modifier key up', () => {
        const { getByTestId } = render(<TestCmp keys={['control+alt+a+d']} callback={callback} />);
        useCombination(getByTestId('expected'), 'ctrl+alt+a-alt+d');
        expect(callback).toHaveBeenCalledTimes(0);
    });
    describe('handle key releases', () => {
        beforeEach(() => {
            cleanup();
            jest.resetAllMocks();
        });
        it('should handle many', () => {
            const { getByTestId } = render(<TestCmp keys={['a+b+c+d']} callback={callback} />);
            useCombination(getByTestId('expected'), 'a+b+c-b+b+c-c+c+d');
            expect(callback).toHaveBeenCalledTimes(1);
        });
        it('should reset match to the key that has been released', () => {
            const { getByTestId } = render(<TestCmp keys={['a+b+c+d']} callback={callback} />);
            useCombination(getByTestId('expected'), 'a+b-b+c+d');
            expect(callback).toHaveBeenCalledTimes(0);
            
            useCombination(getByTestId('expected'), 'b+c+d');
            expect(callback).toHaveBeenCalledTimes(1);
        });
    });

    it.each([
        /** [keys, combo] */
        [['alt', 'opt', 'option'], 'alt'],
        [['ctrl', 'ctl', 'control'], 'control'],
        [['alt+z+2', 'opt+z+2', 'option+z+2'], 'opt+z+2'],
    ])('should ignore duplicate keybinds (%j)', (keys, combo) => {
        const { getByTestId } = render(<TestCmp keys={keys} callback={callback} />);
        useCombination(getByTestId('expected'), combo);
        expect(callback).toHaveBeenCalledTimes(1);
    });
});