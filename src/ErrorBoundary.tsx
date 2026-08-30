import {Component, ComponentChildren} from 'preact';
import {serializeError} from 'serialize-error';
import {state} from "./state/state.tsx";

interface Props {
  children: ComponentChildren;
}

interface State {
  error: ReturnType<typeof serializeError> | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = {error: null};

  componentDidCatch(error: unknown) {
    this.setState({error: serializeError(error)});
  }

  render() {
    const {error} = this.state;
    if (error) {
      return (
        <div style={{padding: 16, fontFamily: 'monospace', color: '#c00'}}>
          <strong>Error: {error.message}</strong>
          <button style={{margin: 8, padding: 6}} onClick={() => window.location.reload()}>Reset</button>
          <pre>State: {JSON.stringify(state, null, 2)}</pre>
          {error.stack && <pre style={{fontSize: 12, marginTop: 8, whiteSpace: 'pre-wrap'}}>{error.stack}</pre>}
        </div>
      );
    }
    return this.props.children;
  }
}
