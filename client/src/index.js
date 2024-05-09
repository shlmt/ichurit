import React from 'react'
import ReactDOM from 'react-dom/client'
import reportWebVitals from './reportWebVitals'
import { PrimeReactProvider } from 'primereact/api'
import { Provider } from 'react-redux'
import store from './app/store'
import { BrowserRouter } from 'react-router-dom'
import 'primereact/resources/themes/mira/theme.css'
import 'primereact/resources/primereact.css'
import 'primeicons/primeicons.css'
import './index.css'
import App from './App'


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PrimeReactProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </PrimeReactProvider>
    </Provider>
  </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
