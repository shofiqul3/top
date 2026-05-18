
        // DOM elements
        const usernameScreen = document.getElementById('usernameScreen');
        const connectionScreen = document.getElementById('connectionScreen');
        const chatInterface = document.getElementById('chatInterface');
        const myIdShort = document.getElementById('myIdShort');
        const myIdFull = document.getElementById('myIdFull');
        const peerInput = document.getElementById('peerInput');
        const connectBtn = document.getElementById('connectBtn');
        const copyBtn = document.getElementById('copyBtn');
        const backBtn = document.getElementById('backBtn');
        const peerName = document.getElementById('peerName');
        const peerStatus = document.getElementById('peerStatus');
        const msgInput = document.getElementById('msgInput');
        const sendBtn = document.getElementById('sendBtn');
        const chatArea = document.getElementById('chatArea');
        const emptyChat = document.getElementById('emptyChat');
        const smartBtn = document.getElementById('smartBtn');
        const fileInput = document.getElementById('fileInput');
        const audioCallBtn = document.getElementById('audioCallBtn');
        const videoCallBtn = document.getElementById('videoCallBtn');
        const micPermissionBtn = document.getElementById('micPermissionBtn');
        const callModal = document.getElementById('callModal');
        const videoCallModal = document.getElementById('videoCallModal');
        const callStatus = document.getElementById('callStatus');
        const videoCallStatus = document.getElementById('videoCallStatus');
        const endCallBtn = document.getElementById('endCallBtn');
        const endVideoCallBtn = document.getElementById('endVideoCallBtn');
        const toggleMicBtn = document.getElementById('toggleMicBtn');
        const toggleCameraBtn = document.getElementById('toggleCameraBtn');
        const toggleMicCallBtn = document.getElementById('toggleMicCallBtn');
        const localVideo = document.getElementById('localVideo');
        const remoteVideo = document.getElementById('remoteVideo');
        const recordingTimer = document.getElementById('recordingTimer');
        const yourIdBox = document.getElementById('yourIdBox');
        const uploadProgress = document.getElementById('uploadProgress');
        const uploadFileName = document.getElementById('uploadFileName');
        const uploadProgressFill = document.getElementById('uploadProgressFill');
        const bandwidthDot = document.getElementById('bandwidthDot');
        const bandwidthText = document.getElementById('bandwidthText');
        const qualityBadge = document.getElementById('qualityBadge');
        const modeIndicator = document.getElementById('modeIndicator');
        const callPeerName = document.getElementById('callPeerName');
        const callTimer = document.getElementById('callTimer');
        const callStatusBadge = document.getElementById('callStatusBadge');
        
        // Username elements
        const usernameInput = document.getElementById('usernameInput');
        const setUsernameBtn = document.getElementById('setUsernameBtn');
        const usernameStatus = document.getElementById('usernameStatus');

        // State
        let peer = null;
        let conn = null;
        let myId = '';
        let friendId = '';
        let localStream = null;
        let currentCall = null;
        let remoteAudio = null;
        let mediaRecorder = null;
        let audioChunks = [];
        let isRecording = false;
        let recordingStartTime = null;
        let recordingTimerInterval = null;
        let hasMediaPermission = false;
        let isMicMuted = false;
        let isCameraOff = false;
        
        // Call timer
        let callTimerInterval = null;
        let callStartTime = null;

        // Smart button state
        let smartMode = 'file'; // 'file' or 'voice'
        let longPressTimer = null;
        let isLongPress = false;
        const LONG_PRESS_DURATION = 400;

        // Video call quality management
        let currentQuality = 'high';
        let bandwidthMonitor = null;
        
        // Chunked file transfer
        const CHUNK_SIZE = 64 * 1024; // 64KB chunks
        const fileTransfers = new Map();

        const qualityPresets = {
            high: {
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    frameRate: { ideal: 30 }
                },
                bitrate: 1500,
                label: 'HD 720p'
            },
            medium: {
                video: {
                    width: { ideal: 854 },
                    height: { ideal: 480 },
                    frameRate: { ideal: 24 }
                },
                bitrate: 800,
                label: 'SD 480p'
            },
            low: {
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 360 },
                    frameRate: { ideal: 15 }
                },
                bitrate: 400,
                label: '360p'
            }
        };

        // Add spin animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);

        // Username setup
        setUsernameBtn.addEventListener('click', async () => {
            const username = usernameInput.value.trim();
            
            if (!username) {
                usernameStatus.textContent = 'Please enter a username';
                return;
            }
            
            if (username.length < 3) {
                usernameStatus.textContent = 'Username must be at least 3 characters';
                return;
            }
            
            if (!/^[a-zA-Z0-9_]+$/.test(username)) {
                usernameStatus.textContent = 'Only letters, numbers and underscore allowed';
                return;
            }
            
            setUsernameBtn.disabled = true;
            usernameStatus.textContent = 'Checking availability...';
            setUsernameBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
                    <path d="M12 2v4M12 22v-4M4.93 4.93l2.83 2.83M19.07 19.07l-2.83-2.83M2 12h4M22 12h-4M4.93 19.07l2.83-2.83M19.07 4.93l-2.83 2.83"/>
                </svg>
                Checking...
            `;
            
            try {
                if (peer) {
                    peer.destroy();
                }
                
                peer = new Peer(username, {
                    config: {
                        'iceServers': [
                            { urls: 'stun:stun.l.google.com:19302' },
                            { urls: 'stun:stun1.l.google.com:19302' },
                            { urls: 'stun:stun2.l.google.com:19302' },
                            { urls: 'stun:stun3.l.google.com:19302' },
                            { urls: 'stun:stun4.l.google.com:19302' }
                        ]
                    }
                });
                
                await new Promise((resolve, reject) => {
                    peer.on('open', (id) => {
                        myId = id;
                        resolve();
                    });
                    
                    peer.on('error', (err) => {
                        reject(err);
                    });
                    
                    setTimeout(() => reject(new Error('timeout')), 5000);
                });
                
                usernameStatus.style.color = '#22c55e';
                usernameStatus.textContent = '✓ Username available!';
                
                setUsernameBtn.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 6L9 17l-5-5"/>
                    </svg>
                    Username Set!
                `;
                setUsernameBtn.classList.add('success');
                setUsernameBtn.disabled = true;
                usernameInput.disabled = true;
                
                myIdShort.textContent = myId;
                myIdFull.textContent = myId;
                yourIdBox.classList.remove('hidden');
                
                document.querySelector('.short-id').style.display = 'block';
                document.querySelector('.full-id').style.display = 'none';
                
                connectBtn.disabled = false;
                micPermissionBtn.disabled = false;
                audioCallBtn.disabled = false;
                videoCallBtn.disabled = false;
                smartBtn.disabled = false;
                
                setTimeout(() => {
                    usernameScreen.classList.add('hidden');
                }, 1000);
                
                setupPeerEvents();
                
            } catch (err) {
                usernameStatus.style.color = '#ef4444';
                
                if (err.message === 'timeout') {
                    usernameStatus.textContent = 'Server timeout, try again';
                } else if (err.type === 'unavailable-id') {
                    usernameStatus.textContent = '❌ This username is already taken';
                } else {
                    usernameStatus.textContent = '❌ Error: ' + (err.message || 'Could not set username');
                }
                
                setUsernameBtn.disabled = false;
                setUsernameBtn.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 6L9 17l-5-5"/>
                    </svg>
                    Set Username
                `;
                
                if (peer) {
                    peer.destroy();
                    peer = null;
                }
            }
        });

        // Setup peer events
        function setupPeerEvents() {
            peer.on('error', (err) => {
                console.error('Peer error:', err);
                if (err.type === 'peer-unavailable') {
                    addSystemMessage('❌ User not online');
                } else {
                    addSystemMessage('⚠️ Connection error: ' + err.type);
                }
            });

            peer.on('connection', (connection) => {
                conn = connection;
                friendId = connection.peer;
                handleConnected();

                conn.on('data', handleReceivedData);
                conn.on('close', () => {
                    addSystemMessage('❌ Disconnected');
                    disconnect();
                });
            });

            

            peer.on('call', async (call) => {
    try {
        const isVideoCall = call.metadata && call.metadata.isVideo;
        
        if (isVideoCall) {
            if (!hasMediaPermission || !localStream) {
                try {
                    localStream = await navigator.mediaDevices.getUserMedia({
                        audio: true,
                        video: qualityPresets.low.video
                    });
                    hasMediaPermission = true;
                    micPermissionBtn.classList.add('active');
                    
                    // গুরুত্বপূর্ণ: নতুন stream পেলে localVideo তে দেখান
                    localVideo.srcObject = localStream;
                } catch (err) {
                    addSystemMessage('❌ Cannot answer video call');
                    call.close();
                    return;
                }
            } else {
                // গুরুত্বপূর্ণ: যদি localStream আগে থেকেই থাকে, তাহলেও localVideo তে দেখান
                localVideo.srcObject = localStream;
            }
            
            call.answer(localStream);
            currentCall = call;
            
            videoCallModal.classList.add('active');
            videoCallStatus.textContent = 'Connecting...';
            
            startBandwidthMonitoring();
            
            call.on('stream', (remoteStream) => {
                remoteVideo.srcObject = remoteStream;
                videoCallStatus.textContent = 'In call';
                addSystemMessage('📹 Video call connected');
            });
            
            call.on('close', () => {
                endVideoCall();
                addSystemMessage('📹 Video call ended');
            });
            
            call.on('error', (err) => {
                console.error('Video call error:', err);
                endVideoCall();
                addSystemMessage('⚠️ Video call failed');
            });
        } else {
            if (!hasMediaPermission || !localStream) {
                try {
                    localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    hasMediaPermission = true;
                    micPermissionBtn.classList.add('active');
                } catch (err) {
                    addSystemMessage('❌ Cannot answer call');
                    call.close();
                    return;
                }
            }
            
            call.answer(localStream);
            currentCall = call;
            
            // Show new call UI
            callModal.classList.add('active');
            callPeerName.textContent = call.peer;
            callStatusBadge.textContent = 'Connected';
            callTimer.textContent = '00:00';
            
            // Start timer
            callStartTime = Date.now();
            startCallTimer();
            
            call.on('stream', (remoteStream) => {
                if (!remoteAudio) {
                    remoteAudio = new Audio();
                    remoteAudio.autoplay = true;
                }
                remoteAudio.srcObject = remoteStream;
                remoteAudio.play().catch(e => console.log('Audio play error:', e));
                
                callStatusBadge.textContent = 'Connected';
                addSystemMessage('📞 Call connected');
            });
            
            call.on('close', () => {
                endCall();
                addSystemMessage('📞 Call ended');
            });
            
            call.on('error', (err) => {
                console.error('Call error:', err);
                endCall();
                addSystemMessage('⚠️ Call failed');
            });
        }
    } catch (err) {
        console.error('Call error:', err);
        addSystemMessage('⚠️ Call failed');
        call.close();
    }
});




        }

        // Copy button
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(myIdFull.textContent);
            
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"/>
                </svg>
                Copied!
            `;
            
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
            }, 2000);
        });

        // Media permission button
        micPermissionBtn.addEventListener('click', async () => {
            try {
                addSystemMessage('🎥 Requesting microphone and camera access...');
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    audio: true,
                    video: qualityPresets.medium.video
                });
                
                if (localStream) {
                    localStream.getTracks().forEach(track => track.stop());
                }
                localStream = stream;
                
                hasMediaPermission = true;
                micPermissionBtn.classList.add('active');
                addSystemMessage('✅ Media access granted');
                
                localVideo.srcObject = localStream;
                
            } catch (err) {
                console.error('Media permission error:', err);
                addSystemMessage('❌ Media access denied');
                alert('Please allow microphone and camera access for calls');
            }
        });

        // Connect button
        connectBtn.addEventListener('click', () => {
            const targetId = peerInput.value.trim();
            if (!targetId) {
                alert('Please enter a username');
                return;
            }

            if (targetId === myId) {
                alert('Cannot connect to yourself');
                return;
            }

            try {
                conn = peer.connect(targetId);
                friendId = targetId;

                conn.on('open', () => {
                    handleConnected();
                });

                conn.on('error', (err) => {
                    console.error('Connection error:', err);
                    addSystemMessage('❌ Connection failed');
                });

                conn.on('data', handleReceivedData);
                conn.on('close', () => {
                    addSystemMessage('❌ Disconnected');
                    disconnect();
                });

            } catch (err) {
                addSystemMessage('❌ Connection failed');
            }
        });

        // Handle successful connection
        function handleConnected() {
            connectionScreen.classList.add('hidden');
            chatInterface.classList.add('visible');
            peerName.textContent = friendId;
            peerStatus.textContent = 'Online';
            
            msgInput.disabled = false;
            sendBtn.disabled = false;
            smartBtn.disabled = false;

            addSystemMessage('✅ Connected to ' + friendId);
        }

        // Handle received data
        function handleReceivedData(data) {
            if (typeof data === 'string') {
                addMessage(data, 'received');
            } else if (data.type === 'image') {
                displayImage(data.data, 'received');
            } else if (data.type === 'video') {
                displayVideo(data.data, data.name, data.size, data.duration, 'received');
            } else if (data.type === 'voice') {
                displayVoiceMessage(data.data, data.duration, 'received');
            } else if (data.type === 'video-chunk') {
                handleVideoChunk(data);
            }
        }

        // Handle video chunks - FIXED VERSION
        function handleVideoChunk(data) {
            const fileId = data.fileName;
            
            if (!fileTransfers.has(fileId)) {
                fileTransfers.set(fileId, {
                    chunks: [],
                    totalChunks: data.totalChunks,
                    name: data.fileName,
                    type: data.fileType,
                    size: data.fileSize
                });
            }
            
            const transfer = fileTransfers.get(fileId);
            
            // Convert chunk from base64 if needed
            let chunkData = data.chunk;
            if (typeof data.chunk === 'string' && data.chunk.startsWith('data:')) {
                // It's a data URL, extract the base64 part
                const base64Data = data.chunk.split(',')[1];
                chunkData = atob(base64Data);
                
                // Convert to Uint8Array
                const arrayBuffer = new Uint8Array(chunkData.length);
                for (let i = 0; i < chunkData.length; i++) {
                    arrayBuffer[i] = chunkData.charCodeAt(i);
                }
                chunkData = arrayBuffer.buffer;
            }
            
            transfer.chunks[data.chunkIndex] = chunkData;
            
            if (transfer.chunks.filter(c => c).length === transfer.totalChunks) {
                reassembleFile(fileId);
            }
        }

        function reassembleFile(fileId) {
            const transfer = fileTransfers.get(fileId);
            const sortedChunks = [];
            
            // Sort chunks by index
            for (let i = 0; i < transfer.totalChunks; i++) {
                if (transfer.chunks[i]) {
                    sortedChunks.push(transfer.chunks[i]);
                }
            }
            
            const blob = new Blob(sortedChunks, { type: transfer.type });
            
            const reader = new FileReader();
            reader.onload = () => {
                if (transfer.type.startsWith('video/')) {
                    displayVideo(reader.result, transfer.name, transfer.size, 0, 'received');
                } else {
                    displayVoiceMessage(reader.result, 0, 'received');
                }
            };
            reader.readAsDataURL(blob);
            
            fileTransfers.delete(fileId);
        }

        // Send message
        sendBtn.addEventListener('click', sendMessage);
        msgInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });

        function sendMessage() {
            const text = msgInput.value.trim();
            if (!text || !conn) return;

            conn.send(text);
            addMessage(text, 'sent');
            msgInput.value = '';
        }

        // Add text message
        function addMessage(text, type) {
            emptyChat.style.display = 'none';

            const row = document.createElement('div');
            row.className = `message-row ${type}`;

            const bubble = document.createElement('div');
            bubble.className = 'message-bubble';
            bubble.textContent = text;

            const time = document.createElement('div');
            time.className = 'message-time';
            
            const now = new Date();
            time.textContent = now.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true
            });

            row.appendChild(bubble);
            row.appendChild(time);
            chatArea.appendChild(row);
            chatArea.scrollTop = chatArea.scrollHeight;
        }

        // System message
        function addSystemMessage(text) {
            emptyChat.style.display = 'none';

            const msg = document.createElement('div');
            msg.className = 'system-message';
            msg.textContent = text;
            chatArea.appendChild(msg);
            chatArea.scrollTop = chatArea.scrollHeight;
        }

        // Back button
        backBtn.addEventListener('click', disconnect);

        function disconnect() {
            if (conn) {
                conn.close();
                conn = null;
            }
            if (currentCall) {
                endCall();
            }
            endVideoCall();

            chatInterface.classList.remove('visible');
            connectionScreen.classList.remove('hidden');

            chatArea.innerHTML = '';
            chatArea.appendChild(emptyChat);
            emptyChat.style.display = 'flex';
            
            msgInput.disabled = true;
            sendBtn.disabled = true;
            smartBtn.disabled = true;
            
            peerName.textContent = 'Connecting...';
            friendId = '';
        }

        // Start call timer
        function startCallTimer() {
            if (callTimerInterval) {
                clearInterval(callTimerInterval);
            }
            
            callTimerInterval = setInterval(() => {
                if (callStartTime) {
                    const elapsed = Math.floor((Date.now() - callStartTime) / 1000);
                    const minutes = Math.floor(elapsed / 60);
                    const seconds = elapsed % 60;
                    callTimer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                }
            }, 1000);
        }

        // Audio call handler - with new UI
        audioCallBtn.addEventListener('click', async () => {
            if (!conn) {
                alert('Connect to a friend first');
                return;
            }

            if (!hasMediaPermission || !localStream) {
                alert('Please allow microphone access first');
                return;
            }

            try {
                const audioStream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true,
                        channelCount: 1,
                        sampleRate: 16000
                    }
                });
                
                const call = peer.call(friendId, audioStream);
                currentCall = call;
                
                // Show new call UI
                callModal.classList.add('active');
                callPeerName.textContent = friendId;
                callStatusBadge.textContent = 'Calling...';
                callTimer.textContent = '00:00';
                
                // Start timer when call connects
                callStartTime = null;
                
                call.on('stream', (remoteStream) => {
                    if (!remoteAudio) {
                        remoteAudio = new Audio();
                        remoteAudio.autoplay = true;
                    }
                    remoteAudio.srcObject = remoteStream;
                    remoteAudio.play().catch(e => console.log('Audio play error:', e));
                    
                    callStatusBadge.textContent = 'Connected';
                    callStartTime = Date.now();
                    startCallTimer();
                    addSystemMessage('📞 Call connected');
                });
                
                call.on('close', () => {
                    endCall();
                    addSystemMessage('📞 Call ended');
                });

                call.on('error', (err) => {
                    console.error('Call error:', err);
                    endCall();
                    addSystemMessage('⚠️ Call failed');
                });
                
            } catch (err) {
                console.error('Call error:', err);
                addSystemMessage('⚠️ Call failed');
            }
        });

        // Video call handler
        videoCallBtn.addEventListener('click', async () => {
            if (!conn) {
                alert('Connect to a friend first');
                return;
            }

            if (!hasMediaPermission || !localStream) {
                alert('Please allow camera access first');
                return;
            }

            try {
                const bandwidth = await estimateBandwidth();
                const startQuality = getOptimalQuality(bandwidth);
                currentQuality = startQuality;
                
                qualityBadge.textContent = qualityPresets[startQuality].label;
                
                const call = peer.call(friendId, localStream, {
                    metadata: { 
                        isVideo: true,
                        quality: startQuality
                    }
                });
                currentCall = call;
                
                videoCallModal.classList.add('active');
                videoCallStatus.textContent = 'Connecting...';
                
                localVideo.srcObject = localStream;
                
                startBandwidthMonitoring();
                
                call.on('stream', (remoteStream) => {
                    remoteVideo.srcObject = remoteStream;
                    videoCallStatus.textContent = 'In call';
                    addSystemMessage('📹 Video call connected');
                });
                
                call.on('close', () => {
                    endVideoCall();
                    addSystemMessage('📹 Video call ended');
                });

                call.on('error', (err) => {
                    console.error('Video call error:', err);
                    endVideoCall();
                    addSystemMessage('⚠️ Video call failed');
                });
                
            } catch (err) {
                console.error('Video call error:', err);
                addSystemMessage('⚠️ Video call failed');
            }
        });

        // Bandwidth functions
        async function estimateBandwidth() {
            return new Promise((resolve) => {
                const startTime = Date.now();
                
                fetch('https://httpbin.org/bytes/100000?r=' + Math.random())
                    .then(response => response.blob())
                    .then(blob => {
                        const endTime = Date.now();
                        const duration = (endTime - startTime) / 1000;
                        const speedKbps = (blob.size * 8) / (duration * 1024);
                        resolve(speedKbps);
                    })
                    .catch(() => resolve(800));
            });
        }

        function getOptimalQuality(bandwidthKbps) {
            if (bandwidthKbps < 400) return 'low';
            if (bandwidthKbps < 800) return 'medium';
            return 'high';
        }

        async function upgradeVideoQuality(targetQuality) {
            if (targetQuality === currentQuality || !currentCall) return;
            
            try {
                const newStream = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: qualityPresets[targetQuality].video
                });
                
                const sender = currentCall.peerConnection.getSenders().find(s => 
                    s.track && s.track.kind === 'video'
                );
                
                if (sender) {
                    const newVideoTrack = newStream.getVideoTracks()[0];
                    await sender.replaceTrack(newVideoTrack);
                    
                    const oldVideoTrack = localStream.getVideoTracks()[0];
                    localStream.removeTrack(oldVideoTrack);
                    oldVideoTrack.stop();
                    localStream.addTrack(newVideoTrack);
                    
                    localVideo.srcObject = localStream;
                    currentQuality = targetQuality;
                    qualityBadge.textContent = qualityPresets[targetQuality].label;
                }
            } catch (err) {
                console.error('Quality upgrade failed:', err);
            }
        }

        function startBandwidthMonitoring() {
            if (bandwidthMonitor) clearInterval(bandwidthMonitor);
            
            bandwidthMonitor = setInterval(async () => {
                if (!currentCall || !currentCall.peerConnection) return;
                
                try {
                    const stats = await currentCall.peerConnection.getStats();
                    let bandwidth = 0;
                    let packetLoss = 0;
                    
                    stats.forEach(report => {
                        if (report.type === 'inbound-rtp' && report.kind === 'video') {
                            bandwidth = report.bitrateMean || (report.bytesReceived * 8 / 1024);
                            packetLoss = report.packetsLost || 0;
                        }
                    });
                    
                    updateBandwidthIndicator(bandwidth, packetLoss);
                    
                    if (bandwidth > 0) {
                        if (bandwidth < 400 && currentQuality !== 'low') {
                            await upgradeVideoQuality('low');
                        } else if (bandwidth >= 400 && bandwidth < 800 && currentQuality !== 'medium') {
                            await upgradeVideoQuality('medium');
                        } else if (bandwidth >= 800 && currentQuality !== 'high') {
                            await upgradeVideoQuality('high');
                        }
                    }
                } catch (err) {
                    console.error('Stats error:', err);
                }
            }, 5000);
        }

        function updateBandwidthIndicator(bandwidth, packetLoss) {
            const quality = getOptimalQuality(bandwidth);
            
            bandwidthDot.className = 'bandwidth-dot';
            if (quality === 'low') {
                bandwidthDot.classList.add('poor');
                bandwidthText.textContent = `Poor (${Math.round(bandwidth)} Kbps)`;
            } else if (quality === 'medium') {
                bandwidthDot.classList.add('fair');
                bandwidthText.textContent = `Fair (${Math.round(bandwidth)} Kbps)`;
            } else {
                bandwidthDot.classList.add('good');
                bandwidthText.textContent = `Good (${Math.round(bandwidth)} Kbps)`;
            }
            
            if (packetLoss > 10) {
                bandwidthText.textContent += ` • ${packetLoss}% loss`;
            }
        }

        function endCall() {
            if (callTimerInterval) {
                clearInterval(callTimerInterval);
                callTimerInterval = null;
            }
            
            if (currentCall) {
                currentCall.close();
                currentCall = null;
            }
            if (remoteAudio) {
                remoteAudio.srcObject = null;
                remoteAudio = null;
            }
            callModal.classList.remove('active');
            callTimer.textContent = '00:00';
        }

        function endVideoCall() {
            if (currentCall) {
                currentCall.close();
                currentCall = null;
            }
            remoteVideo.srcObject = null;
            localVideo.srcObject = null;
            videoCallModal.classList.remove('active');
            
            if (bandwidthMonitor) {
                clearInterval(bandwidthMonitor);
                bandwidthMonitor = null;
            }
            
            isMicMuted = false;
            isCameraOff = false;
            toggleMicBtn.classList.remove('muted');
            toggleCameraBtn.classList.remove('camera-off');
            currentQuality = 'high';
        }

        endCallBtn.addEventListener('click', endCall);
        endVideoCallBtn.addEventListener('click', endVideoCall);

        toggleMicBtn.addEventListener('click', () => {
            if (localStream) {
                const audioTrack = localStream.getAudioTracks()[0];
                if (audioTrack) {
                    audioTrack.enabled = !audioTrack.enabled;
                    isMicMuted = !audioTrack.enabled;
                    if (isMicMuted) {
                        toggleMicBtn.classList.add('muted');
                    } else {
                        toggleMicBtn.classList.remove('muted');
                    }
                }
            }
        });

        toggleMicCallBtn.addEventListener('click', () => {
            if (localStream) {
                const audioTrack = localStream.getAudioTracks()[0];
                if (audioTrack) {
                    audioTrack.enabled = !audioTrack.enabled;
                    isMicMuted = !audioTrack.enabled;
                    if (isMicMuted) {
                        toggleMicCallBtn.classList.add('muted');
                    } else {
                        toggleMicCallBtn.classList.remove('muted');
                    }
                }
            }
        });

        toggleCameraBtn.addEventListener('click', () => {
            if (localStream) {
                const videoTrack = localStream.getVideoTracks()[0];
                if (videoTrack) {
                    videoTrack.enabled = !videoTrack.enabled;
                    isCameraOff = !videoTrack.enabled;
                    if (isCameraOff) {
                        toggleCameraBtn.classList.add('camera-off');
                    } else {
                        toggleCameraBtn.classList.remove('camera-off');
                    }
                }
            }
        });

        // ============= SMART BUTTON LOGIC =============

        let touchStartTime = 0;

        smartBtn.addEventListener('pointerdown', (e) => {
            if (!e.isPrimary) return; 
            smartBtn.setPointerCapture(e.pointerId);
            touchStartTime = Date.now();
            startLongPress();
        });

        smartBtn.addEventListener('pointerup', (e) => {
            if (!e.isPrimary) return;
            endLongPress();
            
            if (!isLongPress && (Date.now() - touchStartTime < LONG_PRESS_DURATION)) {
                toggleSmartMode();
            }
        });

        smartBtn.addEventListener('pointercancel', (e) => {
            if (!e.isPrimary) return;
            cancelLongPress();
        });

        function startLongPress() {
            if (!conn) {
                alert('Connect to a friend first');
                return;
            }
            
            isLongPress = false;
            
            longPressTimer = setTimeout(() => {
                isLongPress = true;
                longPressTimer = null;
                
                if (smartMode === 'file') {
                    fileInput.click();
                } else {
                    startVoiceRecording();
                }
            }, LONG_PRESS_DURATION);
        }

        function endLongPress() {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
            
            if (isRecording) {
                stopVoiceRecording();
            }
        }

        function cancelLongPress() {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
            
            if (isRecording) {
                stopVoiceRecording();
            }
        }

        function toggleSmartMode() {
            if (smartMode === 'file') {
                smartMode = 'voice';
                smartBtn.classList.remove('file-mode');
                smartBtn.classList.add('voice-mode');
                smartBtn.innerHTML = `
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                        <line x1="12" y1="19" x2="12" y2="23"/>
                    </svg>
                    <span class="mode-indicator">Voice Mode</span>
                `;
                modeIndicator.textContent = 'Voice Mode';
            } else {
                smartMode = 'file';
                smartBtn.classList.remove('voice-mode');
                smartBtn.classList.add('file-mode');
                smartBtn.innerHTML = `
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                    </svg>
                    <span class="mode-indicator">File Mode</span>
                `;
                modeIndicator.textContent = 'File Mode';
            }
        }

        // Voice recording functions
        async function startVoiceRecording() {
            if (isRecording) return;
            
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true,
                        channelCount: 1
                    }
                });
                
                mediaRecorder = new MediaRecorder(stream);
                audioChunks = [];
                
                recordingStartTime = Date.now();
                recordingTimer.classList.add('active');
                updateRecordingTimer();

                mediaRecorder.ondataavailable = (e) => {
                    audioChunks.push(e.data);
                };

                mediaRecorder.onstop = () => {
                    if (recordingTimerInterval) {
                        clearInterval(recordingTimerInterval);
                        recordingTimerInterval = null;
                    }
                    recordingTimer.classList.remove('active');
                    recordingTimer.textContent = '0:00';

                    const endTime = Date.now();
                    const durationMs = endTime - recordingStartTime;
                    const durationSec = Math.floor(durationMs / 1000);
                    const displayDuration = Math.min(durationSec, 59);
                    
                    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                    const reader = new FileReader();
                    reader.onload = () => {
                        if (conn) {
                            conn.send({
                                type: 'voice',
                                data: reader.result,
                                duration: displayDuration
                            });
                            displayVoiceMessage(reader.result, displayDuration, 'sent');
                        }
                    };
                    reader.readAsDataURL(audioBlob);
                    
                    stream.getTracks().forEach(track => track.stop());
                    
                    smartBtn.classList.remove('recording');
                };

                mediaRecorder.start();
                isRecording = true;
                smartBtn.classList.add('recording');
                
            } catch (err) {
                alert('Microphone access needed for voice messages');
            }
        }

        function stopVoiceRecording() {
            if (mediaRecorder && isRecording) {
                mediaRecorder.stop();
                isRecording = false;
            }
        }

        function updateRecordingTimer() {
            recordingTimerInterval = setInterval(() => {
                if (isRecording) {
                    const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
                    const display = Math.min(elapsed, 59);
                    recordingTimer.textContent = `0:${display.toString().padStart(2, '0')}`;
                    
                    if (elapsed >= 60) {
                        stopVoiceRecording();
                    }
                }
            }, 100);
        }

        // Display voice message
        function displayVoiceMessage(audioData, duration, type) {
            emptyChat.style.display = 'none';

            const row = document.createElement('div');
            row.className = `message-row ${type}`;

            const voiceContainer = document.createElement('div');
            voiceContainer.className = 'voice-message';

            const playBtn = document.createElement('button');
            playBtn.className = 'voice-play-btn';
            playBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
            `;

            const audio = new Audio(audioData);
            let isPlaying = false;

            playBtn.onclick = () => {
                if (isPlaying) {
                    audio.pause();
                    playBtn.innerHTML = `
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="5 3 19 12 5 21 5 3"/>
                        </svg>
                    `;
                } else {
                    audio.play();
                    playBtn.innerHTML = `
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="6" y="4" width="4" height="16"/>
                            <rect x="14" y="4" width="4" height="16"/>
                        </svg>
                    `;
                }
                isPlaying = !isPlaying;
            };

            audio.onended = () => {
                playBtn.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                `;
                isPlaying = false;
            };

            const wave = document.createElement('div');
            wave.className = 'voice-wave';

            const durationSpan = document.createElement('span');
            durationSpan.className = 'voice-duration';
            
            const mins = Math.floor(duration / 60);
            const secs = duration % 60;
            durationSpan.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;

            voiceContainer.appendChild(playBtn);
            voiceContainer.appendChild(wave);
            voiceContainer.appendChild(durationSpan);

            const time = document.createElement('div');
            time.className = 'message-time';
            
            const now = new Date();
            time.textContent = now.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true
            });

            row.appendChild(voiceContainer);
            row.appendChild(time);
            chatArea.appendChild(row);
            chatArea.scrollTop = chatArea.scrollHeight;
        }

        // File input handler - FIXED VIDEO SHARING
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file || !conn) return;

            const fileType = file.type.split('/')[0];
            
            const maxSize = 1 * 1024 * 1024 * 1024;
            if (file.size > maxSize) {
                alert('File size exceeds 1GB limit');
                fileInput.value = '';
                return;
            }

            uploadFileName.textContent = `Uploading: ${file.name}`;
            uploadProgress.classList.add('active');

            if (fileType === 'image') {
                const reader = new FileReader();
                reader.onprogress = (e) => {
                    if (e.lengthComputable) {
                        const percent = (e.loaded / e.total) * 100;
                        uploadProgressFill.style.width = percent + '%';
                    }
                };
                reader.onload = () => {
                    conn.send({
                        type: 'image',
                        data: reader.result
                    });
                    displayImage(reader.result, 'sent');
                    uploadProgress.classList.remove('active');
                };
                reader.readAsDataURL(file);
                
            } else if (fileType === 'video' || fileType === 'audio') {
                const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
                let currentChunk = 0;
                
                const sendNextChunk = () => {
                    const start = currentChunk * CHUNK_SIZE;
                    const end = Math.min(start + CHUNK_SIZE, file.size);
                    const chunk = file.slice(start, end);
                    
                    const reader = new FileReader();
                    reader.onload = () => {
                        // Send chunk
                        conn.send({
                            type: 'video-chunk',
                            chunk: reader.result,
                            chunkIndex: currentChunk,
                            totalChunks: totalChunks,
                            fileName: file.name,
                            fileType: file.type,
                            fileSize: file.size
                        });
                        
                        currentChunk++;
                        const percent = (currentChunk / totalChunks) * 100;
                        uploadProgressFill.style.width = percent + '%';

                        
                        
                        if (currentChunk < totalChunks) {
    setTimeout(sendNextChunk, 50);
} else {
    // আপনার নিজের চ্যাটে ভিডিও দেখানোর জন্য
    const mediaElement = document.createElement('video');
    mediaElement.preload = 'metadata';
    
    mediaElement.onloadedmetadata = () => {
        const duration = Math.round(mediaElement.duration) || 0;
        
        // আপনার নিজের চ্যাটে ভিডিও দেখান
        const fullReader = new FileReader();
        fullReader.onload = (e) => {
            displayVideo(e.target.result, file.name, file.size, duration, 'sent');
        };
        fullReader.readAsDataURL(file);
    };
    
    mediaElement.src = URL.createObjectURL(file);
    uploadProgress.classList.remove('active');
}


                    };
                    reader.readAsDataURL(chunk);
                };
                
                sendNextChunk();
            }
            
            fileInput.value = '';
        });

        function displayImage(imageData, type) {
            emptyChat.style.display = 'none';

            const row = document.createElement('div');
            row.className = `message-row ${type}`;

            const img = document.createElement('img');
            img.src = imageData;
            img.className = 'message-image';
            img.onclick = () => window.open(imageData, '_blank');

            const time = document.createElement('div');
            time.className = 'message-time';
            
            const now = new Date();
            time.textContent = now.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true
            });

            row.appendChild(img);
            row.appendChild(time);
            chatArea.appendChild(row);
            chatArea.scrollTop = chatArea.scrollHeight;
        }

        function displayVideo(videoData, fileName, fileSize, duration, type) {
            emptyChat.style.display = 'none';

            const row = document.createElement('div');
            row.className = `message-row ${type}`;

            const videoContainer = document.createElement('div');
            videoContainer.className = 'video-container';

            const video = document.createElement('video');
            video.src = videoData;
            video.className = 'message-video';
            video.controls = true;
            video.preload = 'metadata';

            const sizeBadge = document.createElement('div');
            sizeBadge.className = 'video-size-badge';
            sizeBadge.textContent = formatFileSize(fileSize);

            if (duration > 0) {
                const durationBadge = document.createElement('div');
                durationBadge.className = 'video-duration';
                const mins = Math.floor(duration / 60);
                const secs = duration % 60;
                durationBadge.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
                videoContainer.appendChild(durationBadge);
            }

            videoContainer.appendChild(video);
            videoContainer.appendChild(sizeBadge);

            const time = document.createElement('div');
            time.className = 'message-time';
            
            const now = new Date();
            time.textContent = now.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true
            });

            const fileNameSpan = document.createElement('div');
            fileNameSpan.className = 'file-info';
            fileNameSpan.textContent = fileName;

            row.appendChild(videoContainer);
            row.appendChild(fileNameSpan);
            row.appendChild(time);
            chatArea.appendChild(row);
            chatArea.scrollTop = chatArea.scrollHeight;
        }

        function formatFileSize(bytes) {
            if (bytes < 1024) return bytes + ' B';
            if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
            if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
            return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
        }

        // Allow Enter key in username input
        usernameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                setUsernameBtn.click();
            }
        });
    