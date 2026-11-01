import { useEffect, useState } from 'react'
import './App.css'

type WeatherForecast = {
  date: string
  temperatureC: number
  temperatureF: number
  summary: string | null
}

function App() {
  const [forecasts, setForecasts] = useState<WeatherForecast[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/weatherforecast')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<WeatherForecast[]>
      })
      .then(setForecasts)
      .catch((err: Error) => setError(err.message))
  }, [])

  return (
    <main>
      <h1>Weather forecast</h1>
      {error && <p>Could not reach the API: {error}</p>}
      {!error && forecasts.length === 0 && <p>Loading…</p>}
      {forecasts.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Temp (°C)</th>
              <th>Temp (°F)</th>
              <th>Summary</th>
            </tr>
          </thead>
          <tbody>
            {forecasts.map((f) => (
              <tr key={f.date}>
                <td>{f.date}</td>
                <td>{f.temperatureC}</td>
                <td>{f.temperatureF}</td>
                <td>{f.summary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  )
}

export default App
