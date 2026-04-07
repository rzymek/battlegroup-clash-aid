import {CSSProperties, ImgHTMLAttributes} from "preact"
import {interactiveAreaSize} from "./interactiveAreaSize.tsx";

export function imgComp(src: string) {
  return () => <Img src={src}/>
}

export function Img(props: Omit<ImgHTMLAttributes, 'style'> & { style?: CSSProperties }) {
  const {style = {}, ...rest} = props;
  return <img alt=""
              style={{height: interactiveAreaSize, width: 'auto', objectFit: 'contain', ...style}}
              {...rest}
  />
}