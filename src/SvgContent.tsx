import {ComponentType, useCallback} from "react";
import {SvgMut} from "./SvgMut.tsx";

export function SvgContent(props: {
  e?: string,
  children?: string | number,
  svg: ComponentType<{}>
}) {
  const selector = props.e ?? 'tspan';
  return <SvgMut svg={props.svg}>{useCallback(svg => {
    svg.querySelector(selector)!.textContent = String(props.children);
  }, [props.children])}</SvgMut>
}