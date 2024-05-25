import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import io from 'socket.io-client'

const Customers = () => {
  const [response, setResponse] = useState('')
  const router = useRouter()
  const { id: customerId } = router.query // `id` from URL parameters

  useEffect(() => {
    if (!customerId) {
      return // Do not proceed until customerId is defined
    }

    // Create a new socket connection
    const socket = io('http://localhost:3002', {
      query: { customerId },
    })

    socket.on('connect', () => {
      console.log(`Connected to server as customer: ${customerId}`)
      // Emit a join room event or similar to subscribe to updates for this customer
      console.log(customerId)
      socket.emit('joinRoom', { room: `customer-${customerId}` })
    })

    // Setup event listener for booking updates
    socket.on('booking-update', (message) => {
      console.log(message)
      setResponse(message)
    })

    // Cleanup function to run when the component unmounts or customerId changes
    return () => {
      socket.off('booking-update')
      socket.disconnect()
    }
  }, [customerId]) // Re-run useEffect when customerId changes

  const handleBookingRequest = () => {
    // Check for customerId before sending a request
    if (customerId) {
      // Emit a 'booking-request' event with customer data to the server
      io('http://localhost:3002').emit('booking-request', { customerId })
    }
  }

  return (
    <div>
      <h1>Customer&apos;s Dashboard</h1>
      <button onClick={handleBookingRequest}>Request Mechanic</button>
      <p>Response: {response}</p>
    </div>
  )
}

export default Customers
