import {ImgHTMLAttributes} from "preact"

export function imgComp(src: string) {
  return () => <Img src={src}/>
}

export function Img(props: ImgHTMLAttributes) {
  return <img src={props.src}
              alt=""
              style={{height: '15mm', width: 'auto', objectFit: 'contain'}}
              {...props}
  />
}