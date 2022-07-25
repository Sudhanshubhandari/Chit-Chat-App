const generateMessage=(username,text)=>{
    return{
        username,
        text,
        createdAt:new Date().getTime()
    }
}

const generateloacationMessage=(username,url)=>{
    return{ 
        username,
        url,
        createdAt:new Date().getTime()
    }
}
module.exports={
    generateMessage,
    generateloacationMessage
}