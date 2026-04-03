export function imgComp(src: string) {
  return () => <img src={src} alt="" style={{height: '15mm', width: 'auto', objectFit: 'contain'}}/>
}