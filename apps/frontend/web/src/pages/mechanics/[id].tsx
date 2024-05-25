import io, { Socket } from 'socket.io-client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'

const Mechanics = () => {
  const [bookings, setBookings] = useState<any[]>([])
  const router = useRouter()
  const { id: mechanicId } = router.query
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    if (!mechanicId) {
      return
    }

    const newSocket = io('http://localhost:3002', {
      query: { mechanicId },
    })

    setSocket(newSocket)

    newSocket.on('connect', () => {
      console.log(`Connected to server as mechanic: ${mechanicId}`)
      newSocket.emit('joinRoom', { room: `mechanic-${mechanicId}` })
    })

    newSocket.on('new-booking', (booking: any) => {
      console.log('New booking received:', booking)
      setBookings((prevBookings) => [...prevBookings, booking])
    })

    newSocket.on('booking-accepted', (data) => {
      setBookings((prevBookings) =>
        prevBookings.filter((booking) => booking.bookingId !== data.bookingId),
      )
    })

    return () => {
      newSocket.off('connect')
      newSocket.off('new-booking')
      newSocket.off('booking-accepted')
      newSocket.disconnect()
    }
  }, [mechanicId])

  const handleAccept = async (booking: any) => {
    console.log(
      `Accepting booking ${booking.bookingId} for customer ${booking.ownerId}`,
    )
    if (socket) {
      socket.emit('booking-acceptance', {
        mechanicId,
        bookingId: booking.bookingId,
        customerId: booking.ownerId,
      })
    } else {
      console.log('Socket not connected.')
    }

    try {
      console.log(booking)
      const req = await axios.post(
        `http://localhost:3000/api/v1/booking/accept/${booking.id}`,
        {
          mechanicId,
        },
      )

      console.log(req)
    } catch (error) {
      console.error(
        'Could Not Send The Booking Acceptance Notification to Customer',
        error,
      )
    }
  }

  return (
    <div>
      <h1>Mechanics Dashboard</h1>
      {bookings.map((booking, index) => (
        <div key={index}>
          <p>Booking from Customer ID: {booking.ownerId}</p>
          <button onClick={() => handleAccept(booking)}>Accept Booking</button>
        </div>
      ))}
    </div>
  )
}

export default Mechanics
