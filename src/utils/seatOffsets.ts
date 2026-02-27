import { useIsMobile } from "../hooks/useIsMobile";

export interface Offset {
  x: number;
  y: number;
}

const degToRad = (deg: number) => (deg * Math.PI) / 180;

export const getSeatLayouts = (seatCount: number): Offset[] => {
  const center = 50;
  const radius = 50;
  const isMobile = useIsMobile();

  return Array.from({ length: seatCount }, (_, i) => {
    let angleDeg = (90 + (360 / seatCount) * i) % 360;
    const angle = degToRad(angleDeg);

    let x = center + radius * Math.cos(angle);
    let y = center + radius * Math.sin(angle);
    if (isMobile) {
      if (angleDeg > 0 && angleDeg < 90) {
        x += 8;
        y += 4;
      }
      if (angleDeg > 90 && angleDeg < 180) {
        x -= 8;
        y += 4;
      }
      if (angleDeg > 180 && angleDeg < 270) {
        x += -8;
        y += -4;
      }
      if (angleDeg > 270 && angleDeg < 360) {
        x += 8;
        y -= 4;
      }
    } else {
      if (angleDeg > 0 && angleDeg < 90) {
        x += 0;
        y += 4;
      }
      if (angleDeg > 90 && angleDeg < 180) {
        x += 0;
        y += 4;
      }
      if (angleDeg > 180 && angleDeg < 270) {
        x += 0;
        y += -4;
      }
      if (angleDeg > 270 && angleDeg < 360) {
        x += 0;
        y -= 4;
      }
    }

    return { x, y };
  });
};
export const getChipOffsets = (seatCount: number): Partial<Record<number, Offset>> => {
  const chipDistance = 12;

  return Object.fromEntries(
    Array.from({ length: seatCount }, (_, i) => {
      const angle = degToRad(90 + (360 / seatCount) * i);
      return [i, { x: -Math.cos(angle) * chipDistance, y: -Math.sin(angle) * chipDistance }];
    }),
  );
};

export const getHoleCardOffsets = (seatCount: number): Partial<Record<number, Offset>> => {
  const cardDistance = 18;

  return Object.fromEntries(
    Array.from({ length: seatCount }, (_, i) => {
      const angle = degToRad(90 + (360 / seatCount) * i);
      return [i, { x: -Math.cos(angle) * cardDistance, y: -Math.sin(angle) * cardDistance }];
    }),
  );
};
