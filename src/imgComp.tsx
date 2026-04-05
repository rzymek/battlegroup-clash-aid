import {ImgHTMLAttributes} from "preact"

export function imgComp(src: string) {
  return () => <Img src={src}/>
}

export function Img(props: ImgHTMLAttributes) {
  const {style={}, ...rest} = props;
  return <img alt=""
              style={{height: '15mm', width: 'auto', objectFit: 'contain', ...style}}
              {...rest}
  />
}