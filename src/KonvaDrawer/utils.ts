import { Size, Point } from "./constants";

export function throttle(timer: (callback: () => void) => void) {
  let queuedCallback: (() => void) | null;
  return (callback: any) => {
    if (!queuedCallback) {
      timer(() => {
        const cb = queuedCallback;
        queuedCallback = null;
        if (cb) cb();
      });
    }
    queuedCallback = callback;
  };
}

export const throttledWrite = throttle(requestAnimationFrame);

export function getDistance(p1: Point, p2: Point) {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

export function getCenter(p1: Point, p2: Point) {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2
  };
}

export function getNewPosition(
  position: Point,
  positionOffset: Point,
  size: Size,
  scale: number,
  zoom: number
) {
  const calculatePos = (pos: number, offset: number, containerSize: number) => {
    const newCoord = pos - offset * scale * zoom;
    const stageSize = containerSize * zoom;
    const axisOffset = newCoord + stageSize;

    let newPos = newCoord;

    console.log({ newCoord, stageSize, axisOffset });
    if (axisOffset < containerSize) {
      newPos = newCoord + (containerSize - axisOffset);
    }
    if (newPos > 0) {
      newPos = 0;
    }

    return newPos;
  };

  return {
    x: calculatePos(position.x, positionOffset.x, size.stageWidth),
    y: calculatePos(position.y, positionOffset.y, size.stageHeight)
  };
}

// old new position calculation
// const newX = newCenter.x - pointerOffset.x * newScale;
// const newY = newCenter.y - pointerOffset.y * newScale;
// const containerWidth = size!.w;
// const containerHeight = size!.h;
// const stageWidth = containerWidth * newScale;
// const stageHeight = containerHeight * newScale;
// const offsetX = newX + stageWidth;
// const offsetY = newY + stageHeight;

// const newPos = {
//   x: newX,
//   y: newY
// };

// if (offsetX < containerWidth) {
//   newPos.x = newX + (containerWidth - offsetX);
// }
// if (offsetY < containerHeight) {
//   newPos.y = newY + (containerHeight - offsetY);
// }

// if (newPos.x > 0) {
//   newPos.x = 0;
// }

// if (newPos.y > 0) {
//   newPos.y = 0;
// }
