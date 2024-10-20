import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Chart from './Chart'
import TestUI from './TestingUI/TestUI'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <TestUI />
    </>
  )
}

export default App
