//Client server


//Elements

const $messageForm=document.querySelector('#message-form')
const $messageFormInput=$messageForm.querySelector('input')
const $messageFormButton=$messageForm.querySelector('button')
const $sendLocationButton=document.querySelector('#send-location')
const $message=document.querySelector('#messages')

//Template
const messageTemplate=document.querySelector('#message-template').innerHTML
const locationMessageTemplate=document.querySelector('#location-message-template').innerHTML
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML

//options
const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})// to grab the value of room and username
const autoscroll=()=>{
    //new message here
    
    const $newMessage=$message.lastElementChild //will grab the newest message
    //height of new messsage
 const newMessageStyles=getComputedStyle($newMessage)

    // const newMessageHeight=$newMessage.offsetHeight//see by checking it in brower console
    const newMessageMargin=parseInt(newMessageStyles.marginBottom)
    const newMessageHeight=$newMessage.offsetHeight+newMessageMargin
    // console.log(newMessageStyles)

    //  console.log(newMessageMargin)

    //Visible height
    const visibleHeight=$message.offsetHeight

    //height of messages container
    const containerHeight=$message.scrollHeight

    //How far did u scroll
    const scrollOffset=$message.scrollTop + visibleHeight// how much you have scroled from the top

    if(containerHeight-newMessageHeight<=scrollOffset){
        $message.scrollTop=$message.scrollHeight


    }
}

// io()//to connect to the server

const socket=io()// this will allow us to send and recieve events

//socket.on is used to recieve events

//PART 1

// socket.on('countUpdated'/*same as used in emit*/,(count)=>{
//     console.log('The count has been updated',count)
// })

// //to made changes in main server
// document.querySelector('#increment').addEventListener('click',()=>{
//     console.log('Clicked')
//     socket.emit('increment')
// })

//PART 2

socket.on('message'/*same as used in emit*/,(message)=>{
    console.log(message)


    const html=Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:/*message.createdAt*/ moment(message.createdAt).format('h:mm a')//refer moment documentation
    })
    $message.insertAdjacentHTML('beforeend',html)
    //to autoscrol chat
    autoscroll()
})



socket.on('locationMessage',(message)=>{
    console.log(message)
        const html=Mustache.render(locationMessageTemplate,{
            username:message.username,
        url:message.url,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $message.insertAdjacentHTML('beforeend',html)

})

socket.on('roomData',({room,users})=>{
    // console.log(room)
    // console.log(users)
    const html=Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML=html

})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()//To prevent default behavior ,i.e)stops autorefresh of the page

    //To dissable button after one use,TO AVOID SPAM

    $messageFormButton.setAttribute('disabled','disabled')

    // const message=document.querySelector('input').value
    //or
    const message=e.target.elements.message.value
    socket.emit('sendMessage',message,/*(message)*/(error)=>{
        // enabling send button after the msg is send
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=''//after sending message input bar become clear
        $messageFormInput.focus()// takes the cursor again to start
        // console.log('The message was Delivered ',message)
        if(error){
            return console.log(error)
        }
        console.log('Message Delivered')
    })

})

$sendLocationButton.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }

    $sendLocationButton.setAttribute('disabled','disabled')
    //To fetch location 
    navigator.geolocation.getCurrentPosition((position)=>{
        // console.log(position)
        socket.emit('sendLocation',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },()=>{
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared')
        })
    })
})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href='/' //to redirect the site
    }

})

