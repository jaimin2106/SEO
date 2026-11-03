import type Lenis from "lenis";

let activeLenis: Lenis | undefined;

export const getLenisInstance = (): Lenis | undefined => activeLenis;

export const setLenisInstance = (lenis: Lenis | undefined): void => {
  activeLenis = lenis;
};