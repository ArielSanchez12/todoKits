const API_URL = "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0"
const API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY

async function generateAvatar(prompt) {
    const response = await fetch(API_URL, {
        headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ "inputs": prompt }),
    })
    return await response.blob()
}

// Un blob (Binary Large OBject) es una forma de guardar archivos, 
// como imágenes o videos, en la memoria del navegador.


const convertBlobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
        // se usa un lector de archivos
        const reader = new FileReader()
        // cuando termine, se devuelve el resultado (base64)
        reader.onloadend = () => resolve(reader.result)
        // si hay error, se rechaza
        reader.onerror = reject
        // se convierte el blob a base64
        reader.readAsDataURL(blob)
    })
}

// Es una forma de representar imágenes como texto, para 
// que se puedan ponerlas directamente en el HTML sin subirlas a un servidor.
// https://www.base64-image.de/

/**
 * Crea un blob de imagen recortada desde un canvas
 * @param {string} imageSrc - URL de la imagen original (base64 o URL)
 * @param {Object} pixelCrop - Área de recorte en píxeles {x, y, width, height}
 * @returns {Promise<Blob>} Blob de la imagen recortada (lista para subir)
 */
const createCroppedImage = (imageSrc, pixelCrop) => {
    return new Promise((resolve, reject) => {
        const image = new Image()
        image.src = imageSrc
        image.onload = () => {
            // Crear un canvas temporal
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')

            // Ajustar el tamaño del canvas al área recortada
            canvas.width = pixelCrop.width
            canvas.height = pixelCrop.height

            // Dibujar solo la parte recortada de la imagen
            ctx.drawImage(
                image,
                pixelCrop.x,        // desde dónde empezar a cortar (X)
                pixelCrop.y,        // desde dónde empezar a cortar (Y)
                pixelCrop.width,    // ancho del corte
                pixelCrop.height,   // alto del corte
                0,                  // posición X en el canvas
                0,                  // posición Y en el canvas
                pixelCrop.width,    // ancho en el canvas
                pixelCrop.height    // alto en el canvas
            )

            // Convertir el canvas a blob (imagen lista para subir)
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error('No se pudo crear la imagen recortada'))
                    return
                }
                resolve(blob)
            }, 'image/jpeg', 0.95) // JPEG con 95% de calidad
        }
        image.onerror = reject
    })
}


export {
    generateAvatar,
    convertBlobToBase64,
    createCroppedImage
}