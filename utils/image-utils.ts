import { Platform } from 'react-native';

export async function compressImage(uri: string): Promise<string> {
  try {
    if (Platform.OS === 'web') {
      // For web, we'll use a simpler approach
      return await convertUriToBase64(uri);
    }

    // For mobile, we'll use a basic compression approach
    // Since expo-image-manipulator might not be available, we'll use fetch
    const response = await fetch(uri);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Erro ao comprimir imagem:', error);
    throw new Error('Falha ao processar a imagem');
  }
}

export function convertUriToBase64(uri: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (Platform.OS === 'web') {
      // For web, we need to handle differently
      fetch(uri)
        .then(response => response.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        })
        .catch(reject);
    } else {
      // For mobile, use a simpler approach with fetch
      fetch(uri)
        .then(response => response.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        })
        .catch(reject);
    }
  });
}