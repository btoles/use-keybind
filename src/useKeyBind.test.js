import React, { useRef } from 'react';
import { render, cleanup } from 'react-testing-library';
import { useCombination, TestComponent } from './utils/testing';

const FUNCTION_KEYS = new Array(20).fill(0, 0, 20).map((x, i) => `F${i+1}`);
const NUMERIC_KEYPAD_KEYS = ['0','1','2','3','4','5','6','7','8','9','.','*','+','-','/'];

describe('useKeyBind', () => {
    const callback = jest.fn();
    beforeEach(() => {
        jest.resetAllMocks();
        cleanup();
    });
    describe('should invoke the callback', () => {
        it('should fire array of callbacks', () => {
            const cb = jest.fn();
            const { getByTestId } = render(<TestComponent keys={['a']} callback={[callback, cb]} />);
            useCombination(getByTestId('expected'), 'a');
            expect(cb).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenCalledTimes(1);
        });
        it('on match', () => {
            const { getByTestId } = render(<TestComponent keys={['a']} callback={callback} />);
            useCombination(getByTestId('expected'), 'a');
            expect(callback).toHaveBeenCalledTimes(1);
        });
        it('on document match', () => {
            const { getByTestId } = render(<TestComponent element={document} keys={['a']} callback={callback} />);
            useCombination(getByTestId('expected'), 'a');
            expect(callback).toHaveBeenCalledTimes(1);
        });
        it('with modifier only keybinds', () => {
            const { getByTestId } = render(<TestComponent keys={['control', 'alt', 'shift']} callback={callback} />);
            useCombination(getByTestId('expected'), 'ctrl');
            useCombination(getByTestId('expected'), 'alt');
            useCombination(getByTestId('expected'), 'shift');
            expect(callback).toHaveBeenCalledTimes(3);
        });
    })
    it('should accept multiple keybinds', () => {
        const { getByTestId } = render(<TestComponent keys={['a', 'b']} callback={callback} />);
        useCombination(getByTestId('expected'), 'a+b');
        expect(callback).toHaveBeenCalledTimes(2);
    });
    it('should ignore invalid keys', () => {
        const { getByTestId } = render(<TestComponent keys={['control+a']} callback={callback} />);
        useCombination(getByTestId('expected'), 'ctrl+t+e+w+a');
        expect(callback).toHaveBeenCalledTimes(1);
    });

    describe('handle key releases', () => {
        it('should handle many key presses and releases', () => {
            const { getByTestId } = render(<TestComponent keys={['a+b+c+d']} callback={callback} />);
            useCombination(getByTestId('expected'), 'a+b+c-b+b+c-c+c+d');
            expect(callback).toHaveBeenCalledTimes(1);
        });
        /** Negative Test */
        it('should reset keybind on modifier key up', () => {
            const { getByTestId } = render(<TestComponent keys={['control+alt+a+d']} callback={callback} />);
            useCombination(getByTestId('expected'), 'ctrl+alt+a-alt+d');
            expect(callback).toHaveBeenCalledTimes(0);
        });
        /** Positive Test */
        it('should reset match to the key that has been released', () => {
            /** 
             * Example: `alt+shift+z` were pressed and then `shift` was released;
             *           now it's as if the user has only  pressed the `alt` key.
             */
            const { getByTestId } = render(<TestComponent keys={['a+b+c+d']} callback={callback} />);
            useCombination(getByTestId('expected'), 'a+b-b+c+d');
            expect(callback).toHaveBeenCalledTimes(0);
            
            useCombination(getByTestId('expected'), 'b+c+d');
            expect(callback).toHaveBeenCalledTimes(1);
        });
    });

    it.each(NUMERIC_KEYPAD_KEYS)('should accept common numeric keypad keys (%s)', key => {
        const { getByTestId } = render(<TestComponent keys={[key]} callback={callback} />);
        useCombination(getByTestId('expected'), key);
        expect(callback).toHaveBeenCalledTimes(1);
    });

    it.each(FUNCTION_KEYS)('should accept function keys (%s)', key => {
        const { getByTestId } = render(<TestComponent keys={[key]} callback={callback} />);
        useCombination(getByTestId('expected'), key);
        expect(callback).toHaveBeenCalledTimes(1);
    });

    it.each([
        /** [keys, combo] */
        [['alt', 'opt', 'option'], 'alt'],
        [['ctrl', 'ctl', 'control'], 'control'],
        [['alt+z+2', 'opt+z+2', 'option+z+2'], 'opt+z+2'],
    ])('should ignore duplicate keybinds (%j)', (keys, combo) => {
        const { getByTestId } = render(<TestComponent keys={keys} callback={callback} />);
        useCombination(getByTestId('expected'), combo);
        expect(callback).toHaveBeenCalledTimes(1);
    });
});