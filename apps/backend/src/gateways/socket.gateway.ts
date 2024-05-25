import { Logger, UseInterceptors } from '@nestjs/common'
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { WsLoggerInterceptor } from './logger.interceptor'
import { Prisma } from '@prisma/client'

type IBookingRequestData = Prisma.BookingGetPayload<{
  include: { Order: true; owner: true; vehicle: true; package: true }
}>

@WebSocketGateway(3002, { cors: { origin: 'http://localhost:3001/*' } })
@UseInterceptors(WsLoggerInterceptor)
export class SocketGateway implements OnGatewayInit {
  @WebSocketServer() server: Server

  private logger = new Logger(SocketGateway.name)

  afterInit(server: Server) {
    this.logger.log('Socket.IO initialized', server)
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() data: { room: string },
    @ConnectedSocket() client: Socket,
  ) {
    const roomName = data.room
    client.join(roomName)
    this.logger.log(`User has joined room ${roomName}`)
  }

  @SubscribeMessage('booking-request')
  handleBookingRequest(@MessageBody() data: IBookingRequestData): void {
    this.logger.log(`Received booking request from customer ${data.ownerId}`)
    // Emit to specific mechanic if applicable
    this.server.to(`mechanic-${data.mechanicId}`).emit('new-booking', data)
  }

  @SubscribeMessage('booking-acceptance')
  handleBookingAcceptance(@MessageBody() data: any): void {
    this.logger.log(
      `Booking accepted by mechanic ${data.mechanicId} for customer ${data.customerId}`,
    )
    // Notify the specific customer who made the booking
    this.notifyCustomer(
      data.customerId,
      `Your booking has been accepted by mechanic ${data.mechanicId}`,
    )
    // Additional handling could include updating the database to reflect the mechanic's acceptance
  }

  // Emit notification to all mechanics
  notifyMechanics(mechanicId: string, data: any): void {
    const roomName = `mechanic-${mechanicId}`
    this.server.to(roomName).emit('new-booking', data)
    console.log(`Notification sent to mechanic ${mechanicId}`)
  }

  // Notify a specific customer by their bookingId
  notifyCustomer(customerId: string, message: string): void {
    this.logger.log(
      `Booking accepted by mechanic` + `customer-${customerId}` + message,
    )
    this.server.to(`customer-${customerId}`).emit('booking-update', message)
  }
}
