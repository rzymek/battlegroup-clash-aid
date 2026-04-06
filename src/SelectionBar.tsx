import {ReactNode} from "preact/compat";
import {CSSProperties} from "preact";
import {Togglable} from "./togglable.tsx";
import {update} from "./state/update.ts";

export function SelectionBar<T extends Record<string | number, any>, R extends keyof T>(props: {
  of: [T, R],
  values: readonly Exclude<T[R], undefined>[],
  labels?: Partial<Record<T[R], ReactNode>>,
  styles?: Partial<Record<T[R], CSSProperties>>,
  required?: boolean,
}) {
  return <div style={{
    display: 'flex', gap: 0, flexDirection: 'row',
    borderCollapse: 'collapse',
  }}>
    {props.values.map((type, index, all) => {
        const corners = {
          ...(index === 0 ? {
            borderTopLeftRadius: 16,
            borderBottomLeftRadius: 16,
          } : {}),
          ...(index === all.length - 1 ? {
            borderTopRightRadius: 16,
            borderBottomRightRadius: 16,
          } : {}),
        };
        return <Togglable key={type}
                          of={[...props.of, type]}
                          selectedStyle={{
                            backgroundColor: 'lightblue'
                          }}
                          onClick={props.required ? update(() => props.of[0][props.of[1]] = type) : undefined}
                          style={{
                            flex: 1,
                            display: 'grid',
                            borderStyle: 'none',
                            minWidth: 0,
                            ...(props.styles?.[type] ?? {}),
                            ...corners
                          }}>
          <div style={{
            borderStyle: 'solid',
            borderColor: 'gray',
            borderWidth: 1,
            fontSize: type.length < 2 ? '7mm' : '4mm',
            padding: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 0,
            ...corners,
          }}>
            {props.labels?.[type] ?? type}
          </div>
        </Togglable>;
      }
    )}
  </div>
}
