/* js/chatbot.js */

// --- CONFIGURACIÓN ---
const MODEL_NAME = "gemini-2.5-flash"; 

// --- VARIABLES DE ESTADO ---
let selectedImageBase64 = null;
let selectedImageMimeType = null;

// --- FUNCIONES DE IMAGEN ---
function triggerFileUpload() {
    const fileInput = document.getElementById('iaChatFileInput');
    if (fileInput) fileInput.click();
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        Swal.fire('Error', 'Por favor sube solo imágenes', 'error');
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

function removeUploadedImage() {
    selectedImageBase64 = null;
    selectedImageMimeType = null;
    const fileInput = document.getElementById('iaChatFileInput');
    if (fileInput) fileInput.value = '';
    const previewContainer = document.getElementById('imagePreviewContainer');
    if (previewContainer) previewContainer.style.display = 'none';
}

// --- LOGICA DEL CHAT ---
async function sendIAChatMessage() {
    const input = document.getElementById('iaChatInput');
    const message = input.value.trim();
    const chatBody = document.getElementById('iaChatBody');

    if (!message && !selectedImageBase64) return;

    // Mostrar mensaje del usuario
    let userHtml = `
        <div class="chat-message user-message mb-3 text-end">
            <div class="message-bubble user-bubble bg-primary text-white d-inline-block p-2 rounded">
                ${message ? `<strong>Tú:</strong> ${message}` : ''}
                ${selectedImageBase64 ? '<br><small><em>[Imagen adjunta]</em></small>' : ''}
            </div>
        </div>`;
    chatBody.innerHTML += userHtml;
    
    input.value = '';
    const tempImage = selectedImageBase64;
    const tempMime = selectedImageMimeType;
    removeUploadedImage();

    chatBody.scrollTop = chatBody.scrollHeight;

    // Indicador de carga
    const loadingId = 'loading-' + Date.now();
    chatBody.innerHTML += `
        <div class="chat-message ai-message mb-3" id="${loadingId}">
            <div class="message-bubble ai-bubble bg-light d-inline-block p-2 rounded text-secondary">
                <i class="fas fa-circle-notch fa-spin"></i> Consultando a VestIA...
            </div>
        </div>`;

    try {
        // Preparar Contexto del Inventario
        const products = window.allProducts || [];
        const inventoryContext = products.length > 0 
            ? products.map(p => `- ${p.title} (${p.category}): $${p.price}`).join('\n')
            : "Inventario no disponible.";

        const systemInstructionText = `
        Eres VestIA, asistente de moda experto.
        INVENTARIO DE LA TIENDA:
        ${inventoryContext}
        
        REGLAS:
        1. Responde dudas de moda y estilo.
        2. Recomienda productos de la lista de arriba.
        3. Se amable y breve.
        `;

        // Preparar Payload
        const contentsParts = [];
        if (message) contentsParts.push({ text: message });
        
        if (tempImage) {
            contentsParts.push({
                inline_data: { mime_type: tempMime, data: tempImage }
            });
            if (!message) contentsParts.push({ text: "Analiza esta imagen y dame recomendaciones." });
        }

        if (!window.CONFIG || !window.CONFIG.GEMINI_API_KEY) {
            throw new Error("Falta API KEY en config.js");
        }
        const API_KEY = window.CONFIG.GEMINI_API_KEY.trim();

        // Llamada a la API
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: { parts: { text: systemInstructionText } },
                contents: [{ parts: contentsParts }],
                safetySettings: [
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("Error API:", errorData);
            throw new Error(`Error ${response.status}: ${errorData.error?.message || 'Error desconocido'}`);
        }

        const data = await response.json();
        document.getElementById(loadingId).remove();

        if (data.candidates && data.candidates[0].content) {
            const aiText = data.candidates[0].content.parts[0].text;
            const formattedText = aiText
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // REGEX (Expresion regular) para negritas
                .replace(/\n/g, '<br>');

            chatBody.innerHTML += `
                <div class="chat-message ai-message mb-3">
                    <div class="message-bubble ai-bubble bg-light d-inline-block p-2 rounded">
                        <strong>VestIA:</strong> ${formattedText}
                    </div>
                </div>`;
        } else {
            throw new Error("La IA no generó respuesta.");
        }

    } catch (error) {
        const loadingEl = document.getElementById(loadingId);
        if (loadingEl) loadingEl.remove();
        
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
