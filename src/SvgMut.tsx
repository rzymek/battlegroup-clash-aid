import {ComponentType, useLayoutEffect, useRef} from "react";

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
  return <Svg ref={ref} />
}