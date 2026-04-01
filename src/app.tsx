import './app.css'
import TQ from './svg/TQ.svg?react'
import {SvgContent} from "./SvgContent.tsx";

export function App() {
  return (
    <div>
      Hello
      <div style={{height: '1cm', display: 'flex', background:'red'}}>
        <SvgContent svg={TQ}>6</SvgContent>
        <SvgContent svg={TQ}>5</SvgContent>
        <SvgContent svg={TQ}>4</SvgContent>
        <SvgContent svg={TQ}>3-</SvgContent>
      </div>
    </div>
  )
}
