export interface Offset {
  x: number;
  y: number;
}

export const getSeatLayouts = (seatCount: number, isMobile: boolean): Offset[] => {
  const layouts8: Offset[] = [
    isMobile ? { x: 70, y: 86 } : { x: 30, y: 90 }, // Seat 0 - Bottom left
    isMobile ? { x: 27, y: 86 } : { x: 5, y: 65 }, // Seat 1 - Left middle-bottom
    isMobile ? { x: 14, y: 66 } : { x: 5, y: 35 }, // Seat 2 - Left middle-top (symmetric with seat 6)
    isMobile ? { x: 16, y: 30 } : { x: 30, y: 5 }, // Seat 3 - Top left
    isMobile ? { x: 30, y: 7 } : { x: 70, y: 5 }, // Seat 4 - Top right
    isMobile ? { x: 70, y: 7 } : { x: 95, y: 35 }, // Seat 5 - Right middle-top (symmetric with seat 2)
    isMobile ? { x: 83, y: 30 } : { x: 95, y: 65 }, // Seat 6 - Right middle-bottom (symmetric with seat 1)
    isMobile ? { x: 85, y: 66 } : { x: 70, y: 90 }, // Seat 7 - Bottom right
  ];

  const layouts6: Offset[] = [
    isMobile ? { x: 50, y: 86 } : { x: 30, y: 90 },
    isMobile ? { x: 15, y: 70 } : { x: 0, y: 50 },
    isMobile ? { x: 17, y: 25 } : { x: 30, y: 5 },
    isMobile ? { x: 50, y: 7 } : { x: 70, y: 5 },
    isMobile ? { x: 82, y: 25 } : { x: 100, y: 50 },
    isMobile ? { x: 85, y: 70 } : { x: 70, y: 90 },
  ];

  return seatCount === 6 ? layouts6 : layouts8;
};

export const getChipOffsets = (seatCount: number, isMobile: boolean): Partial<Record<number, Offset>> => {
  if (seatCount === 6) {
    return isMobile
      ? { 0: { x: 0, y: -90 }, 1: { x: 60, y: -30 }, 2: { x: 60, y: 0 }, 3: { x: 0, y: 50 }, 4: { x: -60, y: 0 }, 5: { x: -60, y: -30 } }
      : { 0: { x: 0, y: -180 }, 1: { x: 140, y: 0 }, 2: { x: 0, y: 80 }, 3: { x: 0, y: 80 }, 4: { x: -140, y: 0 }, 5: { x: 0, y: -180 } };
  }
  return isMobile
    ? {
        0: { x: -30, y: -90 },
        1: { x: 30, y: -90 },
        2: { x: 70, y: 0 },
        3: { x: 70, y: 0 },
        4: { x: 20, y: 60 },
        5: { x: -20, y: 60 },
        6: { x: -70, y: 0 },
        7: { x: -70, y: 0 },
      }
    : {
        0: { x: 0, y: -180 },
        1: { x: 140, y: 0 },
        2: { x: 140, y: 0 },
        3: { x: 0, y: 80 },
        4: { x: 0, y: 80 },
        5: { x: -170, y: 0 },
        6: { x: -170, y: 0 },
        7: { x: 0, y: -180 },
      };
};

export const getHoleCardOffsets = (seatCount: number, isMobile: boolean): Partial<Record<number, Offset>> => {
  if (seatCount === 6) {
    return isMobile
      ? { 0: { x: 0, y: -100 }, 1: { x: 35, y: -80 }, 2: { x: 35, y: -50 }, 3: { x: 0, y: -30 }, 4: { x: -35, y: -50 }, 5: { x: -35, y: -80 } }
      : {
          0: { x: 20, y: -140 },
          1: { x: 50, y: -100 },
          2: { x: 20, y: -60 },
          3: { x: -20, y: -60 },
          4: { x: -50, y: -100 },
          5: { x: -20, y: -140 },
        };
  }
  return isMobile
    ? {
        0: { x: -20, y: -105 },
        1: { x: 20, y: -105 },
        2: { x: 35, y: -80 },
        3: { x: 35, y: -50 },
        4: { x: 20, y: -30 },
        5: { x: -20, y: -40 },
        6: { x: -35, y: -60 },
        7: { x: -35, y: -90 },
      }
    : {
        0: { x: 20, y: -160 },
        1: { x: 48, y: -140 },
        2: { x: 48, y: -100 },
        3: { x: 20, y: -80 },
        4: { x: -20, y: -80 },
        5: { x: -48, y: -100 },
        6: { x: -48, y: -140 },
        7: { x: -20, y: -160 },
      };
};
