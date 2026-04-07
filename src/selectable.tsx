import {ReactNode} from 'preact/compat';
import {CSSProperties} from "preact";
import {interactiveAreaSize} from "./interactiveAreaSize.tsx";

const defaultSelectedStyle: CSSProperties = {
  borderColor: 'blue',
}

export function Selectable(props: {
  selected?: boolean;
  onClick?: () => void,
  children?: ReactNode,
  style?: CSSProperties,
  selectedStyle?: CSSProperties,
}) {
  const {selectedStyle = defaultSelectedStyle} = props;
  return <div style={{
    height: interactiveAreaSize,
    display: 'inline-flex',
    borderStyle: 'solid',
    borderWidth: 3,
    borderColor: 'transparent',
    borderRadius: 6,
    userSelect: 'none',
    ...(props.style ?? {}),
    ...(props.selected ? selectedStyle : {}),
  }} onClick={props.onClick}>{props.children}</div>
}