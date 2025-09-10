export function socketMain(client){
    console.log("connected")
    client.on("newPatient", function(data){
        console.log(data, "socket data");
        client.broadcast.emit('newPatient',data);
    })
}