import './app.css'
import {SvgContent} from "./TQ"
import TQ from './svg/TQ.svg?react'

export function App() {
  return (
    <div>
      Hello
      <SvgContent svg={TQ}>2</SvgContent>
    </div>
  )
}
