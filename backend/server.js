import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import multer from 'multer';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import cors from 'cors'; // Add this missing import

// Load environment variables from .env file
dotenv.config();

const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://pcb-chatbot-project-git-main-dennis-projects-7001cabf.vercel.app',
    // Add your actual Vercel domain here
    'https://pcb-chatbot-project.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Remove the duplicate CORS configuration - keep only the one above
app.use(express.json()); // Add express JSON middleware for parsing request bodies

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 8080;

// --- In-memory data storage (for demonstration) ---
const users = new Map(); // Stores { ws -> { username, language } }
const activeConnections = new Map(); // Track active WebSocket connections

// --- Enhanced multi-language knowledge base ---
const customKnowledge = {
  en: {
    // PCB Basic Concepts
    pcb: {
      keywords: ['pcb', 'printed circuit board', 'circuit board', 'board'],
      response: 'A Printed Circuit Board (PCB) mechanically supports and electrically connects electronic components using conductive tracks, pads and other features etched from one or more sheet layers of copper laminated onto and/or between sheet layers of a non-conductive substrate.'
    },
    material: {
      keywords: ['material', 'materials', 'substrate', 'composition'],
      response: 'The most common material for PCBs is a glass fiber and epoxy resin composite known as FR-4. For high-frequency applications, materials like Rogers or Teflon are used.'
    },
    types: {
      keywords: ['type', 'types', 'kind', 'kinds', 'classification', 'category'],
      response: 'There are single-sided, double-sided, and multi-layer PCBs. Flexible and rigid-flex PCBs are also common.'
    },
    via: {
      keywords: ['via', 'vias', 'hole', 'holes', 'plated hole'],
      response: 'A via is a plated hole that connects traces on different layers of a PCB.'
    },
    trace: {
      keywords: ['trace', 'traces', 'track', 'tracks', 'wire', 'wires', 'connection'],
      response: 'A trace is a continuous path of copper on a PCB that connects components.'
    },
    soldermask: {
      keywords: ['solder mask', 'soldermask', 'mask', 'coating'],
      response: 'Solder mask is a thin layer of polymer that protects copper traces from oxidation and prevents solder bridges.'
    },
    // AI Training Topics
    training: {
      keywords: ['training', 'ai training', 'machine learning', 'ai', 'artificial intelligence'],
      response: 'AI training for PCB applications involves teaching machine learning models to recognize patterns in circuit design, component placement, routing optimization, and defect detection.'
    },
    design: {
      keywords: ['design', 'layout', 'schematic', 'routing'],
      response: 'PCB design involves creating the physical layout of electronic components and their connections on a circuit board, considering factors like signal integrity, power distribution, and thermal management.'
    }
  },
  es: {
    // PCB Basic Concepts in Spanish
    pcb: {
      keywords: ['pcb', 'placa de circuito impreso', 'placa', 'circuito impreso'],
      response: 'Una Placa de Circuito Impreso (PCB) soporta mecánicamente y conecta eléctricamente componentes electrónicos usando pistas conductoras, almohadillas y otras características grabadas de una o más capas de cobre laminadas sobre y/o entre capas de un sustrato no conductivo.'
    },
    material: {
      keywords: ['material', 'materiales', 'sustrato', 'composición'],
      response: 'El material más común para PCBs es un compuesto de fibra de vidrio y resina epoxi conocido como FR-4. Para aplicaciones de alta frecuencia, se usan materiales como Rogers o Teflón.'
    },
    tipos: {
      keywords: ['tipo', 'tipos', 'clase', 'clases', 'clasificación', 'categoría'],
      response: 'Hay PCBs de una cara, doble cara y multicapa. Los PCBs flexibles y rígido-flexibles también son comunes.'
    },
    via: {
      keywords: ['vía', 'vías', 'agujero', 'agujeros', 'agujero metalizado'],
      response: 'Una vía es un agujero metalizado que conecta pistas en diferentes capas de una PCB.'
    },
    pista: {
      keywords: ['pista', 'pistas', 'rastro', 'rastros', 'conexión', 'alambre'],
      response: 'Una pista es un camino continuo de cobre en una PCB que conecta componentes.'
    },
    mascara: {
      keywords: ['máscara de soldadura', 'máscara', 'recubrimiento'],
      response: 'La máscara de soldadura es una capa delgada de polímero que protege las pistas de cobre de la oxidación y previene puentes de soldadura.'
    },
    // AI Training Topics in Spanish
    entrenamiento: {
      keywords: ['entrenamiento', 'entrenamiento ia', 'aprendizaje automático', 'ia', 'inteligencia artificial'],
      response: 'El entrenamiento de IA para aplicaciones PCB involucra enseñar a modelos de aprendizaje automático a reconocer patrones en diseño de circuitos, colocación de componentes, optimización de ruteo y detección de defectos.'
    },
    diseño: {
      keywords: ['diseño', 'diseño pcb', 'esquema', 'ruteo'],
      response: 'El diseño PCB involucra crear el diseño físico de componentes electrónicos y sus conexiones en una placa de circuito, considerando factores como integridad de señal, distribución de energía y gestión térmica.'
    }
  },
  zh: {
    // PCB Basic Concepts in Chinese
    pcb: {
      keywords: ['pcb', '印刷电路板', '电路板', '线路板', '板子'],
      response: '印刷电路板（PCB）是一种使用导电轨道、焊盘和其他从一个或多个铜片层蚀刻出来的特征，机械支撑并电气连接电子元件的结构，这些铜片层压在非导电基板的片层之上或之间。'
    },
    材料: {
      keywords: ['材料', '基材', '基板', '组成'],
      response: 'PCB最常用的材料是称为FR-4的玻璃纤维和环氧树脂复合材料。对于高频应用，则使用Rogers或Teflon等材料。'
    },
    类型: {
      keywords: ['类型', '种类', '分类', '类别', '型号'],
      response: '有单面、双面和多层PCB。柔性和刚柔结合PCB也很常见。'
    },
    过孔: {
      keywords: ['过孔', '通孔', '孔', '镀孔'],
      response: '过孔是连接PCB不同层走线的镀孔。'
    },
    走线: {
      keywords: ['走线', '线路', '导线', '连线', '铜线'],
      response: '走线是PCB上连接元件的连续铜路径。'
    },
    阻焊层: {
      keywords: ['阻焊层', '阻焊', '绿油', '涂层'],
      response: '阻焊层是保护铜走线免受氧化并防止焊桥的薄聚合物层。'
    },
    // AI Training Topics in Chinese
    训练: {
      keywords: ['训练', 'ai训练', '机器学习', '人工智能', 'ai', '智能'],
      response: 'PCB应用的AI训练涉及教导机器学习模型识别电路设计、元件布局、布线优化和缺陷检测中的模式。'
    },
    设计: {
      keywords: ['设计', 'pcb设计', '布局', '原理图', '布线'],
      response: 'PCB设计涉及在电路板上创建电子元件的物理布局及其连接，考虑信号完整性、电源分配和热管理等因素。'
    }
  },
  de: {
    // PCB Basic Concepts in German
    pcb: {
      keywords: ['pcb', 'leiterplatte', 'platine', 'schaltkreis', 'schaltung'],
      response: 'Eine Leiterplatte (PCB) unterstützt mechanisch und verbindet elektrisch elektronische Komponenten über leitfähige Bahnen, Pads und andere Merkmale, die aus einer oder mehreren Kupferschichten geätzt sind, die auf und/oder zwischen Schichten eines nichtleitenden Substrats laminiert sind.'
    },
    material: {
      keywords: ['material', 'materialien', 'substrat', 'zusammensetzung'],
      response: 'Das gebräuchlichste Material für Leiterplatten ist ein Glasfaser- und Epoxidharz-Verbundstoff namens FR-4. Für Hochfrequenzanwendungen werden Materialien wie Rogers oder Teflon verwendet.'
    },
    typen: {
      keywords: ['typ', 'typen', 'art', 'arten', 'klassifizierung', 'kategorie'],
      response: 'Es gibt einseitige, doppelseitige und mehrschichtige Leiterplatten. Flexible und starr-flexible PCBs sind ebenfalls üblich.'
    },
    durchkontaktierung: {
      keywords: ['durchkontaktierung', 'via', 'loch', 'löcher', 'metallisiertes loch'],
      response: 'Eine Durchkontaktierung ist ein metallisiertes Loch, das Leiterbahnen auf verschiedenen Schichten einer Leiterplatte verbindet.'
    },
    leiterbahn: {
      keywords: ['leiterbahn', 'leiterbahnen', 'spur', 'spuren', 'draht', 'verbindung'],
      response: 'Eine Leiterbahn ist ein kontinuierlicher Kupferpfad auf einer Leiterplatte, der Komponenten verbindet.'
    },
    lotstoppmaske: {
      keywords: ['lötstoppmaske', 'lötstopplack', 'maske', 'beschichtung'],
      response: 'Lötstoppmaske ist eine dünne Polymerschicht, die Kupferleiterbahnen vor Oxidation schützt und Lötbrücken verhindert.'
    },
    training: {
      keywords: ['training', 'ki-training', 'maschinelles lernen', 'ki', 'künstliche intelligenz'],
      response: 'KI-Training für PCB-Anwendungen beinhaltet das Lehren von Machine-Learning-Modellen zur Erkennung von Mustern in Schaltungsdesign, Komponentenplatzierung, Routing-Optimierung und Fehlererkennung.'
    },
    design: {
      keywords: ['design', 'layout', 'schaltplan', 'routing'],
      response: 'PCB-Design umfasst die Erstellung des physischen Layouts elektronischer Komponenten und ihrer Verbindungen auf einer Leiterplatte unter Berücksichtigung von Faktoren wie Signalintegrität, Stromverteilung und Wärmemanagement.'
    }
  },
  th: {
    // PCB Basic Concepts in Thai
    pcb: {
      keywords: ['pcb', 'แผงวงจรพิมพ์', 'วงจรพิมพ์', 'แผงวงจร', 'บอร์ด'],
      response: 'แผงวงจรพิมพ์ (PCB) ให้การรองรับทางกลศาสตร์และเชื่อมต่อทางไฟฟ้าแก่ชิ้นส่วนอิเล็กทรอนิกส์โดยใช้เส้นทางนำไฟฟ้า แผ่นรอง และลักษณะอื่นๆ ที่แกะสลักจากชั้นทองแดงหนึ่งชั้นหรือหลายชั้นที่ติดอยู่บน และ/หรือ ระหว่างชั้นของสารที่ไม่นำไฟฟ้า'
    },
    วัสดุ: {
      keywords: ['วัสดุ', 'สารตั้งต้น', 'พื้นผิว', 'องค์ประกอบ'],
      response: 'วัสดุที่ใช้ทั่วไปที่สุดสำหรับ PCB คือคอมโพสิตของเส้นใยแก้วและเรซินอีพ็อกซีที่เรียกว่า FR-4 สำหรับการใช้งานความถี่สูงจะใช้วัสดุเช่น Rogers หรือ Teflon'
    },
    ประเภท: {
      keywords: ['ประเภท', 'ชนิด', 'ประเภทต่างๆ', 'การจำแนก', 'หมวดหมู่'],
      response: 'มี PCB แบบด้านเดียว สองด้าน และหลายชั้น PCB แบบยืดหยุ่นและแบบแข็ง-ยืดหยุ่นก็เป็นที่นิยมเช่นกัน'
    },
    รูเชื่อม: {
      keywords: ['รูเชื่อม', 'รู', 'รูชุบ', 'ผ่าน'],
      response: 'รูเชื่อมคือรูที่ชุบโลหะที่เชื่อมต่อเส้นทางบนชั้นต่างๆ ของ PCB'
    },
    เส้นทาง: {
      keywords: ['เส้นทาง', 'ร่องรอย', 'สาย', 'การเชื่อมต่อ'],
      response: 'เส้นทางคือเส้นทางทองแดงต่อเนื่องบน PCB ที่เชื่อมต่อชิ้นส่วนต่างๆ'
    },
    หน้ากากบัดกรี: {
      keywords: ['หน้ากากบัดกรี', 'หน้ากาก', 'การเคลือบ'],
      response: 'หน้ากากบัดกรีคือชั้นพอลิเมอร์บางๆ ที่ปกป้องเส้นทางทองแดงจากการเกิดออกไซด์และป้องกันสะพานบัดกรี'
    },
    การฝึก: {
      keywords: ['การฝึก', 'การฝึก ai', 'การเรียนรู้ของเครื่อง', 'ai', 'ปัญญาประดิษฐ์'],
      response: 'การฝึก AI สำหรับการใช้งาน PCB เกี่ยวข้องกับการสอนแบบจำลองการเรียนรู้ของเครื่องให้รู้จักรูปแบบในการออกแบบวงจร การวางตำแหน่งชิ้นส่วน การเพิ่มประสิทธิภาพการกำหนดเส้นทาง และการตรวจจับข้อบกพร่อง'
    },
    การออกแบบ: {
      keywords: ['การออกแบบ', 'เลย์เอาท์', 'แผนผัง', 'การกำหนดเส้นทาง'],
      response: 'การออกแบบ PCB เกี่ยวข้องกับการสร้างเลย์เอาท์ทางกายภาพของชิ้นส่วนอิเล็กทรอนิกส์และการเชื่อมต่อบนแผงวงจร โดยพิจารณาปัจจัยเช่นความสมบูรณ์ของสัญญาณ การกระจายพลังงาน และการจัดการความร้อน'
    }
  }
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
    res.status(200).json({ message: 'Files uploaded successfully. Training has started.' });
});

// Define the path to the users.json file
const usersFilePath = path.join(process.cwd(), 'users.json');

// Helper function to read user data
const readUserData = () => {
  try {
    if (fs.existsSync(usersFilePath)) {
      const data = fs.readFileSync(usersFilePath, 'utf8');
      return JSON.parse(data);
    } else {
      // If file doesn't exist yet, return empty array
      return [];
    }
  } catch (error) {
    console.error('Error reading users file:', error);
    return [];
  }
};

// Helper function to write user data
const writeUserData = (data) => {
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing users file:', error);
    return false;
  }
};

// API endpoints for user management
app.get('/api/users', (req, res) => {
  const userData = readUserData();
  
  // Add online status information from our active connections
  const usersWithStatus = userData.map(user => {
    // Check if user is currently connected
    const isOnline = Array.from(users.values()).some(u => 
      u.username === user.username
    );
    
    return {
      ...user,
      online: isOnline
    };
  });
  
  res.json(usersWithStatus);
});

app.delete('/api/users/:username', (req, res) => {
  const { username } = req.params;
  const userData = readUserData();
  
  const updatedUsers = userData.filter(user => user.username !== username);
  
  if (writeUserData(updatedUsers)) {
    res.json({ success: true });
  } else {
    res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
});

// Define admin credentials file path
const adminFilePath = path.join(process.cwd(), 'admin.json');

// Initialize admin credentials if they don't exist
const initializeAdminCredentials = () => {
  try {
    if (!fs.existsSync(adminFilePath)) {
      const defaultAdmin = {
        username: 'admin',
        password: 'pcbadmin123'
      };
      fs.writeFileSync(adminFilePath, JSON.stringify(defaultAdmin, null, 2));
      return defaultAdmin;
    } else {
      const data = fs.readFileSync(adminFilePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error initializing admin credentials:', error);
    return { username: 'admin', password: 'pcbadmin123' };
  }
};

// Get admin credentials
const getAdminCredentials = () => {
  try {
    if (fs.existsSync(adminFilePath)) {
      const data = fs.readFileSync(adminFilePath, 'utf8');
      return JSON.parse(data);
    } else {
      return initializeAdminCredentials();
    }
  } catch (error) {
    console.error('Error reading admin credentials:', error);
    return { username: 'admin', password: 'pcbadmin123' };
  }
};

// Save admin credentials
const saveAdminCredentials = (credentials) => {
  try {
    fs.writeFileSync(adminFilePath, JSON.stringify(credentials, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving admin credentials:', error);
    return false;
  }
};

// Initialize admin credentials on startup
const adminCredentials = getAdminCredentials();

// Authentication endpoint for admin
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  const admin = getAdminCredentials();
  
  if (username === admin.username && password === admin.password) {
    res.json({ success: true, message: 'Admin authentication successful' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// Admin password change endpoint
app.post('/api/admin/change-password', (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const adminCredentials = getAdminCredentials();
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Current and new passwords are required' });
  }
  
  if (currentPassword !== adminCredentials.password) {
    return res.status(401).json({ success: false, message: 'Current password is incorrect' });
  }
  
  // Update password
  adminCredentials.password = newPassword;
  
  if (saveAdminCredentials(adminCredentials)) {
    res.json({ success: true, message: 'Password changed successfully' });
  } else {
    res.status(500).json({ success: false, message: 'Failed to change password' });
  }
});

// Authentication endpoint for regular users
app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username and password are required' 
      });
    }
    
    const userData = readUserData();
    
    if (!userData || userData.length === 0) {
      console.warn('Warning: No users found in database');
      return res.status(500).json({ 
        success: false, 
        message: 'User database is empty or not accessible' 
      });
    }
    
    const user = userData.find(u => u.username === username);
    
    if (user && user.password === password) {
      // Update last login time
      user.lastLogin = new Date().toISOString();
      writeUserData(userData);
      
      res.json({ 
        success: true, 
        message: 'Authentication successful',
        user: {
          username: user.username,
          language: user.language
        }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during authentication',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// User registration endpoint (for new users)
app.post('/api/auth/register', (req, res) => {
  const { username, password, language } = req.body;
  
  // Validate required fields
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required' });
  }
  
  const userData = readUserData();
  
  // Check if username already exists
  if (userData.some(u => u.username === username)) {
    return res.status(409).json({ success: false, message: 'Username already exists' });
  }
  
  // Add new user
  const newUser = {
    username,
    password,
    language: language || 'en',
    lastLogin: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };
  
  userData.push(newUser);
  
  if (writeUserData(userData)) {
    res.json({ 
      success: true, 
      message: 'User registered successfully',
      user: {
        username: newUser.username,
        language: newUser.language
      }
    });
  } else {
    res.status(500).json({ success: false, message: 'Failed to register user' });
  }
});

// Fix the user password change endpoint (admin only)
app.post('/api/users/:username/change-password', (req, res) => {
  try {
    const { username } = req.params;
    const { newPassword } = req.body;
    
    if (!newPassword) {
      return res.status(400).json({ success: false, message: 'New password is required' });
    }
    
    const userData = readUserData();
    const userIndex = userData.findIndex(u => u.username === username);
    
    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Update user's password
    userData[userIndex].password = newPassword;
    
    if (writeUserData(userData)) {
      return res.json({ success: true, message: 'Password changed successfully' });
    } else {
      return res.status(500).json({ success: false, message: 'Failed to update password' });
    }
  } catch (error) {
    console.error('Error in change-password endpoint:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// --- WebSocket Server Logic ---
wss.on('connection', (ws, req) => {
    console.log('New WebSocket connection established');
    
    // Add connection tracking
    const connectionId = Date.now() + Math.random();
    activeConnections.set(connectionId, ws);
    
    // Set up ping/pong for keepalive
    ws.isAlive = true;
    ws.on('pong', () => {
        ws.isAlive = true;
    });
    
    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);
            console.log('Received message:', data);
            
            switch (data.type) {
                case 'join':
                    // Store user with connection tracking
                    users.set(ws, { 
                        username: data.username, 
                        language: data.language || 'en',
                        connectionId: connectionId
                    });
                    broadcastUserList();
                    console.log(`${data.username} joined with language: ${data.language || 'en'}`);
                    
                    // Store user in the users.json file if they don't exist yet
                    const userData = readUserData();
                    const existingUserIndex = userData.findIndex(u => u.username === data.username);
                    
                    if (existingUserIndex >= 0) {
                        // Update existing user's last login and language
                        userData[existingUserIndex].lastLogin = new Date().toISOString();
                        userData[existingUserIndex].language = data.language || 'en';
                        
                        // Store password if it doesn't exist or update it if provided
                        if (data.password && (!userData[existingUserIndex].password || data.updatePassword)) {
                            userData[existingUserIndex].password = data.password;
                        }
                    } else {
                        // Add new user with password
                        userData.push({
                          username: data.username,
                          password: data.password || '', // Store password if provided
                          language: data.language || 'en',
                          lastLogin: new Date().toISOString(),
                          createdAt: new Date().toISOString()
                        });
                    }
                    
                    writeUserData(userData);
                    
                    // Send welcome message in user's language
                    const welcomeMessages = {
                        en: "Hello! I'm your PCB AI Assistant. How can I help you today?",
                        es: "¡Hola! Soy tu Asistente de IA para PCB. ¿Cómo puedo ayudarte hoy?",
                        zh: "您好！我是您的PCB AI助手。今天我可以为您做些什么？",
                        de: "Hallo! Ich bin Ihr PCB AI-Assistent. Wie kann ich Ihnen heute helfen?",
                        th: "สวัสดี! ฉันคือผู้ช่วย PCB AI ของคุณ วันนี้ฉันจะช่วยอะไรคุณได้บ้าง?"
                    };
                    
                    const welcomeMessage = {
                        type: 'bot-message',
                        username: 'PCB AI Assistant',
                        text: welcomeMessages[data.language] || welcomeMessages.en,
                        timestamp: new Date().toISOString(),
                        isBot: true
                    };
                    ws.send(JSON.stringify(welcomeMessage));
                    break;
                    
                case 'message':
                    const user = users.get(ws);
                    if (user) {
                        // Broadcast user message to all clients
                        await broadcastMessage({
                            type: 'message',
                            username: user.username,
                            text: data.text,
                            timestamp: new Date().toISOString(),
                            isBot: false
                        });
                        
                        // Generate AI response using Gemini
                        setTimeout(() => handleBotResponse(data, ws), 1000);
                    }
                    break;
                    
                case 'ping':
                    // Respond to ping
                    ws.send(JSON.stringify({ type: 'pong' }));
                    break;
            }
        } catch (e) {
            console.error('Error parsing message:', e);
        }
    });

    ws.on('close', (code, reason) => {
        console.log(`WebSocket closed: ${code} - ${reason}`);
        users.delete(ws);
        activeConnections.delete(connectionId);
        broadcastUserList();
    });
    
    ws.on('error', (e) => {
        console.error('WebSocket error:', e);
        users.delete(ws);
        activeConnections.delete(connectionId);
    });
});

// Add keepalive ping/pong mechanism
const pingInterval = setInterval(() => {
    wss.clients.forEach((ws) => {
        if (ws.isAlive === false) {
            console.log('Terminating inactive connection');
            return ws.terminate();
        }
        
        ws.isAlive = false;
        ws.ping();
    });
}, 30000); // Ping every 30 seconds

// Clean up interval when server shuts down
process.on('SIGTERM', () => {
    clearInterval(pingInterval);
});

// --- Helper Functions ---
async function broadcastMessage(message) {
    for (const [client, userData] of users.entries()) {
        if (client.readyState === client.OPEN) {
            client.send(JSON.stringify(message));
        }
    }
}

function broadcastUserList() {
    const userList = Array.from(users.values());
    const message = { type: 'user-list', users: userList };
    
    for (const [client] of users.entries()) {
        if (client.readyState === client.OPEN) {
            client.send(JSON.stringify(message));
        }
    }
}

// Enhanced bot response handler with professional NLP processing
async function handleBotResponse(message, ws) {
    const user = users.get(ws);
    if (!user) return;

    try {
        console.log(`Processing question: "${message.text}" in language: ${user.language}`);
        
        // First try custom knowledge base with professional NLP
        let responseText = getKnowledgeResponse(message.text, user.language);
        
        if (responseText) {
            console.log('✅ Found match in AI training knowledge base');
        } else {
            console.log('❌ No match in knowledge base, using Gemini AI');
            // If not found in knowledge base, use Gemini AI
            responseText = await getGeminiResponse(message.text, user.language);
        }
        
        const botMessage = {
            type: 'bot-message',
            username: 'PCB AI Assistant',
            text: responseText,
            timestamp: new Date().toISOString(),
            isBot: true
        };
        
        // Send to the user who asked the question
        ws.send(JSON.stringify(botMessage));
        
        // Also broadcast to all other users
        for (const [client, userData] of users.entries()) {
            if (client !== ws && client.readyState === client.OPEN) {
                client.send(JSON.stringify(botMessage));
            }
        }
    } catch (error) {
        console.error('Error generating bot response:', error);
        const errorMessages = {
            en: "Sorry, I encountered an error. Please try again.",
            es: "Lo siento, encontré un error. Por favor intenta de nuevo.",
            zh: "抱歉，我遇到了错误。请重试。",
            de: "Entschuldigung, ich bin auf einen Fehler gestoßen. Bitte versuchen Sie es erneut.",
            th: "ขออภัย เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง"
        };
        
        const errorMessage = {
            type: 'bot-message',
            username: 'PCB AI Assistant',
            text: errorMessages[user.language] || errorMessages.en,
            timestamp: new Date().toISOString(),
            isBot: true
        };
        ws.send(JSON.stringify(errorMessage));
    }
}

// Professional Natural Language Processing function
function extractKeywords(text, language = 'en') {
    const lowerText = text.toLowerCase().trim();
    
    // Remove common question words and focus on key concepts
    const questionWords = {
        en: ['what', 'is', 'are', 'how', 'why', 'when', 'where', 'which', 'can', 'do', 'does', 'will', 'would', 'could', 'should', 'the', 'a', 'an', 'and', 'or', 'but', 'of', 'to', 'for', 'with', 'by'],
        es: ['qué', 'es', 'son', 'cómo', 'por qué', 'cuándo', 'dónde', 'cuál', 'puede', 'hacer', 'hace', 'será', 'sería', 'podría', 'debería', 'el', 'la', 'los', 'las', 'un', 'una', 'y', 'o', 'pero', 'de', 'para', 'con', 'por'],
        zh: ['什么', '是', '有', '怎么', '为什么', '什么时候', '哪里', '哪个', '能', '做', '会', '将', '应该', '的', '和', '或者', '但是', '给', '对', '用', '啥', '有啥', '咋'],
        de: ['was', 'ist', 'sind', 'wie', 'warum', 'wann', 'wo', 'welche', 'welcher', 'welches', 'kann', 'tun', 'macht', 'wird', 'würde', 'könnte', 'sollte', 'der', 'die', 'das', 'ein', 'eine', 'und', 'oder', 'aber', 'von', 'zu', 'für', 'mit', 'durch'],
        th: ['อะไร', 'คือ', 'เป็น', 'ยังไง', 'ทำไม', 'เมื่อไหร่', 'ที่ไหน', 'ซึ่ง', 'สามารถ', 'ทำ', 'จะ', 'ควร', 'และ', 'หรือ', 'แต่', 'ของ', 'ไปยัง', 'สำหรับ', 'กับ', 'โดย', 'ใน', 'บน', 'ก็', 'ได้', 'มี', 'ให้']
    };
    
    const wordsToRemove = questionWords[language] || questionWords.en;
    
    // Split text into words and remove question words
    let words;
    if (language === 'zh' || language === 'th') {
        // For Chinese and Thai, handle character-based processing
        words = text.split('').filter(char => char.trim() && !wordsToRemove.includes(char));
        // Also include word-based splitting for Thai
        if (language === 'th') {
            const wordsSplit = lowerText.split(/\s+/);
            words = [...words, ...wordsSplit.filter(word => !wordsToRemove.includes(word) && word.length > 1)];
        }
    } else {
        words = lowerText.split(/\s+/);
        words = words.filter(word => !wordsToRemove.includes(word) && word.length > 1);
    }
    
    // Join remaining words to create meaningful phrases
    const cleanedText = words.join(' ');
    
    return {
        originalText: text,
        cleanedText: cleanedText,
        keywords: words
    };
}

// Enhanced knowledge base response function with professional NLP
function getKnowledgeResponse(text, language = 'en') {
    const langKnowledge = customKnowledge[language] || customKnowledge.en;
    
    // Extract keywords from the question
    const extracted = extractKeywords(text, language);
    console.log('NLP Analysis:', extracted);
    
    let bestMatch = null;
    let bestScore = 0;
    
    // Iterate through all knowledge base entries
    for (const [concept, data] of Object.entries(langKnowledge)) {
        let score = 0;
        
        // Check direct keyword matches
        for (const keyword of data.keywords) {
            if (extracted.cleanedText.includes(keyword.toLowerCase())) {
                score += 3; // High score for exact keyword match
            }
            
            // Check partial matches
            for (const extractedWord of extracted.keywords) {
                if (keyword.toLowerCase().includes(extractedWord) || extractedWord.includes(keyword.toLowerCase())) {
                    score += 2; // Medium score for partial match
                }
            }
        }
        
        // Check if any extracted keywords are similar to concept name
        if (extracted.cleanedText.includes(concept.toLowerCase()) || concept.toLowerCase().includes(extracted.cleanedText)) {
            score += 4; // Very high score for concept name match
        }
        
        // Language-specific scoring adjustments
        if (language === 'zh') {
            // For Chinese, check character-level matching
            for (const keyword of data.keywords) {
                for (let i = 0; i < keyword.length; i++) {
                    if (text.includes(keyword[i])) {
                        score += 1; // Small score for character match
                    }
                }
            }
        }
        
        // Update best match if this score is higher
        if (score > bestScore) {
            bestScore = score;
            bestMatch = data.response;
        }
    }
    
    console.log(`Best match score: ${bestScore}, Response found: ${bestMatch ? 'Yes' : 'No'}`);
    
    // Return the best match if score is above threshold
    return bestScore >= 2 ? bestMatch : null;
}

// Enhanced Gemini API integration with knowledge base context
async function getGeminiResponse(prompt, language = 'en') {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        console.error('GEMINI_API_KEY not found in environment variables');
        const errorMessages = {
            en: "I'm currently unable to access advanced AI features. Please contact the administrator.",
            es: "Actualmente no puedo acceder a las funciones avanzadas de IA. Contacte al administrador.",
            zh: "我目前无法访问高级AI功能。请联系管理员。",
            de: "Ich kann derzeit nicht auf erweiterte KI-Funktionen zugreifen. Bitte wenden Sie sich an den Administrator.",
            th: "ขณะนี้ฉันไม่สามารถเข้าถึงฟีเจอร์ AI ขั้นสูงได้ กรุณาติดต่อผู้ดูแลระบบ"
        };
        return errorMessages[language] || errorMessages.en;
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const languageInstructions = {
        en: "Please respond in English only.",
        es: "Por favor responde únicamente en español.",
        zh: "请只用中文回答。",
        de: "Bitte antworten Sie nur auf Deutsch.",
        th: "กรุณาตอบเป็นภาษาไทยเท่านั้น"
    };
    
    const instruction = languageInstructions[language] || languageInstructions.en;
    
    // Include knowledge base context in the system prompt
    const knowledgeContext = `
    Here is some key PCB knowledge that should be prioritized in responses:
    ${JSON.stringify(customKnowledge[language] || customKnowledge.en, null, 2)}
    `;
    
    const systemPrompt = `${instruction} You are a professional PCB (Printed Circuit Board) expert and AI assistant. You specialize in:
    - PCB design and layout
    - Electronic components and their specifications
    - Manufacturing processes
    - Circuit analysis
    - Industry standards and best practices
    - Troubleshooting and problem-solving
    
    ${knowledgeContext}
    
    Use the provided knowledge base information when applicable, but feel free to expand with additional professional insights. Provide helpful, accurate, and concise answers. If you're unsure about something, acknowledge it honestly. Keep responses focused on PCB-related topics.`;
    
    const payload = {
        contents: [{
            role: "user",
            parts: [{
                text: `${systemPrompt}\n\nUser question: ${prompt}`
            }]
        }],
        generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
        }
    };

    try {
        console.log('Calling Gemini API with knowledge base context...');
        const apiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!apiResponse.ok) {
            console.error('Gemini API error:', apiResponse.status, apiResponse.statusText);
            const errorMessages = {
                en: "I'm experiencing technical difficulties. Please try again in a moment.",
                es: "Estoy experimentando dificultades técnicas. Inténtalo de nuevo en un momento.",
                zh: "我遇到了技术困难。请稍后再试。",
                de: "Ich habe technische Schwierigkeiten. Bitte versuchen Sie es in einem Moment erneut.",
                th: "ฉันประสบปัญหาทางเทคนิค กรุณาลองอีกครั้งในไม่ช้า"
            };
            return errorMessages[language] || errorMessages.en;
        }

        const result = await apiResponse.json();
        console.log('Gemini API response received');
        
        const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (responseText) {
            return responseText.trim();
        } else {
            const fallbackMessages = {
                en: "I couldn't generate a specific response. Could you please rephrase your question?",
                es: "No pude generar una respuesta específica. ¿Podrías reformular tu pregunta?",
                zh: "我无法生成具体回复。您能重新表述您的问题吗？",
                de: "Ich konnte keine spezifische Antwort generieren. Könnten Sie bitte Ihre Frage umformulieren?",
                th: "ฉันไม่สามารถสร้างคำตอบที่เฉพาะเจาะจงได้ คุณช่วยพูดคำถามของคุณใหม่ได้ไหม"
            };
            return fallbackMessages[language] || fallbackMessages.en;
        }
    } catch (error) {
        console.error("Gemini API Error:", error);
        const errorMessages = {
            en: "I'm currently unable to process your request. Please try again later.",
            es: "Actualmente no puedo procesar tu solicitud. Inténtalo de nuevo más tarde.",
            zh: "我目前无法处理您的请求。请稍后再试。",
            de: "Ich kann Ihre Anfrage derzeit nicht bearbeiten. Bitte versuchen Sie es später erneut.",
            th: "ขณะนี้ฉันไม่สามารถประมวลผลคำขอของคุณได้ กรุณาลองใหม่ภายหลัง"
        };
        return errorMessages[language] || errorMessages.en;
    }
}

// Add a simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API is working properly',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Start the server - make sure this is at the end of the file
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is listening on port ${PORT}`);
});
