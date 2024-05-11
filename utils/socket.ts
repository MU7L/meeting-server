import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';

import { WEB_PORT } from '../config';
import logger from './logger';

interface ServerToClientEvents {
    join: (uid: string) => void;
    offer: (uid: string, sdp: RTCSessionDescriptionInit) => void;
    answer: (uid: string, sdp: RTCSessionDescriptionInit) => void;
    candidate: (uid: string, candidate: RTCIceCandidate) => void;
}

interface ClientToServerEvents {
    join: (mid: string, callback: (idList: string[]) => void) => void;
    offer: (uid: string, sdp: RTCSessionDescriptionInit) => void;
    answer: (uid: string, sdp: RTCSessionDescriptionInit) => void;
    candidate: (uid: string, candidate: RTCIceCandidate) => void;
}

interface InterServerEvents {}

interface SocketData {}

// map
const idMapSid = new Map<string, string>();
const sidMapId = new Map<string, string>();

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

    // log
    io.of('/')
        .adapter.on('create-room', room => {
            logger.debug(`room ${room} created`);
        })
        .on('join-room', (room, id) => {
            logger.debug(`Socket ${id} joined room ${room}`);
        });

    // 鉴权
    io.use((socket, next) => {
        const { id, token } = socket.handshake.auth as {
            id: string;
            token: string;
        };
        idMapSid.set(id, socket.id);
        sidMapId.set(socket.id, id);
        next();
    });

    io.on('connection', async socket => {
        logger.info(`Socket ${socket.id} connected`);

        // 加入房间
        socket.on('join', (room, cb) => {
            const id = sidMapId.get(socket.id);
            if (!id) return;
            io.to(room).emit('join', id);
            socket.join(room);
            io.in(room)
                .fetchSockets()
                .then(sockets => {
                    const idList = sockets
                        .filter(curr => curr.id !== socket.id)
                        .reduce<string[]>((prev, curr) => {
                            const id = sidMapId.get(curr.id);
                            return id ? [...prev, id] : prev;
                        }, []);
                    cb(idList);
                });
        });

        // 转发offer
        socket.on('offer', (id, sdp) => {
            const targetSid = idMapSid.get(id);
            const sourceId = sidMapId.get(socket.id);
            if (!targetSid || !sourceId) return;
            io.to(targetSid).emit('offer', sourceId, sdp);
        });

        // 转发answer
        socket.on('answer', (id, sdp) => {
            const targetSid = idMapSid.get(id);
            const sourceId = sidMapId.get(socket.id);
            if (!targetSid || !sourceId) return;
            io.to(targetSid).emit('answer', sourceId, sdp);
        });

        // 转发candidate
        socket.on('candidate', (id, candidate) => {
            const targetSid = idMapSid.get(id);
            const sourceId = sidMapId.get(socket.id);
            if (!targetSid || !sourceId) return;
            io.to(targetSid).emit('candidate', sourceId, candidate);
        });

        socket.on('disconnect', () => {
            logger.info(`Socket ${socket.id} disconnected`);
            const id = sidMapId.get(socket.id);
            if (!id) return;
            idMapSid.delete(id);
            sidMapId.delete(socket.id);
        });
    });
}

export default setupSocket;
