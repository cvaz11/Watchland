import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

export async function compressImage(uri: string): Promise<string> {
  try {
    const result = await ImagePicker.manipulateAsync(
      uri,
      [{ resize: { width: 800 } }], // Resize to max 800px width
      {
        compress: 0.7,
        format: ImagePicker.SaveFormat.JPEG,
        base64: true,
      }
    );
    
    return result.base64 || '';
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
      // For mobile, use ImagePicker
      ImagePicker.manipulateAsync(
        uri,
        [],
        { base64: true, format: ImagePicker.SaveFormat.JPEG }
      )
        .then(result => resolve(result.base64 || ''))
        .catch(reject);
    }
  });
}