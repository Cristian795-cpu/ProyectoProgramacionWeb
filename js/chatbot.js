// establecer el modelo de gemini
// tiene 20 peticiones al dia
const MODEL_NAME = "gemini-2.5-flash"; 

// Estado
let selectedImageBase64 = null;
let selectedImageMimeType = null;
// Cargar Historial
let chatHistory = JSON.parse(localStorage.getItem('vestia_chat_history')) || [];

// Funciones de imagen
function triggerFileUpload() {
    const fileInput = document.getElementById('iaChatFileInput');
    if (fileInput) fileInput.click();
}

// Manejar la carga de imagen
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        Swal.fire('Error', 'Por favor sube solo imagenes', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onloadend = function() {
        const fullBase64 = reader.result;
        selectedImageBase64 = fullBase64.split(',')[1];
        selectedImageMimeType = file.type;

        const previewContainer = document.getElementById('imagePreviewContainer');
        const previewImg = document.getElementById('imagePreview');
        const fileName = document.getElementById('imageFileName');
        
        if (previewImg) previewImg.src = fullBase64;
        if (fileName) fileName.textContent = file.name;
        if (previewContainer) previewContainer.style.display = 'block';
    };
    reader.readAsDataURL(file);
}
// remover la imagen a enviar
function removeUploadedImage() {
    selectedImageBase64 = null;
    selectedImageMimeType = null;
    const fileInput = document.getElementById('iaChatFileInput');
    if (fileInput) fileInput.value = '';
    const previewContainer = document.getElementById('imagePreviewContainer');
    if (previewContainer) previewContainer.style.display = 'none';
}

// Gestionar el historial de mensajes
function saveToHistory(role, text) {
    chatHistory.push({ role: role, parts: [{ text: text }] });
    localStorage.setItem('vestia_chat_history', JSON.stringify(chatHistory));
}

// para formatear negritas y saltos de linea
function formatResponse(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');
}

function renderChatHistory() {
    const chatBody = document.getElementById('iaChatBody');

    // Para que muestre los mensajes de bienvenida del html si no hay historial
    if (chatHistory.length === 0) {
        return;
    }

    chatBody.innerHTML = ''; // Limpiar contenedor

    // recorrer el historial de mensages
    chatHistory.forEach(msg => {
        const isUser = msg.role === 'user';
        const formattedText = isUser ? msg.parts[0].text : formatResponse(msg.parts[0].text);
        
        const html = `
        <div class="chat-message ${isUser ? 'user-message text-end' : 'ai-message'} mb-3">
            <div class="message-bubble ${isUser ? 'user-bubble bg-user text-white' : 'ai-bubble bg-light'} d-inline-block p-2 rounded" style="${isUser ? '' : 'max-width: 85%'}">
                ${isUser ? `<strong>Tú:</strong> ${formattedText}` : `<strong>VestIA:</strong> ${formattedText}`}
            </div>
        </div>`;
        chatBody.innerHTML += html;
    });
    chatBody.scrollTop = chatBody.scrollHeight;
}

// Logica de envio de mensaje
async function sendIAChatMessage() {
    const input = document.getElementById('iaChatInput');
    const message = input.value.trim();
    const chatBody = document.getElementById('iaChatBody');

    if (!message && !selectedImageBase64) return;

    // Guardar y mostrar mensaje del usuario
    if (message) saveToHistory('user', message);

    const userHtml = `
        <div class="chat-message user-message mb-3 text-end">
            <div class="message-bubble user-bubble bg-user text-white d-inline-block p-2 rounded">
                ${message ? `<strong>Tú:</strong> ${message}` : ''}
                ${selectedImageBase64 ? '<br><small><em>[Imagen adjunta]</em></small>' : ''}
            </div>
        </div>`;
    chatBody.innerHTML += userHtml;
    
    const tempImage = selectedImageBase64;
    const tempMime = selectedImageMimeType;
    input.value = '';
    removeUploadedImage();
    chatBody.scrollTop = chatBody.scrollHeight;

    // cfargando
    const loadingId = 'loading-' + Date.now();
    chatBody.innerHTML += `
        <div class="chat-message ai-message mb-3" id="${loadingId}">
            <div class="message-bubble ai-bubble bg-light d-inline-block p-2 rounded text-secondary">
                <i class="fas fa-circle-notch fa-spin"></i> Consultando a VestIA...
            </div>
        </div>`;

    try {
        // Contexto del inventario solo con precio visible en texto
        const products = window.allProducts || [];
        const inventoryContext = products.length > 0 
            ? products.map(p => `- ${p.title} (${p.category}): $${p.price}`).join('\n')
            : "Inventario no disponible.";
        // Instrucciones para que no se salga de contexto
        const systemInstructionText = `
        Eres VestIA, asistente de moda.
        INVENTARIO DE LA TIENDA:
        ${inventoryContext}
        
        REGLAS:
        1. Responde dudas de moda.
        2. Recomienda productos de la lista (menciona su nombre y precio).
        3. Se amable y breve.
        `;

        // Preparar Historial para API
        // Excluimos el actual porque lo enviamos en 'contents'
        const historyForApi = chatHistory.slice(0, -1).map(msg => ({
            role: msg.role,
            parts: [{ text: msg.parts[0].text }]
        }));

        // Preparar contenido
        const contentsParts = [];
        if (message) contentsParts.push({ text: message });
        if (tempImage) {
            contentsParts.push({ inline_data: { mime_type: tempMime, data: tempImage } });
            if (!message) contentsParts.push({ text: "Analiza esta imagen." });
        }

        // Si no hay api key, error
        if (!window.CONFIG || !window.CONFIG.GEMINI_API_KEY) throw new Error("Falta API KEY");
        const API_KEY = window.CONFIG.GEMINI_API_KEY.trim();

        // Llamada API
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: { parts: { text: systemInstructionText } },
                contents: [...historyForApi, { role: "user", parts: contentsParts }], // destructuracion de historial + mensaje actual
                safetySettings: [ // configuracion de seguridad por si no responde a algunas preguntas
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
                ]
            })
        });

        // Manejo de errores
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Error ${response.status}: ${errorData.error?.message || 'Error desconocido'}`);
        }

        const data = await response.json();
        document.getElementById(loadingId).remove();

        // Mostrar respuesta del modelo
        if (data.candidates && data.candidates[0].content) {
            const aiText = data.candidates[0].content.parts[0].text;
            
            // Guardar respuesta en historial
            saveToHistory('model', aiText);

            // Formatear solo texto negritas y br
            const formattedText = formatResponse(aiText);

            chatBody.innerHTML += `
                <div class="chat-message ai-message mb-3">
                    <div class="message-bubble ai-bubble bg-light d-inline-block p-2 rounded" style="max-width: 85%">
                        <strong>VestIA:</strong> ${formattedText}
                    </div>
                </div>`;
        }

    } catch (error) {
        // Quitar el loading
        document.getElementById(loadingId)?.remove();

        if(message) { 
            chatHistory.pop(); 
            localStorage.setItem('vestia_chat_history', JSON.stringify(chatHistory)); 
        }
        
        console.error(error);
        chatBody.innerHTML += `
            <div class="chat-message ai-message mb-3">
                <div class="message-bubble ai-bubble bg-danger text-white d-inline-block p-2 rounded">
                    Error: ${error.message}
                </div>
            </div>`;
    }
    chatBody.scrollTop = chatBody.scrollHeight;
}

// Cargar el historial al iniciar
document.addEventListener('DOMContentLoaded', renderChatHistory);