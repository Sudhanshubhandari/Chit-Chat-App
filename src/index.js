const path=require('path')
const http=require('http')
const express=require('express')
const socketio=require('socket.io')
const Filter=require('bad-words')
const {generateMessage,generateloacationMessage}=require('./utils/messages')
const {addUser,removeUser,getUser,getUserInRoom }=require('./utils/users')


const app=express()
const server=http.createServer(app)
const io=socketio(server)//socket io expect server with raw http thats why we create server

const port=process.env.PORT||3000

const publicDirectoryPath=path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))  //use whatever is in public publicDirectoryPath
let count=0
//server(emits)->client(receive)-countupdated
//client(emit)->server(receive)-increment

//PART !

// io.on('connection',(socket)=>{
//     console.log('New Websocket Connection')

//  socket.emit('countUpdated',count)// emit() to send a message to all the connected clients

//  socket.on('increment',()=>{
//     count++
//     // socket.emit('countUpdated',count) if you increment this in one tab ,in other tab it will not automaticaaly updated this is problem ,basically it emits the event to the specific connection

//     //to resolve this
//     io.emit('countUpdated',count)//emits the data to the all connections
//  })
// })


//PART 2


io.on('connection',(socket)=>{ //connection run when the client is connected
    console.log('New Websocket Connection')
 
//  socket.emit('message',generateMessage('Welcome'))// emit() to send a message to all the connected clients
//  socket.broadcast.emit('message',generateMessage('A new user Joined'))//Apart from this user,all other connection will get thi message

socket.on('join',({username,room},callback)=>{
    const {error,user}=addUser({id:socket.id,username,room})

    if(error){
        return callback(error)
    }
    socket.join(user.room)//allows us to join the room
    //io.to.emit->it emits the message everyone to the room
    //socket.broadcast.to.emit->send to everyone except to specific  client
    socket.emit('message',generateMessage('Admin','Welcome!'))// emit() to send a message to all the connected clients
    socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined`))//Apart from this user,all other connection will get thi message
    io.to(user.room).emit('roomData',{
        room:user.room,
        users:getUserInRoom(user.room)
    })
    callback()
})

socket.on('sendMessage',(message,callback)=>{
    const user=getUser(socket.id)
    const filter=new Filter()
    if(filter.isProfane(message)){
        return callback('Profanity is not allowed')
    }
   io.to(user.room).emit('message',generateMessage(user.username,message))
   callback()
})



socket.on('sendLocation',(coords,callback)=>{
    const user=getUser(socket.id)
    // io.emit('message',`Location:${coords.latitude},${coords.longitude}`)
    io.to(user.room).emit('locationMessage',generateloacationMessage(user.username,`http://google.com/maps?q=${coords.latitude},${coords.longitude}`))
    callback()
})
   //Whenever the client get disconnected , 


   socket.on('disconnect'/*buildin function*/,()=>{  //socket.on send only to that particular connection

    const user=removeUser(socket.id)
if(user){
    io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left!`))
    io.to(user.room).emit('roomData',{
        room:user.room,
        users:getUserInRoom(user.room)
    })
}  
   })    

})

 

server.listen(port,()=>{
    console.log("Server is up on port "+ port)
})