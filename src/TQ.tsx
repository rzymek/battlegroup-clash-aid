import {ComponentType, useCallback, useLayoutEffect, useRef} from "react";


export function SvgMut(props: {
  children?: (svg: SVGSVGElement) => void,
  svg: ComponentType<{}>
}) {
  const ref = useRef<SVGSVGElement>(null);
  const Svg = props.svg;
  useLayoutEffect(() => {
    if (props.children && ref.current) {
      props.children(ref.current);
    }
  }, [props.children]);
  return <Svg ref={ref}/>
}

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