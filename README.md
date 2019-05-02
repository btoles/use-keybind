# useKeyBind

## TODO

## Usage
### `useKeyBind(element, bindings)`
#### Parameters
* **element/ref** *{EventTarget}* - An [EventTarget](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget) or a `React.createRef()` to apply keybindings.

* **bindings** *{object}* - An object that maps keybindings to their respective functions.
```js
{
    // binding: callbackFn or callbackFn[]
    'ctrl+t': onOpenTab,
    'ctrl+shift+s': [onSave, onSubmit],
    'ctrl+f': () => inputRef.focus(),
}
```

## Example
```jsx
import { useKeyBind } from 'use-keybind';

function AdminPage() {
    const onSave = () => {/* ... */}
    const onSubmit = () => {/* ... */}
    const adminRef = useRef();

    useKeyBind(adminRef, {
        'ctrl+s': onSave, 
        'alt+s': onSave,
        'ctrl+shift+s': [onSave, onSubmit],
    });

    return (
        <Admin ref={adminRef}>
            <UserInfoSection>
                <Form name='user-info'>
                    {/* ... */}
                </Form>
            </UserInfoSection>
        </Admin>
    );
}
```

### Supported Keys
https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values