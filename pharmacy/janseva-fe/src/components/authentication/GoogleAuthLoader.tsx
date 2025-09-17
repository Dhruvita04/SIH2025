import { useState, useEffect } from 'react'

export default function GoogleAuthLoader() {
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState('Connecting to Google...')
  const colors = ['#4285F4', '#34A853', '#FBBC05', '#EA4335'] // Google colors

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 100) {
          clearInterval(timer)
          return 100
        }
        const diff = Math.random() * 10
        return Math.min(oldProgress + diff, 100)
      })
    }, 500)

    return () => {
      clearInterval(timer)
    }
  }, [])

  useEffect(() => {
    const messages = [
      'Connecting to Google...',
      'Verifying credentials...',
      'Securing your session...',
      'Almost there...',
    ]
    const messageTimer = setInterval(() => {
      setMessage(messages[Math.floor(Math.random() * messages.length)])
    }, 2000)

    return () => {
      clearInterval(messageTimer)
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full">
      <div className="w-80 space-y-8 text-center">
        <div className="flex justify-center space-x-2">
          {colors.map((color, index) => (
            <div
              key={color}
              className="w-4 h-4 rounded-full animate-bounce"
              style={{ 
                backgroundColor: color,
                animationDelay: `${index * 0.2}s`
              }}
            />
          ))}
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Google Authentication</h1>
        <p className="text-gray-600">{message}</p>
        <div className="relative pt-1">
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
            <div 
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}