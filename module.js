export function smoothDragOrder(container, animationDurationSeconds = 0.2) {

    if (container.hasAttribute('smooth-drag-sort')) {
        container.__destroySmoothDragOrder()
    }
    container.__destroySmoothDragOrder = destroy

    const processedDraggables = new Set()
    const eventListenerMap = new Map()

    function raf(cb) { requestAnimationFrame(cb) }
    function getRect(el) { return el.getBoundingClientRect() }
    function style(el, name, val) { el.style[name] = val }
    const removeAttrFn = name => el => el.removeAttribute(name)
    const removeStyle = removeAttrFn('style')
    function addListener(target, eventName, cb) {
        target.addEventListener(eventName, cb)
        if (!eventListenerMap.has(target)) eventListenerMap.set(target, [])
        eventListenerMap.get(target).push({ eventName, cb })
    }


    style(container, 'overflow', 'hidden')
    container.setAttribute('smooth-drag-sort', '')
    const mutationObserver = new MutationObserver(updateDraggables)
    mutationObserver.observe(container, { childList: true })

    let target = null
    let puttingItBack = false
    let cursorOffset = 0
    let mouseY = null
    let touchY = null
    let height = 0
    let draggables = []
    let above = null
    let below = null
    let startIndex = 0

    function destroy() {
        delete container.__destroySmoothDragOrder
        mutationObserver.disconnect()
        Array.from(eventListenerMap.entries()).forEach(([target, listeners]) =>
            listeners.forEach(({ eventName, cb }) => target.removeEventListener(eventName, cb))
        )
        removeStyle(container)
        removeAttrFn('smooth-drag-sort')(container)
        Array.from(container.querySelectorAll('[drag-handle]')).forEach(removeAttrFn('draggable'))
        Array.from(container.children).forEach(removeStyle)

    }

    function getY() { return touchY ?? mouseY ?? null }
    function getMidLine() { return getY() + cursorOffset + height / 2 }

    function updateNeighbors() {
        const neighbor = offset => {
            const i = draggables.indexOf(target) + offset
            const n = draggables[i]
            if (n) {
                const o = {
                    el: n,
                    get midLine() {
                        const box = getRect(n)
                        return box.top + box.height / 2
                    }

                }
                return o
            }
            return null
        }
        above = neighbor(-1)
        below = neighbor(1)
    }

    function updateDraggables() {
        const oldDraggables = draggables
        draggables = Array.from(container.children)
        oldDraggables.filter(d => !draggables.includes(d)).forEach(d => {
            processedDraggables.delete(d)
            eventListenerMap.delete(d)
        })
        draggables.filter(d => !processedDraggables.has(d)).forEach(d => {
            processedDraggables.add(d)
            const handle = d.querySelector('[drag-handle]')
            handle.setAttribute('draggable', 'true')
            style(handle, 'touchAction', 'none')
            addListener(handle, 'dragstart', e => {
                start(d)
                e.preventDefault()
            })
            addListener(handle, 'touchmove', e => {
                const touch = e.touches[0]
                touchY = touch.clientY
                start(d)
                e.preventDefault()
            })
        })
    }


    function start(el) {
        const y = getY()
        if (puttingItBack || !!target || y === null || draggables.length < 2) return;
        target = el
        target.classList.add('dragged')
        startIndex = draggables.indexOf(el)
        const box = getRect(target)
        const elY = box.top
        cursorOffset = elY - y
        height = box.height

        style(container, 'height', getRect(container).height + 'px')
        style(target, 'z-index', 1)
        style(target, 'position', 'fixed')
        style(target, 'width', `${box.width}px`)
        style(target, 'pointerEvents', 'none')
        const bottomNeighbor = draggables[draggables.indexOf(el) + 1]
        if (bottomNeighbor) {
            style(bottomNeighbor, 'marginTop', `${height}px`)
        }
        updateNeighbors()
        frameLoop()
    }

    function stop() {
        if(!document.body.contains(container)){
            destroy()
            return
        }
        if (!target) return
        if (startIndex !== draggables.indexOf(target)) container.dispatchEvent(new Event('change'))
        target.classList.remove('dragged')


        style(target, 'pointerEvents', null)
        style(target, 'transition', `top ${animationDurationSeconds}s`)

        const y = getRect(container).top + draggables
            .slice(0, draggables.indexOf(target))
            .reduce((acc, val) => acc + getRect(val).height, 0)
        style(target, 'top', `${y}px`)

        puttingItBack = true
        const t = target
        setTimeout(() => {
            style(t, 'z-index', null)
            container.style.height = null
            puttingItBack = false
            draggables.forEach(removeAttrFn('style'))
            target = null
        }, animationDurationSeconds * 1000);

    }

    function frameLoop() {
        if (!target || puttingItBack) return;
        style(target, 'top', `${cursorOffset + (getY())}px`)
        const midLine = getMidLine()
        if (above && midLine < above.midLine) {
            container.insertBefore(target, above.el)
            handleMove(-1)
        } else if (below && midLine > below.midLine) {
            const belowBelow = draggables[draggables.indexOf(below.el) + 1]
            if (belowBelow) {
                container.insertBefore(target, belowBelow)
            } else {
                container.appendChild(target)
            }
            handleMove(1)

        }
        raf(frameLoop)
    }

    function handleMove(dir = 0) {
        const applyAnim = (el, dir) => {
            style(el, 'transition', null)
            style(el, 'transform', `translateY(${dir * height}px)`)
            raf(() => {
                style(el, 'transform', null)
                style(el, 'transition', `transform ${animationDurationSeconds}s`)
            })
        }
        raf(() => {
            if (below) {
                style(below.el, 'marginTop', 0)
                if (dir > 0) applyAnim(below.el, dir)
            }

            updateNeighbors()

            if (below) {
                style(below.el, 'marginTop', `${height}px`)
                if (dir < 0) applyAnim(below.el, dir)
            }
        })
    }

    addListener(window, 'mouseup', stop)
    addListener(window, 'touchend', stop)
    addListener(window, 'mousemove', e => mouseY = e.clientY)

    updateDraggables()


    return {
        destroy
    }
}