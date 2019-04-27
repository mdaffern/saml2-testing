export function getOctets(str) {
  let i = 0;
  const octets: number[] = [];
  let codePoint;

  while (codePoint = str.codePointAt(i++)) {
    if (codePoint > 2 ** 16) {
      for (let j = 0; j < 4; j++) {
        octets.push((codePoint >> (8 * j)) & 255);
      }
      i++;
    } else if (codePoint > 255) {
      octets.push((codePoint >> 8) & 255);
      octets.push(codePoint & 255);
    } else {
      octets.push(codePoint);
    }
  }
  return octets;
}
