export function smoothDragOrder(
    container: HTMLElement, 
    animationDurationSeconds: number, 
    restoreOriginalNodeList:Boolean): { 
        destroy: () => void 
    }
