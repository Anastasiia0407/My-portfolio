/** Characters in reading order, spaces excluded: the length of a RevealText reveal. */
export const revealLength = (text: string) => text.replaceAll(' ', '').length
