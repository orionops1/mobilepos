'use client'

import { useState } from 'react'

export default function TestClientPage() {
  const [clicked, setClicked] = useState(false)

  return (
    <div>
      <h1>Test Client Component</h1>
      <p>Clicked: {clicked ? 'Yes' : 'No'}</p>
      <button onClick={() => setClicked(!clicked)}>Toggle</button>
    </div>
  )
}
