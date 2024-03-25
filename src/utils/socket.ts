import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';

import { WEB_PORT } from '../config';
import logger from './logger';

interface ServerToClientEvents {
    participants: (sids: string[]) => void;
    offer: (sdp: RTCSessionDescriptionInit, sid: string) => void;
    answer: (sdp: RTCSessionDescriptionInit, sid: string) => void;
    candidate: (candidate: RTCIceCandidate, sid: string) => void;
}

interface ClientToServerEvents {
    join: (meetingId: string) => void;
    offer: (sdp: RTCSessionDescriptionInit, sid: string) => void;
    answer: (sdp: RTCSessionDescriptionInit, sid: string) => void;
    candidate: (candidate: RTCIceCandidate, sid: string) => void;
}

interface InterServerEvents {}

interface SocketData {}

/** 启动 Web Socket 服务 */
function setupSocket(httpServer: HttpServer) {
    const io = new SocketServer<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents,
        SocketData
    >(httpServer, {
        cors: {
            origin: `http://localhost:${WEB_PORT}`,
        },
    });

    io.on('connection', socket => {
        // 加入房间
        socket.on('join', async meetingId => {
            logger.info(`用户 ${socket.id} 加入房间 ${meetingId}`);
            socket.join(meetingId);
            const sockets = await io.in(meetingId).fetchSockets();
            socket.emit(
                'participants',
                sockets.map(s => s.id)
            );
        });

        // 转发offer
        socket.on('offer', async (sdp, sid) => {
            io.to(sid).emit('offer', sdp, socket.id);
        });

        // 转发answer
        socket.on('answer', async (sdp, sid) => {
            io.to(sid).emit('answer', sdp, socket.id);
        });

        // 转发candidate
        socket.on('candidate', async (candidate, sid) => {
            io.to(sid).emit('candidate', candidate, socket.id);
        });
    });
}

export default setupSocket;
