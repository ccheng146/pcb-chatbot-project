import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import multer from 'multer';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import cors from 'cors';

// Load environment variables from .env file
dotenv.config();

const app = express();
// Enable CORS for all routes, useful for development and some deployment scenarios
app.use(cors());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 8080;

// --- In-memory data storage (for demonstration) ---
const users = new Map(); // Stores { ws -> { username, language } }
const customKnowledge = {
    'what is a pcb': 'A Printed Circuit Board (PCB) mechanically supports and electrically connects electronic components using conductive tracks, pads and other features etched from one or more sheet layers of copper laminated onto and/or between sheet layers of a non-conductive substrate.',
    'pcb material': 'The most common material for PCBs is a glass fiber and epoxy resin composite known as FR-4. For high-frequency applications, materials like Rogers or Teflon are used.',
    'types of pcb': 'There are single-sided, double-sided, and multi-layer PCBs. Flexible and rigid-flex PCBs are also common.',
    '什么是pcb': '印刷电路板（PCB）是一种使用导电轨道、焊盘和其他从一个或多个铜片层蚀刻出来的特征，机械支撑并电气连接电子元件的结构，这些铜片层压在非导电基板的片层之上或之间。',
    'pcb材料': 'PCB最常用的材料是称为FR-4的玻璃纤维和环氧树脂复合材料。对于高频应用，则使用Rogers或Teflon等材料。',
};

// --- File Upload Setup (for AI Training) ---
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

app.post('/api/upload-training-data', upload.array('trainingFiles'), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).send('No files were uploaded.');
    }
    console.log('Received files for training:', req.files.map(f => f.filename));
    // In a real application, you would add logic here to process these files:
    // 1. Parse the text/data from the files (PDFs, docs, etc.).
    // 2. Format the extracted data into a question/answer format.
    // 3. Update your knowledge base (e.g., fine-tune a model, update a vector database).
    res.status(200).json({ message: 'Files uploaded successfully. Training has started.' });
});

// --- WebSocket Server Logic ---
wss.on('connection', (ws) => {
    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);
            switch (data.type) {
                case 'join':
                    users.set(ws, { username: data.username, language: data.language });
                    broadcastUserList();
                    const welcomeMsg = { type: 'bot-message', username: 'ChatBot', text: `Welcome ${data.username}! Ask me about the PCB industry.` };
                    ws.send(JSON.stringify(await translateMessage(welcomeMsg, data.language, 'en')));
                    break;
                case 'message':
                    broadcastMessage(data);
                    handleBotResponse(data, ws);
                    break;
            }
        } catch (e) {
            console.error('Failed to process message:', e);
        }
    });

    ws.on('close', () => {
        users.delete(ws);
        broadcastUserList();
    });
    ws.on('error', (e) => console.error('WebSocket error:', e));
});

// --- Helper Functions ---
async function broadcastMessage(message) {
    for (const [client, userData] of users.entries()) {
        if (client.readyState === client.OPEN) {
            const translatedMessage = await translateMessage(message, userData.language, message.language);
            client.send(JSON.stringify(translatedMessage));
        }
    }
}

function broadcastUserList() {
    const userList = Array.from(users.values());
    const userListMessage = { type: 'user-list', users: userList };
    const payload = JSON.stringify(userListMessage);
    for (const client of users.keys()) {
        if (client.readyState === client.OPEN) {
            client.send(payload);
        }
    }
}

async function handleBotResponse(message, ws) {
    const user = users.get(ws);
    if (!user) return;

    let responseText = customKnowledge[message.text.toLowerCase().trim()] || await getGeminiResponse(message.text);
    
    const botMessage = { type: 'bot-message', username: 'ChatBot', text: responseText };
    const translatedBotMessage = await translateMessage(botMessage, user.language, 'en');
    ws.send(JSON.stringify(translatedBotMessage));
}

async function getGeminiResponse(prompt) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return "The advanced AI model is not configured. Please contact the administrator.";

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const payload = { contents: [{ role: "user", parts: [{ text: `You are a helpful assistant specializing in the PCB (Printed Circuit Board) industry. Answer the following question concisely: ${prompt}` }] }] };

    try {
        const apiResponse = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!apiResponse.ok) return "The advanced AI model is currently unavailable.";
        const result = await apiResponse.json();
        return result.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't find a specific answer for that. Could you rephrase?";
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "Sorry, an error occurred while contacting the advanced AI model.";
    }
}

async function translateMessage(message, targetLang, sourceLang) {
    if (sourceLang === targetLang) return message;
    // This is a placeholder for a real translation API.
    // In a real app, you would integrate the Google Translate API here.
    return { ...message, text: `[${targetLang}] ${message.text}`, language: targetLang };
}

server.listen(PORT, () => {
    console.log(`✅ Server is running and listening on http://localhost:${PORT}`);
});
