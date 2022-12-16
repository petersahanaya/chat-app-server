import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'

const app = express()
app.use(cors())

const server = createServer(app)
const io = new Server(server, {
	cors : {origin : ["http://localhost:5173"]}
})

		let clients = []
		let clientsRoom = []

        io.on('connection', (socket) => {
			console.log("User with " + socket.id + " has join")
			socket.on("on-join", (data) => {
				clients.push({username : data.senderName, socketId : socket.id, id : data.senderId, image : data.senderImg})	
				socket.join(data.senderId)
			})

			socket.on('room-join', (data) => {
				clientsRoom.push({...data, socketId : socket.id})
				console.log(data)
				socket.join(data.roomId)

				socket.emit('on-room', `${data.senderName} has join the room...`)
				console.log(clientsRoom, "Client Pushed..")
			})

			socket.on("room-msg", (data) => {
				console.log(data)
				socket.to(data.roomId).emit("send-room", data)
			})

			socket.emit('clients', clients)

			socket.on('on-msg', (data) => {
				console.log(data.image)
				const senders = {
					senderName : data.senderName,
					senderImg : data.image,
					senderMsg : data.senderMsg,
					receiverId : data.receiverId,			
					date : data.date		
				}

				socket.to(data.receiverId).emit('send-msg', senders)
			})

			socket.on('disconnect', () => {
				clients = clients.filter((s) => s.socketId !== socket.id)
				socket.emit('clients', clients)
				clientsRoom = clientsRoom.filter((s) => s.socketId !== socket.id)
			})

})

server.listen(process.env.PORT || 3000)