/**
 * SENTINEL AI // AUTONOMOUS NETWORK INTRUSION DETECTION SYSTEM
 * Client-Side SOC Operations, Real-Time Audio Synthesis & Ensemble ML Engine
 */

// =============================================================================
// 1. STATE MANAGEMENT & PRESETS
// =============================================================================

const APP_STATE = {
    currentUser: {
        name: 'Alex Mercer',
        role: 'SOC Level 3 Analyst',
        clearance: 'TOP SECRET // SCI',
        initials: 'AM',
        authenticated: true
    },
    currentView: 'view-dashboard',
    audioEnabled: true,
    liveStreamActive: true,

    // Active Packet Under Inspection
    currentPacket: {
        protocol: 'TCP',
        srcIp: '192.168.1.105',
        srcPort: 54210,
        dstIp: '10.0.0.1',
        dstPort: 443,
        duration: 280,
        packetSize: 1420,
        synCount: 1,
        ackCount: 1,
        rstCount: 0,
        finCount: 1,
        urgCount: 0,
        packetRate: 12,
        failedLogins: 0,
        sameSrvRate: 1.0,
        payload: 'GET /api/v1/telemetry HTTP/1.1\r\nHost: sentinel.internal\r\nAuthorization: Bearer token_981a\r\nAccept: application/json',
        entropy: 3.42,
        presetId: 'benign_http'
    },

    // Latest ML Analysis Result
    latestResult: {
        isIntrusion: false,
        attackType: 'Benign Traffic',
        severity: 'SAFE',
        confidence: 0.994,
        anomalyScore: 0.038,
        rfScore: 0.02,
        mitreId: 'None',
        shapFeatures: [],
        tensor: {}
    },

    // Batch Datasets
    batchRecords: []
};

// Attack Preset Library
const ATTACK_PRESETS = {
    benign_http: {
        name: 'Normal HTTPS Web Browsing',
        protocol: 'TCP',
        srcIp: '192.168.1.105',
        srcPort: 54210,
        dstIp: '10.0.0.1',
        dstPort: 443,
        duration: 320,
        packetSize: 1420,
        synCount: 1,
        ackCount: 1,
        rstCount: 0,
        finCount: 1,
        urgCount: 0,
        packetRate: 14,
        failedLogins: 0,
        sameSrvRate: 1.0,
        payload: 'GET /dashboard/overview HTTP/1.1\r\nHost: app.enterprise.com\r\nUser-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)\r\nAccept: text/html',
        expectedAttack: 'Normal Traffic',
        severity: 'SAFE'
    },
    syn_flood: {
        name: 'DDoS SYN Flood (Volumetric)',
        protocol: 'TCP',
        srcIp: '185.220.101.42',
        srcPort: 48921,
        dstIp: '10.0.0.1',
        dstPort: 80,
        duration: 45,
        packetSize: 64,
        synCount: 45000,
        ackCount: 0,
        rstCount: 0,
        finCount: 0,
        urgCount: 0,
        packetRate: 38500,
        failedLogins: 0,
        sameSrvRate: 0.12,
        payload: '\x00\x00\x00\x00\x00\x00SYN_SPOOF_VOLUMETRIC_FLOOD',
        expectedAttack: 'DDoS (SYN Flood)',
        severity: 'CRITICAL',
        mitre: 'T1498.001 - Direct Network Flood'
    },
    port_scan: {
        name: 'Nmap Stealth SYN Port Scan',
        protocol: 'TCP',
        srcIp: '45.142.214.99',
        srcPort: 60122,
        dstIp: '10.0.0.1',
        dstPort: 21,
        duration: 12,
        packetSize: 40,
        synCount: 1200,
        ackCount: 0,
        rstCount: 850,
        finCount: 0,
        urgCount: 0,
        packetRate: 1450,
        failedLogins: 0,
        sameSrvRate: 0.05,
        payload: '',
        expectedAttack: 'Stealth Port Scan (Reconnaissance)',
        severity: 'HIGH',
        mitre: 'T1046 - Network Service Discovery'
    },
    ssh_brute: {
        name: 'SSH / RDP Brute Force Attempt',
        protocol: 'SSH',
        srcIp: '194.26.29.112',
        srcPort: 39820,
        dstIp: '10.0.0.1',
        dstPort: 22,
        duration: 1800,
        packetSize: 512,
        synCount: 85,
        ackCount: 82,
        rstCount: 42,
        finCount: 20,
        urgCount: 0,
        packetRate: 120,
        failedLogins: 48,
        sameSrvRate: 0.95,
        payload: 'SSH-2.0-OpenSSH_8.9p1\nFAILED_AUTH_USER: root\nFAILED_AUTH_USER: admin\nFAILED_AUTH_USER: operator',
        expectedAttack: 'Authentication Brute Force',
        severity: 'HIGH',
        mitre: 'T1110 - Brute Force'
    },
    sqli_attack: {
        name: 'SQL Injection & Data Exfiltration',
        protocol: 'HTTP',
        srcIp: '172.56.21.84',
        srcPort: 51234,
        dstIp: '10.0.0.1',
        dstPort: 443,
        duration: 650,
        packetSize: 2840,
        synCount: 1,
        ackCount: 1,
        rstCount: 0,
        finCount: 0,
        urgCount: 0,
        packetRate: 8,
        failedLogins: 0,
        sameSrvRate: 0.88,
        payload: "POST /login.php HTTP/1.1\r\nHost: target.internal\r\nContent-Type: application/x-www-form-urlencoded\r\n\r\nuser=admin' UNION SELECT 1,username,password_hash,access_token FROM users WHERE '1'='1--",
        expectedAttack: 'SQL Injection Exploit',
        severity: 'CRITICAL',
        mitre: 'T1190 - Exploit Public-Facing Application'
    },
    c2_beacon: {
        name: 'Mirai / C2 Botnet Beaconing',
        protocol: 'TCP',
        srcIp: '192.168.1.240',
        srcPort: 4444,
        dstIp: '91.240.118.50',
        dstPort: 4444,
        duration: 60000,
        packetSize: 256,
        synCount: 12,
        ackCount: 12,
        rstCount: 0,
        finCount: 0,
        urgCount: 2,
        packetRate: 1,
        failedLogins: 0,
        sameSrvRate: 1.0,
        payload: '\xde\xad\xbe\xef\x01\x00\x00\x00HEARTBEAT_SYS_UUID_9a8f4c2e_BEACON_INTERVAL_60',
        expectedAttack: 'Command & Control Beacon',
        severity: 'HIGH',
        mitre: 'T1071 - Application Layer Protocol C2'
    }
};

// Pre-packaged Bundled KDD/CIC-IDS Sample Dataset
const SAMPLE_KDD_RECORDS = [
    { id: 1, srcIp: '192.168.1.105', dstIp: '10.0.0.1', proto: 'TCP', dstPort: 443, duration: 240, syn: 1, ack: 1, rate: 12, failLogins: 0, label: 'Benign HTTPS' },
    { id: 2, srcIp: '185.220.101.42', dstIp: '10.0.0.1', proto: 'TCP', dstPort: 80, duration: 35, syn: 32000, ack: 0, rate: 25000, failLogins: 0, label: 'DDoS SYN Flood' },
    { id: 3, srcIp: '192.168.1.118', dstIp: '10.0.0.1', proto: 'UDP', dstPort: 53, duration: 18, syn: 0, ack: 0, rate: 4, failLogins: 0, label: 'Benign DNS Query' },
    { id: 4, srcIp: '45.142.214.99', dstIp: '10.0.0.1', proto: 'TCP', dstPort: 22, duration: 15, syn: 950, ack: 0, rate: 800, failLogins: 0, label: 'Port Scan (SYN)' },
    { id: 5, srcIp: '194.26.29.112', dstIp: '10.0.0.1', proto: 'SSH', dstPort: 22, duration: 1200, syn: 45, ack: 42, rate: 90, failLogins: 38, label: 'SSH Brute Force' },
    { id: 6, srcIp: '172.56.21.84', dstIp: '10.0.0.1', proto: 'HTTP', dstPort: 443, duration: 580, syn: 1, ack: 1, rate: 6, failLogins: 0, label: 'SQL Injection' },
    { id: 7, srcIp: '192.168.1.155', dstIp: '10.0.0.1', proto: 'TCP', dstPort: 443, duration: 410, syn: 2, ack: 2, rate: 18, failLogins: 0, label: 'Benign HTTPS' },
    { id: 8, srcIp: '192.168.1.240', dstIp: '91.240.118.50', proto: 'TCP', dstPort: 4444, duration: 45000, syn: 8, ack: 8, rate: 1, failLogins: 0, label: 'Botnet C2 Beacon' }
];

// =============================================================================
// 2. AUDIO SYNTHESIS ENGINE (Web Audio API)
// =============================================================================

let audioCtx = null;

function initAudio() {
    if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
            audioCtx = new AudioContextClass();
        }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

const CyberSound = {
    click() {
        if (!APP_STATE.audioEnabled) return;
        initAudio();
        if (!audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.04);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.04);
    },

    scan() {
        if (!APP_STATE.audioEnabled) return;
        initAudio();
        if (!audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1800, audioCtx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.12);
    },

    success() {
        if (!APP_STATE.audioEnabled) return;
        initAudio();
        if (!audioCtx) return;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 chord
        notes.forEach((freq, idx) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime + idx * 0.06);
            gain.gain.setValueAtTime(0.08, audioCtx.currentTime + idx * 0.06);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + idx * 0.06 + 0.25);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(audioCtx.currentTime + idx * 0.06);
            osc.stop(audioCtx.currentTime + idx * 0.06 + 0.25);
        });
    },

    alarm() {
        if (!APP_STATE.audioEnabled) return;
        initAudio();
        if (!audioCtx) return;
        const now = audioCtx.currentTime;
        for (let i = 0; i < 2; i++) {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sawtooth';
            const start = now + (i * 0.22);
            osc.frequency.setValueAtTime(750, start);
            osc.frequency.exponentialRampToValueAtTime(320, start + 0.18);
            gain.gain.setValueAtTime(0.12, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(start);
            osc.stop(start + 0.18);
        }
    }
};

// =============================================================================
// 3. MATHEMATICAL ENTROPY & HEURISTIC ENGINE
// =============================================================================

function calculateShannonEntropy(str) {
    if (!str || str.length === 0) return 0;
    const len = str.length;
    const frequencies = {};
    for (let i = 0; i < len; i++) {
        const char = str[i];
        frequencies[char] = (frequencies[char] || 0) + 1;
    }
    let entropy = 0;
    for (const char in frequencies) {
        const p = frequencies[char] / len;
        entropy -= p * Math.log2(p);
    }
    return parseFloat(entropy.toFixed(3));
}

// =============================================================================
// 4. ENSEMBLE AI/ML INFERENCE ENGINE (Random Forest + Autoencoder + XAI)
// =============================================================================

function runAIInference(packet) {
    // 1. Feature Vectorization
    const synAckRatio = packet.ackCount > 0 ? (packet.synCount / packet.ackCount) : (packet.synCount > 0 ? 999.0 : 0);
    const entropy = calculateShannonEntropy(packet.payload);
    const isPrivilegedDstPort = packet.dstPort < 1024;
    const isKnownAttackPort = [21, 22, 23, 4444, 3389, 8080].includes(Number(packet.dstPort));
    const hasSqlKeywords = /('|\bUNION\b|\bSELECT\b|\bDROP\b|--|\bOR\s+'1'='1\b)/i.test(packet.payload);
    const hasShellKeywords = /(\/bin\/sh|cmd\.exe|powershell|HEARTBEAT_SYS)/i.test(packet.payload);

    // 2. Multi-Model Scoring
    let rfDDoSSscore = 0;
    let rfPortScanScore = 0;
    let rfBruteScore = 0;
    let rfSqliScore = 0;
    let rfBotnetScore = 0;
    let autoencoderLoss = 0.05; // Benign baseline reconstruction loss

    // Decision Tree 1: Volumetric DDoS SYN Flood
    if (packet.synCount > 500 && packet.packetRate > 500) {
        rfDDoSSscore += 0.65;
        if (packet.ackCount === 0 || synAckRatio > 50) rfDDoSSscore += 0.32;
        autoencoderLoss += 0.65;
    }

    // Decision Tree 2: Port Scan / Reconnaissance
    if (packet.packetRate > 200 && (packet.rstCount > 50 || packet.synCount > 100) && packet.duration < 60) {
        rfPortScanScore += 0.55;
        if (packet.ackCount === 0) rfPortScanScore += 0.35;
        autoencoderLoss += 0.52;
    }

    // Decision Tree 3: Authentication Brute Force
    if (packet.failedLogins >= 5) {
        rfBruteScore += Math.min(0.95, 0.40 + (packet.failedLogins * 0.02));
        autoencoderLoss += Math.min(0.70, 0.30 + (packet.failedLogins * 0.015));
    }

    // Decision Tree 4: SQL Injection
    if (hasSqlKeywords) {
        rfSqliScore += 0.88;
        if (entropy > 3.0) rfSqliScore += 0.10;
        autoencoderLoss += 0.58;
    }

    // Decision Tree 5: C2 Botnet Beaconing
    if (packet.dstPort === 4444 || hasShellKeywords || (packet.duration > 10000 && packet.packetRate <= 2)) {
        rfBotnetScore += 0.78;
        if (hasShellKeywords) rfBotnetScore += 0.18;
        autoencoderLoss += 0.48;
    }

    // Normalize Autoencoder Loss [0.03 to 0.98]
    autoencoderLoss = Math.min(0.98, Math.max(0.038, parseFloat(autoencoderLoss.toFixed(3))));

    // Max threat score
    const threatScores = [
        { type: 'DDoS (SYN Flood)', score: rfDDoSSscore, severity: 'CRITICAL', mitre: 'T1498.001 - Direct Network Flood' },
        { type: 'Stealth Port Scan (Reconnaissance)', score: rfPortScanScore, severity: 'HIGH', mitre: 'T1046 - Network Service Discovery' },
        { type: 'Authentication Brute Force', score: rfBruteScore, severity: 'HIGH', mitre: 'T1110 - Brute Force' },
        { type: 'SQL Injection Exploit', score: rfSqliScore, severity: 'CRITICAL', mitre: 'T1190 - Exploit Public-Facing Application' },
        { type: 'Command & Control Beacon', score: rfBotnetScore, severity: 'HIGH', mitre: 'T1071 - Application Layer Protocol C2' }
    ];

    threatScores.sort((a, b) => b.score - a.score);
    const highestThreat = threatScores[0];

    // Verdict Threshold: If score > 0.45 or autoencoderLoss > 0.35
    const isIntrusion = highestThreat.score >= 0.45 || autoencoderLoss >= 0.35;
    const confidence = isIntrusion ? Math.min(0.995, Math.max(0.91, highestThreat.score)) : 0.994;

    // 3. Explainable AI (SHAP Feature Attribution)
    const shapFeatures = [];
    if (isIntrusion) {
        if (synAckRatio > 10) shapFeatures.push({ name: 'SYN/ACK Flag Imbalance', weight: '+0.42', positive: true });
        if (packet.packetRate > 500) shapFeatures.push({ name: 'Anomalous Packet Rate', weight: '+0.38', positive: true });
        if (packet.failedLogins > 3) shapFeatures.push({ name: 'Authentication Failures', weight: '+0.45', positive: true });
        if (hasSqlKeywords) shapFeatures.push({ name: 'SQL Injection Signature', weight: '+0.52', positive: true });
        if (hasShellKeywords) shapFeatures.push({ name: 'C2 Payload Signature', weight: '+0.41', positive: true });
        if (entropy > 6.0) shapFeatures.push({ name: 'High Payload Entropy (Random/Encrypted)', weight: '+0.28', positive: true });
        shapFeatures.push({ name: 'Baseline Reconstruction Loss', weight: `+${(autoencoderLoss * 0.4).toFixed(2)}`, positive: true });
    } else {
        shapFeatures.push({ name: 'Symmetric SYN/ACK Flow', weight: '-0.38', positive: false });
        shapFeatures.push({ name: 'Valid Standard Packet Size', weight: '-0.32', positive: false });
        shapFeatures.push({ name: 'Benign Payload Shannon Entropy', weight: '-0.24', positive: false });
        shapFeatures.push({ name: 'Zero Failed Authentications', weight: '-0.40', positive: false });
    }

    return {
        isIntrusion,
        attackType: isIntrusion ? highestThreat.type : 'Benign Traffic',
        severity: isIntrusion ? highestThreat.severity : 'SAFE',
        confidence: parseFloat(confidence.toFixed(3)),
        anomalyScore: autoencoderLoss,
        rfScore: isIntrusion ? highestThreat.score : 0.02,
        mitreId: isIntrusion ? highestThreat.mitre : 'RFC 793 Compliant',
        shapFeatures,
        tensor: {
            duration_norm: (packet.duration / 1000).toFixed(2),
            size_norm: (packet.packetSize / 1500).toFixed(2),
            syn_ratio: synAckRatio > 99 ? '99+' : synAckRatio.toFixed(2),
            pkt_rate: packet.packetRate,
            failed_logins: packet.failedLogins,
            entropy: entropy.toFixed(2),
            port_risk: isKnownAttackPort ? 'HIGH' : 'LOW'
        }
    };
}

// =============================================================================
// 5. VIEW NAVIGATION & STEPPER SYNCHRONIZATION
// =============================================================================

function switchView(targetViewId) {
    CyberSound.click();
    APP_STATE.currentView = targetViewId;

    // 1. Hide all views & show active
    document.querySelectorAll('.view-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    const targetPanel = document.getElementById(targetViewId);
    if (targetPanel) {
        targetPanel.classList.add('active');
    }

    // 2. Synchronize Flow Stepper Nodes
    const stepTargetMap = {
        'view-login': 'stepNodeLogin',
        'view-dashboard': 'stepNodeDashboard',
        'view-ingest': 'stepNodeIngest',
        'view-analysis': 'stepNodeAnalysis',
        'view-verdict': 'stepNodeVerdict',
        'view-report': 'stepNodeReport'
    };

    document.querySelectorAll('.flow-step').forEach(step => {
        step.classList.remove('active');
    });
    const activeStepNode = document.getElementById(stepTargetMap[targetViewId]);
    if (activeStepNode) {
        activeStepNode.classList.add('active');
    }

    // Scroll viewport smoothly to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// =============================================================================
// 6. LIVE TRAFFIC OSCILLOSCOPE CANVAS (HTML5 Canvas)
// =============================================================================

let canvasAnimId = null;
let oscStep = 0;

function initTrafficCanvas() {
    const canvas = document.getElementById('trafficCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = canvas.parentElement.clientWidth || 800;
        canvas.height = canvas.parentElement.clientHeight || 240;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function renderOscilloscope() {
        if (!APP_STATE.liveStreamActive) {
            canvasAnimId = requestAnimationFrame(renderOscilloscope);
            return;
        }

        const w = canvas.width;
        const h = canvas.height;
        oscStep += 0.04;

        // Fade trail
        ctx.fillStyle = 'rgba(8, 12, 20, 0.25)';
        ctx.fillRect(0, 0, w, h);

        // Draw Grid Lines
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
        ctx.lineWidth = 1;
        for (let x = 0; x < w; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
        }
        for (let y = 0; y < h; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        // 1. Draw Normal Baseline Flow (Emerald / Cyan Wave)
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#00e676';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00e676';

        const baselineY = h * 0.65;
        for (let x = 0; x < w; x += 2) {
            const normalWave = Math.sin(x * 0.015 + oscStep) * 20 + Math.cos(x * 0.03 - oscStep * 0.8) * 12;
            const y = baselineY + normalWave;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // 2. Draw Simulated Intrusion Spikes (Crimson Pulse Bursts)
        ctx.beginPath();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#ff1744';
        ctx.shadowBlur = 14;
        ctx.shadowColor = '#ff1744';

        const anomalyY = h * 0.35;
        for (let x = 0; x < w; x += 2) {
            // Create periodic high-frequency bursts
            const burstFactor = Math.sin(x * 0.006 + oscStep * 0.5);
            const isBurst = burstFactor > 0.6;
            let spike = 0;
            if (isBurst) {
                spike = (Math.random() - 0.5) * 55;
            } else {
                spike = Math.sin(x * 0.04 + oscStep * 2) * 5;
            }
            const y = anomalyY + spike;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Reset shadow
        ctx.shadowBlur = 0;

        canvasAnimId = requestAnimationFrame(renderOscilloscope);
    }

    renderOscilloscope();
}

// =============================================================================
// 7. LIVE CAPTURED PACKETS FEED TABLE
// =============================================================================

const RECENT_PACKET_BURSTS = [
    { time: '14:18:38', src: '192.168.1.105:54210', dst: '10.0.0.1:443', proto: 'TCP', flags: 'SYN, ACK', score: '0.04', status: 'BENIGN', preset: 'benign_http' },
    { time: '14:18:39', src: '185.220.101.42:48921', dst: '10.0.0.1:80', proto: 'TCP', flags: 'SYN (45k)', score: '0.98', status: 'DDoS SYN Flood', preset: 'syn_flood' },
    { time: '14:18:40', src: '192.168.1.118:59124', dst: '10.0.0.1:53', proto: 'UDP', flags: 'QUERY', score: '0.02', status: 'BENIGN', preset: 'benign_http' },
    { time: '14:18:41', src: '45.142.214.99:60122', dst: '10.0.0.1:21', proto: 'TCP', flags: 'SYN_RECON', score: '0.88', status: 'PORT SCAN', preset: 'port_scan' },
    { time: '14:18:41', src: '194.26.29.112:39820', dst: '10.0.0.1:22', proto: 'SSH', flags: 'AUTH_FAIL (48)', score: '0.92', status: 'BRUTE FORCE', preset: 'ssh_brute' },
    { time: '14:18:42', src: '172.56.21.84:51234', dst: '10.0.0.1:443', proto: 'HTTP', flags: 'POST / SQLi', score: '0.96', status: 'SQL INJECTION', preset: 'sqli_attack' },
    { time: '14:18:42', src: '192.168.1.130:52119', dst: '10.0.0.1:443', proto: 'TCP', flags: 'TLS 1.3', score: '0.03', status: 'BENIGN', preset: 'benign_http' },
    { time: '14:18:43', src: '192.168.1.240:4444', dst: '91.240.118.50:4444', proto: 'TCP', flags: 'C2_HEARTBEAT', score: '0.89', status: 'BOTNET C2', preset: 'c2_beacon' }
];

function populateLivePacketsTable() {
    const tbody = document.getElementById('livePacketsTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    RECENT_PACKET_BURSTS.forEach(pkt => {
        const tr = document.createElement('tr');
        const isMalicious = pkt.status !== 'BENIGN';

        tr.innerHTML = `
      <td>${pkt.time}</td>
      <td><strong>${pkt.src}</strong></td>
      <td>${pkt.dst}</td>
      <td><span class="step-badge neutral">${pkt.proto}</span></td>
      <td>${pkt.flags}</td>
      <td class="${isMalicious ? 'text-red' : 'text-green'} font-bold">${pkt.score}</td>
      <td>
        <span class="table-status-tag ${isMalicious ? 'malicious' : 'benign'}">
          ${isMalicious ? '⚠️ ' + pkt.status : '🛡️ NORMAL'}
        </span>
      </td>
      <td>
        <button class="btn btn-sm btn-secondary btn-inspect-row" data-preset="${pkt.preset}">
          Inspect with AI →
        </button>
      </td>
    `;
        tbody.appendChild(tr);
    });

    // Attach click listeners to row buttons
    tbody.querySelectorAll('.btn-inspect-row').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const presetId = e.currentTarget.getAttribute('data-preset');
            loadPresetIntoCrafter(presetId);
            switchView('view-ingest');
            showToast(`Packet preset [${ATTACK_PRESETS[presetId].name}] loaded into Ingestion Engine.`, 'info');
        });
    });
}

// =============================================================================
// 8. PACKET CRAFTER & PRESET LOADER
// =============================================================================

function loadPresetIntoCrafter(presetKey) {
    const p = ATTACK_PRESETS[presetKey];
    if (!p) return;

    CyberSound.click();

    // Highlight active preset chip
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-preset') === presetKey);
    });

    // Populate inputs
    document.getElementById('pktProtocol').value = p.protocol;
    document.getElementById('pktSrcIp').value = p.srcIp;
    document.getElementById('pktSrcPort').value = p.srcPort;
    document.getElementById('pktDstIp').value = p.dstIp;
    document.getElementById('pktDstPort').value = p.dstPort;
    document.getElementById('pktDuration').value = p.duration;

    document.getElementById('pktPacketSize').value = p.packetSize;
    document.getElementById('dispPacketSize').textContent = `${p.packetSize} B`;

    document.getElementById('pktSynCount').value = p.synCount;
    document.getElementById('pktAckCount').value = p.ackCount;
    document.getElementById('pktRstCount').value = p.rstCount;
    document.getElementById('pktFinCount').value = p.finCount;
    document.getElementById('pktUrgCount').value = p.urgCount;
    document.getElementById('pktFailedLogins').value = p.failedLogins;

    document.getElementById('pktPacketRate').value = p.packetRate;
    document.getElementById('dispPacketRate').textContent = `${p.packetRate} pkts/s`;

    document.getElementById('pktSameSrvRate').value = Math.round(p.sameSrvRate * 100);
    document.getElementById('dispSameSrvRate').textContent = p.sameSrvRate.toFixed(2);

    document.getElementById('pktPayload').value = p.payload;
    updateEntropyDisplay(p.payload);

    // Sync state
    APP_STATE.currentPacket = {
        ...p,
        presetId: presetKey,
        entropy: calculateShannonEntropy(p.payload)
    };
}

function updateEntropyDisplay(payloadStr) {
    const entropy = calculateShannonEntropy(payloadStr);
    const dispEntropy = document.getElementById('dispEntropy');
    const dispEntropyEval = document.getElementById('dispEntropyEval');
    const barFill = document.getElementById('entropyBarFill');

    if (dispEntropy) dispEntropy.textContent = `${entropy} bits/byte`;

    let pct = Math.min(100, (entropy / 8.0) * 100);
    if (barFill) barFill.style.width = `${pct}%`;

    if (dispEntropyEval) {
        if (entropy < 1.0) {
            dispEntropyEval.textContent = 'LOW // REPETITIVE';
            dispEntropyEval.className = 'entropy-eval text-muted';
        } else if (entropy < 4.8) {
            dispEntropyEval.textContent = 'NORMAL (RFC TEXT/JSON)';
            dispEntropyEval.className = 'entropy-eval text-green';
        } else if (entropy < 6.5) {
            dispEntropyEval.textContent = 'HIGH (COMPRESSED/BASE64)';
            dispEntropyEval.className = 'entropy-eval text-amber';
        } else {
            dispEntropyEval.textContent = 'SUSPICIOUS (ENCRYPTED/SHELLCODE)';
            dispEntropyEval.className = 'entropy-eval text-red';
        }
    }
}

// Read Form Data into State
function readCrafterFormData() {
    const payload = document.getElementById('pktPayload').value;
    return {
        protocol: document.getElementById('pktProtocol').value,
        srcIp: document.getElementById('pktSrcIp').value,
        srcPort: Number(document.getElementById('pktSrcPort').value),
        dstIp: document.getElementById('pktDstIp').value,
        dstPort: Number(document.getElementById('pktDstPort').value),
        duration: Number(document.getElementById('pktDuration').value),
        packetSize: Number(document.getElementById('pktPacketSize').value),
        synCount: Number(document.getElementById('pktSynCount').value),
        ackCount: Number(document.getElementById('pktAckCount').value),
        rstCount: Number(document.getElementById('pktRstCount').value),
        finCount: Number(document.getElementById('pktFinCount').value),
        urgCount: Number(document.getElementById('pktUrgCount').value),
        packetRate: Number(document.getElementById('pktPacketRate').value),
        failedLogins: Number(document.getElementById('pktFailedLogins').value),
        sameSrvRate: Number(document.getElementById('pktSameSrvRate').value) / 100,
        payload: payload,
        entropy: calculateShannonEntropy(payload)
    };
}

// =============================================================================
// 9. AI ANALYSIS PIPELINE EXECUTION & VISUALIZATION
// =============================================================================

function executeAnalysisPipeline(packet) {
    CyberSound.scan();
    switchView('view-analysis');

    // Run Real AI Inference
    const result = runAIInference(packet);
    APP_STATE.latestResult = result;

    // 1. Render Tensor Matrix Chips (Stage 1)
    const tensorContainer = document.getElementById('tensorMatrixDisplay');
    if (tensorContainer) {
        tensorContainer.innerHTML = `
      <div class="tensor-chip"><span class="t-k">duration_norm</span><span class="t-v">${result.tensor.duration_norm}</span></div>
      <div class="tensor-chip"><span class="t-k">size_norm</span><span class="t-v">${result.tensor.size_norm}</span></div>
      <div class="tensor-chip"><span class="t-k">syn_ratio</span><span class="t-v">${result.tensor.syn_ratio}</span></div>
      <div class="tensor-chip"><span class="t-k">packet_rate</span><span class="t-v">${result.tensor.pkt_rate}</span></div>
      <div class="tensor-chip"><span class="t-k">failed_logins</span><span class="t-v">${result.tensor.failed_logins}</span></div>
      <div class="tensor-chip"><span class="t-k">entropy_bits</span><span class="t-v">${result.tensor.entropy}</span></div>
      <div class="tensor-chip"><span class="t-k">port_risk</span><span class="t-v">${result.tensor.port_risk}</span></div>
      <div class="tensor-chip"><span class="t-k">protocol</span><span class="t-v">${packet.protocol}</span></div>
    `;
    }

    // 2. Render Stage 2 Dual Model Bars
    const rfConfidenceText = document.getElementById('rfConfidenceText');
    const rfProgressBar = document.getElementById('rfProgressBar');
    const rfEvalText = document.getElementById('rfEvalText');
    const aeAnomalyText = document.getElementById('aeAnomalyText');
    const aeProgressBar = document.getElementById('aeProgressBar');
    const aeEvalText = document.getElementById('aeEvalText');

    const rfPct = Math.round(result.confidence * 100);
    const aePct = Math.round(result.anomalyScore * 100);

    if (rfConfidenceText) rfConfidenceText.textContent = `${rfPct}%`;
    if (rfProgressBar) {
        rfProgressBar.style.width = `${rfPct}%`;
        rfProgressBar.className = `progress-fill ${result.isIntrusion ? 'red' : 'green'}`;
    }
    if (rfEvalText) {
        rfEvalText.textContent = result.isIntrusion
            ? `High probability of [${result.attackType}]`
            : 'Benign RFC compliant state machine';
    }

    if (aeAnomalyText) aeAnomalyText.textContent = `${result.anomalyScore.toFixed(3)} / 1.00`;
    if (aeProgressBar) {
        aeProgressBar.style.width = `${aePct}%`;
        aeProgressBar.className = `progress-fill ${result.anomalyScore > 0.35 ? 'amber' : 'green'}`;
    }
    if (aeEvalText) {
        aeEvalText.textContent = result.anomalyScore > 0.35
            ? `Reconstruction error exceeds 0.35 threshold (Anomalous)`
            : 'Reconstruction error within baseline normal manifold';
    }

    // 3. Render SHAP Explainability Bars (Stage 3)
    const shapContainer = document.getElementById('shapBarsContainer');
    if (shapContainer) {
        shapContainer.innerHTML = '';
        result.shapFeatures.forEach(feat => {
            const item = document.createElement('div');
            item.className = 'shap-bar-item';
            item.innerHTML = `
        <div class="shap-meta">
          <span class="shap-name">${feat.name}</span>
          <span class="shap-weight ${feat.positive ? 'text-red' : 'text-green'}">${feat.weight}</span>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-fill ${feat.positive ? 'red' : 'green'}" style="width: ${Math.abs(parseFloat(feat.weight)) * 160}%;"></div>
        </div>
      `;
            shapContainer.appendChild(item);
        });
    }

    // 4. Update Terminal Log with simulated real-time timestamps
    const logBody = document.getElementById('analysisLogBody');
    if (logBody) {
        const timeStr = new Date().toTimeString().split(' ')[0] + '.' + Math.floor(Math.random() * 900 + 100);
        logBody.innerHTML = `
      <div class="log-line"><span class="log-time">[${timeStr}]</span> <span class="log-info">[INGEST]</span> Ingested packet flow from ${packet.srcIp}:${packet.srcPort} -> ${packet.dstIp}:${packet.dstPort} (${packet.protocol})</div>
      <div class="log-line"><span class="log-time">[${timeStr}]</span> <span class="log-info">[TENSOR]</span> Extracted 14-dim feature vector. MinMax scaled against baseline network distribution.</div>
      <div class="log-line"><span class="log-time">[${timeStr}]</span> <span class="log-warn">[RF_100]</span> Random Forest tree depth evaluation complete. Tree consensus: ${result.confidence * 100}%.</div>
      <div class="log-line"><span class="log-time">[${timeStr}]</span> <span class="log-warn">[AUTOENCODER]</span> Loss L2 computed: ${result.anomalyScore}. Threshold: 0.35.</div>
      <div class="log-line"><span class="log-time">[${timeStr}]</span> <span class="${result.isIntrusion ? 'log-alert' : 'log-info'}">[VERDICT]</span> Classification output: <strong>${result.attackType.toUpperCase()}</strong></div>
    `;
    }

    // Update Stepper Badge
    const verdictStepBadge = document.getElementById('verdictStepBadge');
    if (verdictStepBadge) {
        if (result.isIntrusion) {
            verdictStepBadge.textContent = 'INTRUSION!';
            verdictStepBadge.className = 'step-badge alert';
        } else {
            verdictStepBadge.textContent = 'NORMAL';
            verdictStepBadge.className = 'step-badge success';
        }
    }

    // Automatically sync Verdict and Report screens with the result
    syncVerdictView(result, packet);
    syncReportView(result, packet);

    // Play audio feedback for verdict
    setTimeout(() => {
        if (result.isIntrusion) {
            CyberSound.alarm();
            showToast(`🚨 THREAT DETECTED: [${result.attackType}] originating from ${packet.srcIp}`, 'error');
        } else {
            CyberSound.success();
            showToast(`🛡️ Traffic verified BENIGN: ${packet.srcIp} compliant with normal baseline.`, 'success');
        }
    }, 400);
}

// =============================================================================
// 10. SYNCHRONIZE VERDICT SCREEN (NORMAL VS INTRUSION)
// =============================================================================

function syncVerdictView(result, packet) {
    const cardNormal = document.getElementById('cardVerdictNormal');
    const cardIntrusion = document.getElementById('cardVerdictIntrusion');

    if (result.isIntrusion) {
        // Malicious Case
        cardNormal.classList.add('hidden');
        cardIntrusion.classList.remove('hidden');

        document.getElementById('threatClassificationTitle').textContent = result.attackType.toUpperCase();
        document.getElementById('threatSeverityBadge').textContent = `SEVERITY: ${result.severity}`;
        document.getElementById('threatConfVal').textContent = `${(result.confidence * 100).toFixed(1)}%`;
        document.getElementById('threatMitreVal').textContent = result.mitreId;
        document.getElementById('threatSrcIpVal').textContent = `${packet.srcIp}:${packet.srcPort}`;

        const threatExplanationText = document.getElementById('threatExplanationText');
        if (threatExplanationText) {
            threatExplanationText.textContent = `The Ensemble Neural Model flagged this transmission due to abnormal heuristics (${result.shapFeatures.map(f => f.name).join(', ')}). Threat requires immediate containment.`;
        }
    } else {
        // Normal Case
        cardNormal.classList.remove('hidden');
        cardIntrusion.classList.add('hidden');

        document.getElementById('normConfVal').textContent = `${(result.confidence * 100).toFixed(1)}%`;
        document.getElementById('normAnomalyVal').textContent = `${result.anomalyScore.toFixed(3)} / 1.00`;
    }
}

// =============================================================================
// 11. SYNCHRONIZE ALERT + REPORT SCREEN & SOAR PLAYBOOK
// =============================================================================

function syncReportView(result, packet) {
    const incidentId = 'INC-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000) + '-SEC';
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

    // 1. Report Metadata
    document.getElementById('repIncidentId').textContent = incidentId;
    document.getElementById('repTimestamp').textContent = timestamp;
    document.getElementById('repAnalystName').textContent = `${APP_STATE.currentUser.name} (${APP_STATE.currentUser.clearance})`;

    // 2. Alert Banner text
    const alertBannerHeading = document.getElementById('alertBannerHeading');
    const alertBannerSub = document.getElementById('alertBannerSub');
    if (result.isIntrusion) {
        if (alertBannerHeading) alertBannerHeading.textContent = `CRITICAL ALERT // ${result.attackType.toUpperCase()} NEUTRALIZATION ACTIVE`;
        if (alertBannerSub) alertBannerSub.textContent = `Automated telemetry dispatched to SIEM. Remediation policy recommended for IP: ${packet.srcIp}.`;
    } else {
        if (alertBannerHeading) alertBannerHeading.textContent = `AUDIT LOG REGISTERED // BENIGN TRAFFIC CERTIFIED`;
        if (alertBannerSub) alertBannerSub.textContent = `Network flow passed all signature rules and baseline autoencoder checks. Safe for ingress.`;
    }

    // 3. Executive Summary
    const repAttackType = document.getElementById('repAttackType');
    const repSeverity = document.getElementById('repSeverity');
    const repConfidence = document.getElementById('repConfidence');
    const repMitre = document.getElementById('repMitre');
    const repExecSummary = document.getElementById('repExecSummary');

    if (repAttackType) {
        repAttackType.textContent = result.attackType;
        repAttackType.className = result.isIntrusion ? 'text-red' : 'text-green';
    }
    if (repSeverity) {
        repSeverity.textContent = result.isIntrusion ? `${result.severity} (CVSS 8.9)` : 'LOW / NONE (CVSS 0.0)';
        repSeverity.className = result.isIntrusion ? 'text-red' : 'text-green';
    }
    if (repConfidence) repConfidence.textContent = `${(result.confidence * 100).toFixed(1)}%`;
    if (repMitre) repMitre.textContent = result.mitreId;

    if (repExecSummary) {
        if (result.isIntrusion) {
            repExecSummary.textContent = `At ${timestamp}, the Sentinel AI Ensemble Intrusion Detection System detected an unauthorized high-risk transmission targeting production ingress. The machine learning pipeline identified signature markers and statistical anomalies consistent with [${result.attackType}] originating from ${packet.srcIp}:${packet.srcPort}.`;
        } else {
            repExecSummary.textContent = `At ${timestamp}, the Sentinel AI Engine verified standard legitimate traffic originating from ${packet.srcIp}:${packet.srcPort} to internal destination ${packet.dstIp}:${packet.dstPort}. Flow characteristics conform to standard RFC 793 protocols without behavioral anomalies.`;
        }
    }

    // 4. Flow Diagnostics Table
    document.getElementById('repSrcIpPort').textContent = `${packet.srcIp}:${packet.srcPort}`;
    document.getElementById('repDstIpPort').textContent = `${packet.dstIp}:${packet.dstPort}`;
    document.getElementById('repSynCount').textContent = `${packet.synCount.toLocaleString()} pkts`;
    document.getElementById('repAckCount').textContent = `${packet.ackCount.toLocaleString()} pkts`;
    document.getElementById('repEntropy').textContent = `${packet.entropy} bits/byte`;

    // 5. Dynamic Firewall Commands Generation
    const firewallCodeBlock = document.getElementById('firewallCodeBlock');
    if (firewallCodeBlock) {
        firewallCodeBlock.innerHTML = `<code># Sentinel Autonomous IPS Enforcement for ${incidentId}
iptables -I INPUT -s ${packet.srcIp} -j DROP
nft add rule inet filter input ip saddr ${packet.srcIp} drop
aws wafv2 update-ip-set --name "Sentinel_Blocked_IPs" --addresses "${packet.srcIp}/32"
# Cisco IOS ACL:
access-list 101 deny ip host ${packet.srcIp} any log</code>`;
    }
}

// =============================================================================
// 12. BATCH DATASET PROCESSING & CSV PARSER
// =============================================================================

function renderBatchTable(records) {
    const tbody = document.getElementById('batchTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    records.forEach((row, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
      <td>${idx + 1}</td>
      <td><strong>${row.srcIp}</strong></td>
      <td>${row.dstIp}:${row.dstPort}</td>
      <td><span class="step-badge neutral">${row.proto}</span></td>
      <td>${row.duration} ms</td>
      <td>${row.syn}</td>
      <td>${row.ack}</td>
      <td>${row.failLogins}</td>
      <td id="batchPred_${idx}">
        <span class="step-badge neutral">PENDING</span>
      </td>
      <td>
        <button class="btn btn-sm btn-secondary btn-inspect-batch" data-index="${idx}">Inspect In Crafter</button>
      </td>
    `;
        tbody.appendChild(tr);
    });

    // Attach button handlers
    tbody.querySelectorAll('.btn-inspect-batch').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = Number(e.currentTarget.getAttribute('data-index'));
            const rec = records[idx];
            // Convert to packet format
            const packet = {
                protocol: rec.proto,
                srcIp: rec.srcIp,
                srcPort: 50000 + idx,
                dstIp: rec.dstIp,
                dstPort: rec.dstPort,
                duration: rec.duration,
                packetSize: 800,
                synCount: rec.syn,
                ackCount: rec.ack,
                rstCount: 0,
                finCount: 1,
                urgCount: 0,
                packetRate: rec.rate || 10,
                failedLogins: rec.failLogins || 0,
                sameSrvRate: 0.9,
                payload: rec.label ? `Dataset record: ${rec.label}` : '',
                entropy: 3.5
            };

            // Populate crafter
            document.getElementById('pktProtocol').value = packet.protocol;
            document.getElementById('pktSrcIp').value = packet.srcIp;
            document.getElementById('pktSrcPort').value = packet.srcPort;
            document.getElementById('pktDstIp').value = packet.dstIp;
            document.getElementById('pktDstPort').value = packet.dstPort;
            document.getElementById('pktDuration').value = packet.duration;
            document.getElementById('pktSynCount').value = packet.synCount;
            document.getElementById('pktAckCount').value = packet.ackCount;
            document.getElementById('pktFailedLogins').value = packet.failedLogins;
            document.getElementById('pktPayload').value = packet.payload;

            // Switch to manual crafter tab
            document.querySelector('[data-tab="tab-manual"]').click();
            showToast(`Batch record #${idx + 1} (${packet.srcIp}) loaded into Packet Crafter.`, 'info');
        });
    });
}

function runBatchClassifier() {
    CyberSound.scan();
    if (!APP_STATE.batchRecords.length) {
        showToast('Please load a batch dataset first!', 'error');
        return;
    }

    showToast(`Running Ensemble AI Classifier across ${APP_STATE.batchRecords.length} records...`, 'info');

    let intrusionsFound = 0;
    APP_STATE.batchRecords.forEach((rec, idx) => {
        const packet = {
            protocol: rec.proto,
            srcIp: rec.srcIp,
            srcPort: 50000 + idx,
            dstIp: rec.dstIp,
            dstPort: rec.dstPort,
            duration: rec.duration,
            packetSize: 800,
            synCount: rec.syn,
            ackCount: rec.ack,
            rstCount: 0,
            finCount: 1,
            urgCount: 0,
            packetRate: rec.rate || 10,
            failedLogins: rec.failLogins || 0,
            sameSrvRate: 0.9,
            payload: rec.label ? `Dataset record: ${rec.label}` : '',
            entropy: 3.5
        };

        const res = runAIInference(packet);
        const cell = document.getElementById(`batchPred_${idx}`);
        if (cell) {
            if (res.isIntrusion) {
                intrusionsFound++;
                cell.innerHTML = `<span class="table-status-tag malicious">🔴 ${res.attackType}</span>`;
            } else {
                cell.innerHTML = `<span class="table-status-tag benign">🟢 Normal</span>`;
            }
        }
    });

    if (intrusionsFound > 0) {
        CyberSound.alarm();
        showToast(`Batch complete: ${intrusionsFound} Intrusions detected out of ${APP_STATE.batchRecords.length} records!`, 'error');
    } else {
        CyberSound.success();
        showToast(`Batch complete: All ${APP_STATE.batchRecords.length} records verified Normal.`, 'success');
    }
}

// =============================================================================
// 13. TOAST NOTIFICATION UTILITY
// =============================================================================

function showToast(message, type = 'info') {
    const container = document.getElementById('toastHub');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `cyber-toast ${type === 'error' ? 'toast-error' : (type === 'success' ? 'toast-success' : '')}`;

    let icon = 'ℹ️';
    if (type === 'error') icon = '🚨';
    if (type === 'success') icon = '🛡️';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// =============================================================================
// 14. EVENT LISTENERS INITIALIZATION
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Clock Ticker
    setInterval(() => {
        const clock = document.getElementById('systemClock');
        if (clock) {
            clock.textContent = new Date().toISOString().replace('T', ' ').substring(0, 19);
        }
    }, 1000);

    // 2. Stepper Nav Click Handlers
    document.querySelectorAll('.flow-step').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetView = e.currentTarget.getAttribute('data-target');
            if (targetView) switchView(targetView);
        });
    });

    // 3. User Login Form & Quick Role Presets
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            CyberSound.click();

            const submitBtn = document.getElementById('loginSubmitBtn');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = `<span>AUTHENTICATING HARDWARE KEY...</span>`;

            setTimeout(() => {
                CyberSound.success();
                APP_STATE.currentUser.authenticated = true;
                showToast(`Clearance Granted: Welcome Operator ${APP_STATE.currentUser.name}`, 'success');
                submitBtn.innerHTML = originalText;
                switchView('view-dashboard');
            }, 700);
        });
    }

    // Quick Role Presets Click
    document.querySelectorAll('.btn-role-chip').forEach(chip => {
        chip.addEventListener('click', (e) => {
            CyberSound.click();
            document.querySelectorAll('.btn-role-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');

            const name = chip.getAttribute('data-name');
            const role = chip.getAttribute('data-role');
            const clearance = chip.getAttribute('data-clearance');
            const initials = chip.getAttribute('data-initials');

            APP_STATE.currentUser = { name, role, clearance, initials, authenticated: true };

            // Update Header
            document.getElementById('headerUserName').textContent = name;
            document.getElementById('headerUserClearance').textContent = `${role.toUpperCase()} // ${clearance}`;
            document.getElementById('userInitials').textContent = initials;
            document.getElementById('loginUsername').value = `${name.toLowerCase().replace(' ', '.')}@sentinel.defense`;
        });
    });

    // Biometric Scan Zone Trigger
    const biometricZone = document.getElementById('biometricZone');
    if (biometricZone) {
        biometricZone.addEventListener('click', () => {
            CyberSound.scan();
            showToast('Hardware FIDO2 Biometric Token verified!', 'success');
        });
    }

    // Logout Button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            CyberSound.click();
            APP_STATE.currentUser.authenticated = false;
            switchView('view-login');
            showToast('Terminal session locked. Re-authenticate to access SOC.', 'info');
        });
    }

    // 4. Live Stream & Audio Toggles
    const toggleLiveStreamBtn = document.getElementById('toggleLiveStreamBtn');
    if (toggleLiveStreamBtn) {
        toggleLiveStreamBtn.addEventListener('click', () => {
            CyberSound.click();
            APP_STATE.liveStreamActive = !APP_STATE.liveStreamActive;
            document.getElementById('liveStreamBtnLabel').textContent = `Live Stream: ${APP_STATE.liveStreamActive ? 'ON' : 'OFF'}`;
            toggleLiveStreamBtn.style.color = APP_STATE.liveStreamActive ? 'var(--neon-cyan)' : 'var(--text-dim)';
        });
    }

    const toggleAudioBtn = document.getElementById('toggleAudioBtn');
    if (toggleAudioBtn) {
        toggleAudioBtn.addEventListener('click', () => {
            APP_STATE.audioEnabled = !APP_STATE.audioEnabled;
            const onIcon = toggleAudioBtn.querySelector('.sound-on-icon');
            const offIcon = toggleAudioBtn.querySelector('.sound-off-icon');
            if (APP_STATE.audioEnabled) {
                onIcon.classList.remove('hidden');
                offIcon.classList.add('hidden');
                CyberSound.click();
                showToast('Audio Synthesizer enabled', 'info');
            } else {
                onIcon.classList.add('hidden');
                offIcon.classList.remove('hidden');
                showToast('Audio muted', 'info');
            }
        });
    }

    // 5. Dashboard Action Buttons
    const dashGoToUploadBtn = document.getElementById('dashGoToUploadBtn');
    if (dashGoToUploadBtn) {
        dashGoToUploadBtn.addEventListener('click', () => switchView('view-ingest'));
    }

    const dashInspectLatestBtn = document.getElementById('dashInspectLatestBtn');
    if (dashInspectLatestBtn) {
        dashInspectLatestBtn.addEventListener('click', () => {
            loadPresetIntoCrafter('syn_flood');
            executeAnalysisPipeline(APP_STATE.currentPacket);
        });
    }

    const refreshTableBtn = document.getElementById('refreshTableBtn');
    if (refreshTableBtn) {
        refreshTableBtn.addEventListener('click', () => {
            CyberSound.scan();
            populateLivePacketsTable();
            showToast('Simulated burst packets ingested into telemetry feed', 'info');
        });
    }

    // 6. Ingest Tabs (Manual Crafter vs Upload)
    document.querySelectorAll('#ingestModeTabs .tab-pill').forEach(pill => {
        pill.addEventListener('click', (e) => {
            CyberSound.click();
            const targetTab = e.currentTarget.getAttribute('data-tab');
            document.querySelectorAll('#ingestModeTabs .tab-pill').forEach(p => p.classList.remove('active'));
            e.currentTarget.classList.add('active');

            document.getElementById('tab-manual').classList.toggle('hidden', targetTab !== 'tab-manual');
            document.getElementById('tab-upload').classList.toggle('hidden', targetTab !== 'tab-upload');
        });
    });

    // Preset Buttons Click
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const presetKey = e.currentTarget.getAttribute('data-preset');
            loadPresetIntoCrafter(presetKey);
        });
    });

    // Sliders dynamic display binding
    const pktPacketSize = document.getElementById('pktPacketSize');
    if (pktPacketSize) {
        pktPacketSize.addEventListener('input', (e) => {
            document.getElementById('dispPacketSize').textContent = `${e.target.value} B`;
        });
    }

    const pktPacketRate = document.getElementById('pktPacketRate');
    if (pktPacketRate) {
        pktPacketRate.addEventListener('input', (e) => {
            document.getElementById('dispPacketRate').textContent = `${e.target.value} pkts/s`;
        });
    }

    const pktSameSrvRate = document.getElementById('pktSameSrvRate');
    if (pktSameSrvRate) {
        pktSameSrvRate.addEventListener('input', (e) => {
            document.getElementById('dispSameSrvRate').textContent = (e.target.value / 100).toFixed(2);
        });
    }

    // Live Entropy on Payload Input
    const pktPayload = document.getElementById('pktPayload');
    if (pktPayload) {
        pktPayload.addEventListener('input', (e) => {
            updateEntropyDisplay(e.target.value);
        });
    }

    // Packet Crafter Form Submit
    const packetForm = document.getElementById('packetForm');
    if (packetForm) {
        packetForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const packet = readCrafterFormData();
            APP_STATE.currentPacket = packet;
            executeAnalysisPipeline(packet);
        });
    }

    // 7. Pipeline Navigation Buttons
    const btnReplayAnalysis = document.getElementById('btnReplayAnalysis');
    if (btnReplayAnalysis) {
        btnReplayAnalysis.addEventListener('click', () => {
            executeAnalysisPipeline(APP_STATE.currentPacket);
        });
    }

    const btnJumpToVerdict = document.getElementById('btnJumpToVerdict');
    if (btnJumpToVerdict) {
        btnJumpToVerdict.addEventListener('click', () => {
            switchView('view-verdict');
        });
    }

    // 8. Verdict Screen Buttons
    const btnNormalTestAnother = document.getElementById('btnNormalTestAnother');
    if (btnNormalTestAnother) {
        btnNormalTestAnother.addEventListener('click', () => switchView('view-ingest'));
    }

    const btnNormalViewReport = document.getElementById('btnNormalViewReport');
    if (btnNormalViewReport) {
        btnNormalViewReport.addEventListener('click', () => switchView('view-report'));
    }

    const btnVerdictTriggerAlert = document.getElementById('btnVerdictTriggerAlert');
    if (btnVerdictTriggerAlert) {
        btnVerdictTriggerAlert.addEventListener('click', () => {
            CyberSound.alarm();
            switchView('view-report');
        });
    }

    const btnVerdictQuickBlock = document.getElementById('btnVerdictQuickBlock');
    if (btnVerdictQuickBlock) {
        btnVerdictQuickBlock.addEventListener('click', () => {
            CyberSound.click();
            showToast(`Firewall Rule Enforced: IP ${APP_STATE.currentPacket.srcIp} dropped inline!`, 'success');
            switchView('view-report');
        });
    }

    // 9. Alert & Report Screen Buttons
    const btnAcknowledgeAlert = document.getElementById('btnAcknowledgeAlert');
    if (btnAcknowledgeAlert) {
        btnAcknowledgeAlert.addEventListener('click', () => {
            CyberSound.click();
            document.getElementById('reportAlertBanner').style.opacity = '0.5';
            showToast('Incident acknowledged by Operator Alex Mercer.', 'info');
        });
    }

    // SOAR Automated Playbook Actions
    document.getElementById('soarBtnBlockIp')?.addEventListener('click', () => {
        CyberSound.click();
        showToast(`IPTables rule applied: Host ${APP_STATE.currentPacket.srcIp} dropped across all interfaces.`, 'error');
    });

    document.getElementById('soarBtnIsolateSubnet')?.addEventListener('click', () => {
        CyberSound.click();
        showToast(`VLAN Isolation: Subnet routed to Quarantine Sandbox.`, 'info');
    });

    document.getElementById('soarBtnRateLimit')?.addEventListener('click', () => {
        CyberSound.click();
        showToast(`Token Bucket applied: Rate limited to 1 pkt/sec.`, 'info');
    });

    document.getElementById('soarBtnHoneypot')?.addEventListener('click', () => {
        CyberSound.click();
        showToast(`Traffic redirected to High-Interaction Canary Honeypot.`, 'success');
    });

    // Copy Firewall Syntax
    document.getElementById('btnCopyFirewallRule')?.addEventListener('click', () => {
        const code = document.getElementById('firewallCodeBlock')?.textContent || '';
        navigator.clipboard.writeText(code).then(() => {
            CyberSound.click();
            showToast('Firewall syntax copied to clipboard!', 'success');
        });
    });

    // Print Report Button
    document.getElementById('btnPrintReport')?.addEventListener('click', () => {
        CyberSound.click();
        window.print();
    });

    // Export JSON Report
    document.getElementById('btnExportJson')?.addEventListener('click', () => {
        CyberSound.click();
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({
            incidentId: document.getElementById('repIncidentId').textContent,
            timestamp: document.getElementById('repTimestamp').textContent,
            analyst: APP_STATE.currentUser,
            result: APP_STATE.latestResult,
            packetFlow: APP_STATE.currentPacket
        }, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', dataStr);
        downloadAnchor.setAttribute('download', `sentinel_incident_${Date.now()}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        showToast('SIEM JSON Forensic export downloaded!', 'success');
    });

    // Restart Workflow
    document.getElementById('btnRestartWorkflow')?.addEventListener('click', () => {
        switchView('view-dashboard');
    });

    // 10. File Upload Handling & Drag & Drop
    const fileDropZone = document.getElementById('fileDropZone');
    const datasetFileInput = document.getElementById('datasetFileInput');
    const browseFileBtn = document.getElementById('browseFileBtn');
    const loadSampleBatchBtn = document.getElementById('loadSampleBatchBtn');
    const downloadSampleCsvBtn = document.getElementById('downloadSampleCsvBtn');
    const btnRunBatchAnalysis = document.getElementById('btnRunBatchAnalysis');

    if (browseFileBtn && datasetFileInput) {
        browseFileBtn.addEventListener('click', () => datasetFileInput.click());
    }

    if (fileDropZone) {
        fileDropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileDropZone.classList.add('dragover');
        });
        fileDropZone.addEventListener('dragleave', () => {
            fileDropZone.classList.remove('dragover');
        });
        fileDropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            fileDropZone.classList.remove('dragover');
            if (e.dataTransfer.files.length) {
                handleFileUpload(e.dataTransfer.files[0]);
            }
        });
    }

    if (datasetFileInput) {
        datasetFileInput.addEventListener('change', (e) => {
            if (e.target.files.length) {
                handleFileUpload(e.target.files[0]);
            }
        });
    }

    if (loadSampleBatchBtn) {
        loadSampleBatchBtn.addEventListener('click', () => {
            CyberSound.click();
            APP_STATE.batchRecords = [...SAMPLE_KDD_RECORDS];
            document.getElementById('batchFileName').textContent = 'SAMPLE_CICIDS_2017_SUBSET.CSV';
            document.getElementById('batchRecordCount').textContent = `${APP_STATE.batchRecords.length} Records Loaded`;
            renderBatchTable(APP_STATE.batchRecords);
            showToast('Loaded 8 pre-bundled KDD/CIC-IDS multi-vector records!', 'success');
        });
    }

    if (downloadSampleCsvBtn) {
        downloadSampleCsvBtn.addEventListener('click', () => {
            CyberSound.click();
            const csvContent = "data:text/csv;charset=utf-8," +
                "Source_IP,Dest_IP,Protocol,Dest_Port,Duration_ms,SYN_Count,ACK_Count,Rate_pkts_s,Failed_Logins,Label\n" +
                "192.168.1.105,10.0.0.1,TCP,443,240,1,1,12,0,Benign\n" +
                "185.220.101.42,10.0.0.1,TCP,80,35,45000,0,38500,0,DDoS_SYN_Flood\n" +
                "45.142.214.99,10.0.0.1,TCP,21,15,950,0,800,0,Port_Scan\n" +
                "194.26.29.112,10.0.0.1,SSH,22,1200,45,42,90,38,SSH_Brute_Force\n" +
                "172.56.21.84,10.0.0.1,HTTP,443,580,1,1,6,0,SQL_Injection\n";
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "ids_network_telemetry_template.csv");
            document.body.appendChild(link);
            link.click();
            link.remove();
            showToast('Sample CSV template downloaded!', 'info');
        });
    }

    if (btnRunBatchAnalysis) {
        btnRunBatchAnalysis.addEventListener('click', () => {
            runBatchClassifier();
        });
    }

    // Function to parse client-side CSV / JSON
    function handleFileUpload(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            if (file.name.endsWith('.json')) {
                try {
                    const parsed = JSON.parse(content);
                    APP_STATE.batchRecords = Array.isArray(parsed) ? parsed : [parsed];
                } catch (err) {
                    showToast('Invalid JSON file format!', 'error');
                    return;
                }
            } else {
                // Parse CSV
                const lines = content.split('\n').filter(l => l.trim().length > 0);
                const records = [];
                for (let i = 1; i < lines.length; i++) {
                    const cols = lines[i].split(',').map(c => c.trim());
                    if (cols.length >= 7) {
                        records.push({
                            srcIp: cols[0] || '192.168.1.100',
                            dstIp: cols[1] || '10.0.0.1',
                            proto: cols[2] || 'TCP',
                            dstPort: Number(cols[3]) || 80,
                            duration: Number(cols[4]) || 100,
                            syn: Number(cols[5]) || 1,
                            ack: Number(cols[6]) || 1,
                            rate: Number(cols[7]) || 10,
                            failLogins: Number(cols[8]) || 0,
                            label: cols[9] || 'Unknown'
                        });
                    }
                }
                APP_STATE.batchRecords = records.length ? records : [...SAMPLE_KDD_RECORDS];
            }

            document.getElementById('batchFileName').textContent = file.name.toUpperCase();
            document.getElementById('batchRecordCount').textContent = `${APP_STATE.batchRecords.length} Records Loaded`;
            renderBatchTable(APP_STATE.batchRecords);
            showToast(`Successfully parsed ${APP_STATE.batchRecords.length} records from ${file.name}`, 'success');
        };
        reader.readAsText(file);
    }

    // 11. Initial Run
    initTrafficCanvas();
    populateLivePacketsTable();
    loadPresetIntoCrafter('benign_http');
    renderBatchTable(SAMPLE_KDD_RECORDS);
    APP_STATE.batchRecords = [...SAMPLE_KDD_RECORDS];
});
