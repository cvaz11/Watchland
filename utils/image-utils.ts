import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

export async function compressImage(uri: string, quality: number = 0.7): Promise<string> {
  try {
    if (Platform.OS === 'web') {
      return await convertUriToBase64Web(uri, quality);
    }

    // For mobile, use expo-file-system to read and convert
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    return base64;
  } catch (error) {
    console.error('Erro ao comprimir imagem:', error);
    // Fallback to simple conversion
    return await convertUriToBase64(uri);
  }
}

async function convertUriToBase64Web(uri: string, quality: number): Promise<string> {
  if (Platform.OS !== 'web') {
    throw new Error('Web-only function called on mobile');
  }

  return new Promise((resolve, reject) => {
    const img = new (window as any).Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas size
      const maxSize = 1024;
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      const base64 = compressedDataUrl.split(',')[1];
      resolve(base64);
    };
    
    img.onerror = reject;
    img.src = uri;
  });
}

export function convertUriToBase64(uri: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      if (Platform.OS === 'web') {
        // For web, handle CORS and conversion
        const response = await fetch(uri);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      } else {
        // For mobile, use expo-file-system
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        resolve(base64);
      }
    } catch (error) {
      reject(error);
    }
  });
}

export function validateImageSize(uri: string): Promise<{ width: number; height: number; isValid: boolean }> {
  return new Promise((resolve) => {
    if (Platform.OS !== 'web') {
      // For mobile, we can't easily get image dimensions without additional libraries
      // Return a default valid response
      resolve({ width: 800, height: 600, isValid: true });
      return;
    }

    const img = new (window as any).Image();
    img.onload = () => {
      const isValid = img.width >= 300 && img.height >= 300; // Minimum size for good analysis
      resolve({
        width: img.width,
        height: img.height,
        isValid,
      });
    };
    img.onerror = () => {
      resolve({ width: 0, height: 0, isValid: false });
    };
    img.src = uri;
  });
}

export function calculateImageQuality(uri: string): Promise<{
  score: number; // 0-100
  issues: string[];
  recommendations: string[];
}> {
  return new Promise((resolve) => {
    if (Platform.OS !== 'web') {
      // For mobile, return a default good quality score
      resolve({ 
        score: 85, 
        issues: [], 
        recommendations: ['Certifique-se de que o relógio está bem iluminado'] 
      });
      return;
    }

    const img = new (window as any).Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData?.data;
      
      if (!data) {
        resolve({ score: 50, issues: [], recommendations: [] });
        return;
      }
      
      let score = 100;
      const issues: string[] = [];
      const recommendations: string[] = [];
      
      // Check image size
      if (img.width < 500 || img.height < 500) {
        score -= 20;
        issues.push('Resolução baixa');
        recommendations.push('Use uma imagem com pelo menos 500x500 pixels');
      }
      
      // Check brightness (simplified)
      let totalBrightness = 0;
      for (let i = 0; i < data.length; i += 4) {
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
        totalBrightness += brightness;
      }
      const avgBrightness = totalBrightness / (data.length / 4);
      
      if (avgBrightness < 50) {
        score -= 15;
        issues.push('Imagem muito escura');
        recommendations.push('Melhore a iluminação');
      } else if (avgBrightness > 200) {
        score -= 10;
        issues.push('Imagem muito clara');
        recommendations.push('Reduza a exposição');
      }
      
      resolve({ score: Math.max(0, score), issues, recommendations });
    };
    
    img.onerror = () => {
      resolve({ 
        score: 0, 
        issues: ['Erro ao carregar imagem'], 
        recommendations: ['Tente uma imagem diferente'] 
      });
    };
    
    img.src = uri;
  });
}