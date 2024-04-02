import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';

import { WEB_PORT } from '../config';
import logger from './logger';

interface Participant {
    id: number;
    sid: string;
}

interface ServerToClientEvents {
    join: (id: number, sid: string) => void;
    participants: (participants: Participant[]) => void;
    offer: (sdp: RTCSessionDescriptionInit, sid: string) => void;
    answer: (sdp: RTCSessionDescriptionInit, sid: string) => void;
    candidate: (candidate: RTCIceCandidate, sid: string) => void;
}

interface ClientToServerEvents {
    offer: (sdp: RTCSessionDescriptionInit, sid: string) => void;
    answer: (sdp: RTCSessionDescriptionInit, sid: string) => void;
    candidate: (candidate: RTCIceCandidate, sid: string) => void;
}

interface InterServerEvents {}

interface SocketData {}

const idMap = new Map<string, number>();

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

    // 验证 token
    io.use((socket, next) => {
        const { id, token } = socket.handshake.auth;
        if (!token) {
            // return next(new Error('Authentication error'));
        }
        // TODO: 鉴权
        idMap.set(socket.id, id);
        next();
    });

    io.of('/')
        .adapter.on('create-room', room => {
            logger.debug(`room ${room} created`);
        })
        .on('join-room', (room, id) => {
            logger.info(`Socket ${id} joined room ${room}`);
        });

    io.on('connection', async socket => {
        logger.info(`Socket ${socket.id} connected`);

        // 加入房间
        const meetingId = socket.handshake.query.room;
        const id = idMap.get(socket.id);

        if (!meetingId || meetingId.length === 0 || id === undefined) {
            logger.error(`meetingId:${meetingId} or id:${id} is undefined`);
            return;
        }

        io.to(meetingId).emit('join', id, socket.id);
        io.in(meetingId)
            .fetchSockets()
            .then(sockets => {
                // 返回当前所有用户
                logger.debug(`sockets:${sockets.length}`);
                const participants = sockets.reduce<Participant[]>(
                    (prev, curr) => {
                        const id = idMap.get(curr.id);
                        if (id === undefined) return prev;
                        else return [...prev, { id, sid: curr.id }];
                    },
                    []
                );
                socket.emit('participants', participants);
            });
        socket.join(meetingId);

        // 转发offer
        socket.on('offer', (sdp, sid) => {
            io.to(sid).emit('offer', sdp, socket.id);
        });

        // 转发answer
        socket.on('answer', (sdp, sid) => {
            io.to(sid).emit('answer', sdp, socket.id);
        });

        // 转发candidate
        socket.on('candidate', (candidate, sid) => {
            io.to(sid).emit('candidate', candidate, socket.id);
        });

        socket.on('disconnect', () => {
            logger.info(`Socket ${socket.id} disconnected`);
            idMap.delete(socket.id);
        });
    });
}

export default setupSocket;
