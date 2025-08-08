import express from "express";

import { createServer } from "node:http";

import { fileURLToPath } from "node:url";

import { dirname, join } from "node:path";

import { Server } from "socket.io";

import { Socket } from "node:dgram";

const app = express();

const server = createServer(app);

const io = new Server(server);
const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Définit une route GET pour la racine qui envoie le fichier index.html.
 * @param {express.Request} req - La requête HTTP entrante.
 * @param {express.Response} res - La réponse HTTP sortante.
 */
app.get("/", (req, res) => {
    res.sendFile(join(__dirname, "index.html"));
});

/**
 * Gère les connexions Socket.io pour les logs de connexion/déconnexion et les messages.
 * @param {import("socket.io").Socket} socket - L'instance du socket connecté.
 */
io.on("connection", (socket) => {
    /**
     * Log lors de la connexion d'un utilisateur.
     */
    console.log("Un utilisateur s'est connecté ");
    /**
     * Log lors de la déconnexion d'un utilisateur.
     */
    socket.on("disconnect", () => {
        console.log("Un utilisateur s'est déconnecté");
    });
    /**
     * Log lors de la réception d'un message de chat.
     * @param {string} msg - Le message reçu.
     */
    socket.on("chat message", (msg) => {
        console.log("message reçu:" + msg);
    });
});

/**
 * Gère la réception d'un message de chat et le diffuse à tous les clients connectés.
 * @param {import("socket.io").Socket} socket - L'instance du socket connecté.
 */
io.on("connection", (socket) => {
    /**
     * Écoute l'événement 'chat message' et le diffuse à tous les clients.
     * @param {string} msg - Le message de chat à diffuser.
     */
    socket.on("chat message", (msg) => {
        io.emit("chat message", msg);
    });
});

/**
 * Démarre le serveur HTTP sur le port 9090 et affiche un message dans la console.
 */
server.listen(9090, () => {
    console.log("Serveur démarré sur le port 9090");
});
