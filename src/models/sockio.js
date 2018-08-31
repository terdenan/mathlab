const asyncHandler = require('express-async-handler');
const socket_io = require('socket.io');
const MessageModel = require('./messages');
const ObjectId = require('mongodb').ObjectID;

const messageModel = new MessageModel();

module.exports = (server) => {
    const io = socket_io(server);

    io.on('connection', function(socket){
        socket.on('setRoom', function(courseId){
            socket.join(courseId);
        });
        socket.on('sendMessage', function(data){
            socket.broadcast.to(data.courseId).emit('newMessage', data.message);
        });
        socket.on('accepted', async function(data){
            const message_id = ObjectId(data._message_id);
            await messageModel.update(
                {_id: message_id},
                { read_state: true }
            );
            socket.broadcast.to(data.courseId).emit('markReaded');
        });
    });

    return io;
}