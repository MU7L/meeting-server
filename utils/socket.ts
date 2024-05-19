import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';

import { WEB_PORT } from '../config';
import logger from './logger';
import userService from '../service/user';

interface ServerToClientEvents {
    join: (uid: string) => void;
    offer: (uid: string, sdp: RTCSessionDescriptionInit) => void;
    answer: (uid: string, sdp: RTCSessionDescriptionInit) => void;
    candidate: (uid: string, candidate: RTCIceCandidate) => void;
    removeStream: (uid: string, sid: string) => void;
    leave: (uid: string) => void;
}

interface ClientToServerEvents {
    join: (mid: string, callback: (idList: string[]) => void) => void;
    offer: (uid: string, sdp: RTCSessionDescriptionInit) => void;
    answer: (uid: string, sdp: RTCSessionDescriptionInit) => void;
    candidate: (uid: string, candidate: RTCIceCandidate) => void;
    removeStream: (uid: string, sid: string) => void;
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
            origin: '*',
        },
    });

    // log
    io.of('/').adapter.on('join-room', (room, id) => {
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
        let mid: string;
        logger.info(`Socket ${socket.id} connected`);

        // 加入房间
        socket.on('join', async (room, cb) => {
            const id = sidMapId.get(socket.id);
            if (!id) return;
            io.to(room).emit('join', id);
            socket.join(room);
            mid = room;
            await userService.recordAttendance(mid, id);
            const sockets = await io.in(room).fetchSockets();
            const idList = sockets
                .filter(curr => curr.id !== socket.id)
                .reduce<string[]>((prev, curr) => {
                    const id = sidMapId.get(curr.id);
                    return id ? [...prev, id] : prev;
                }, []);
            cb(idList);
        });

        // 转发offer
        socket.on('offer', (id, sdp) => {
            const targetSid = idMapSid.get(id);
            const sourceId = sidMapId.get(socket.id);
            if (!targetSid || !sourceId) return;
            io.to(targetSid).emit('offer', sourceId, sdp);
            logger.debug(`${sourceId} offer to ${id}`);
        });

        // 转发answer
        socket.on('answer', (id, sdp) => {
            const targetSid = idMapSid.get(id);
            const sourceId = sidMapId.get(socket.id);
            if (!targetSid || !sourceId) return;
            io.to(targetSid).emit('answer', sourceId, sdp);
            logger.debug(`${sourceId} answer to ${id}`);
        });

        // 转发candidate
        socket.on('candidate', (id, candidate) => {
            const targetSid = idMapSid.get(id);
            const sourceId = sidMapId.get(socket.id);
            if (!targetSid || !sourceId) return;
            io.to(targetSid).emit('candidate', sourceId, candidate);
        });

        // 关闭流
        socket.on('removeStream', (uid, sid) => {
            if (mid) {
                io.to(mid).emit('removeStream', uid, sid);
            }
        });

        socket.on('disconnect', () => {
            logger.info(`Socket ${socket.id} disconnected`);
            const id = sidMapId.get(socket.id);
            if (!id) return;
            idMapSid.delete(id);
            sidMapId.delete(socket.id);
            if (mid) {
                io.to(mid).emit('leave', id);
            }
        });
    });
}

export default setupSocket;
