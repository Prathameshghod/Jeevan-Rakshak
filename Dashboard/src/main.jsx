import { StrictMode } from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App.jsx'
import { ContextProvider } from './contexts/ContextProvider'

ReactDOM.render(
  <StrictMode>
    <ContextProvider>
      <App />
    </ContextProvider>
  </StrictMode>,
  document.getElementById('root')
)
