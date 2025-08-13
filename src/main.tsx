import {render} from "preact"
import {App} from "./app.tsx"
import "./index.css"
import {update} from "./state/update.ts"

const app = document.getElementById('app');

export function rerender() {
    app && render(<App/>, app)
}

update.onUpdate.push(rerender);
rerender();
