import {Togglable} from "./togglable.tsx";

export function SelectionBar<T extends Record<string | number, any>, R extends keyof T>(props: {
  of: [T, R],
  values: readonly Exclude<T[R], undefined>[],
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
        return <Togglable of={[...props.of, type]}
                          selectedStyle={{
                            background: 'lightblue'
                          }}
                          style={{
                            flex: 1,
                            display: 'grid',
                            borderStyle: 'none',
                            ...corners
                          }}>
          <div style={{
            borderStyle: 'solid',
            borderColor: 'gray',
            borderWidth: 1,
            fontSize: '6mm',
            padding: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...corners,
          }}>{type}</div>
        </Togglable>;
      }
    )}
  </div>
}

