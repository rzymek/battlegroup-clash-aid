import {ReactNode} from 'react';
import {CSSProperties} from "preact";

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
    height: '15mm',
    display: 'inline-flex',
    borderStyle: 'solid',
    borderWidth: 3,
    borderColor: 'transparent',
    borderRadius: 6,
    userSelect: 'none',
    ...(props.selected ? selectedStyle : {}),
    ...(props.style ?? {}),
  }} onClick={props.onClick}>{props.children}</div>
}