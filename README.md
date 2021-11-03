# Smooth Drag Order

- vertical dragging and reordering only
- mobile (touch screen) support
- Emits `change` event on reordering
- mixed heights are supported
- uses `MutationObserver` to keep up with children list changes. Will probably break if you change children list while the user is dragging though
- can be destroyed and reinitialized without event listener stacking or clashing
- great performance
- 1.3Kb minified and gzipped
- features *disgusting™* codestyle

## Browser support

| Internet Explorer | Edge   | Firefox | Chrome | Safari | Samsung browser |
|-------------------|--------|---------|--------|--------|-----------------|
| ❌                |✔️      |✔️      |   ✔️   | ✔️     | ✔️             |

Demo: https://codepen.io/buribalazs/pen/NWvReZN

## How to

This is an ES6 module

Install the package with `npm install @codeandsoda/smooth-drag-order`

### type declaration:
``` typescript
export function smoothDragOrder(
    container: HTMLElement, 
    animationDurationSeconds: number = 0.2, 
    restoreOriginalNodeList:Boolean = false): { 
        destroy: () => void 
    }
```

|argument|default|description|
|---|---|---|
|container| `undefined` | An element containing the draggable cards that all have an element inside them decorated with the `drag-handle` attribute
|animationDurationSeconds|`0.2` seconds|how long it takes for cards to move out of the way and to put a card back
|restoreOriginalNodeList|`false`|if `true` the original node list will be restored after a card is dropped. useful for reactive libraries like lit-element where reordering things breaks the rendering.

### considering you have the following markup:
```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Smooth Drag Order</title>
    <style>
        .my-draggables>div {
            /* PREVENT MARGIN COLLAPSE */
            border: 1px solid transparent;
        }

        .my-draggables>div>div {
            transition: transform 0.3s;
        }

        .my-draggables .dragged>div {
            /* .dragged ADDED BY SCRIPT */
            /* AVOID ADDING STYLES TO CONTAINERS CHILDREN. USE INNER ELEMENTS INSTEAD */
            transform: rotate(3deg);

        }

        [drag-handle] {
            margin: 0.3rem;
            width: 300px;
        }

        [drag-handle]>div {
            padding: 2rem;
            color: white;
            box-shadow: 0 3px 3px rgba(0, 0, 0, 0.3);
        }
    </style>
</head>

<body>

    <!-- THE CONTAINER -->
    <div class="my-draggables">

        <!-- LIST ITEM. DON'T STYLE. ADD ANY CUSTOM DATA FOR EASE OF USE -->
        <!-- EVERY ITEM MUST HAVE DRAG HANDLE INSIDE IT -->
        <div data-my="1">

            <!-- USE drag-handle ATTR TO MARK HANDLE -->
            <div drag-handle>
                <div style="background-color: red;">1</div>
            </div>
        </div>
        <div data-my="2">
            <div drag-handle>
                <div style="background-color: green;">2</div>
            </div>
        </div>
        <div data-my="3">
            <div drag-handle>
                <div style="background-color: blue;">3<br>is taller</div>
            </div>
        </div>
        <div data-my="4">
            <div drag-handle>
                <div style="background-color: orange;">4</div>
            </div>
        </div>
    </div>
    <br>

    <button id="stopit">stop it</button>
    <button id="startit">start it</button>
</body>
</html>
```

You can do:
```javascript
import { smoothDragOrder } from '@codeandsoda/smooth-drag-order'

const container = document.querySelector('.my-draggables')

let handle = smoothDragOrder(container, 0.2) //0.2 seconds animation duration

container.addEventListener('change', e => {
    console.log(
        Array.from(e.currentTarget.children)
        .map(el => el.dataset.my)
    )
})

document.getElementById('stopit').onclick = () => handle.destroy()
document.getElementById('startit').onclick = () => (handle = smoothDragOrder(container, 0.2))
```