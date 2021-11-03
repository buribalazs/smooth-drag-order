export function smoothDragOrder(
    container: HTMLElement, 
    animationDurationSeconds: number = 0.2, 
    restoreOriginalNodeList:Boolean = false): { 
        destroy: () => void 
    }
