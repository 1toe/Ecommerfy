import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase';

// Definición de tipos para registro
interface RegistroValorAleatorio {
  tipo: string;
  valor: number;
  unidad: string;
  descripcion?: string;
  timestamp: any;
}

/**
 * Genera un precio aleatorio en pesos chilenos entre un mínimo y máximo
 * @param min - Valor mínimo en CLP
 * @param max - Valor máximo en CLP
 * @param redondear - Si es true, redondea a valores típicos de precios (ej: 990, 1.990)
 * @returns Precio en pesos chilenos
 */
export const generarPrecioAleatorio = (min = 1000, max = 100000, redondear = true): number => {
  let precio = Math.random() * (max - min) + min;
  
  if (redondear) {
    // Redondear a valores típicos de marketing (terminados en 90, 990, etc.)
    if (precio < 10000) {
      precio = Math.floor(precio / 100) * 100 + 90;
    } else {
      precio = Math.floor(precio / 1000) * 1000 + 990;
    }
  }
  
  return Math.round(precio);
};

/**
 * Genera un porcentaje de descuento aleatorio
 * @param minPorcentaje - Porcentaje mínimo
 * @param maxPorcentaje - Porcentaje máximo
 * @returns Porcentaje de descuento (5, 10, 15, 20, 25, etc.)
 */
export const generarDescuentoAleatorio = (minPorcentaje = 5, maxPorcentaje = 40): number => {
  // Generar descuentos en múltiplos de 5
  const opciones = [];
  for (let i = minPorcentaje; i <= maxPorcentaje; i += 5) {
    opciones.push(i);
  }
  
  const indice = Math.floor(Math.random() * opciones.length);
  return opciones[indice];
};

/**
 * Genera una cantidad de stock aleatorio para un producto
 * @param min - Cantidad mínima
 * @param max - Cantidad máxima
 * @returns Número entero de stock
 */
export const generarStockAleatorio = (min = 0, max = 100): number => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

/**
 * Registra un valor aleatorio en Firestore para análisis posterior
 * @param tipo - Tipo de valor (precio, descuento, stock, etc.)
 * @param valor - Valor numérico
 * @param unidad - Unidad de medida (CLP, %, unidades, etc.)
 * @param descripcion - Descripción opcional del registro
 * @returns Promise con el resultado de la operación
 */
export const registrarValorAleatorio = async (
  tipo: string,
  valor: number,
  unidad: string,
  descripcion?: string
): Promise<{ success: boolean; id?: string; error?: string }> => {
  try {
    const db = getFirebaseDb();
    const datosRegistro: RegistroValorAleatorio = {
      tipo,
      valor,
      unidad,
      descripcion,
      timestamp: serverTimestamp()
    };
    
    // Guardar en colección "registros_valores"
    const docRef = await addDoc(collection(db, "registros_valores"), datosRegistro);
    
    // Log en consola para desarrollo
    console.log(`Valor aleatorio registrado: ${tipo} = ${valor} ${unidad}`, docRef.id);
    
    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error("Error al registrar valor aleatorio:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Genera un valor aleatorio y lo registra en un solo paso
 * @param tipo - Tipo de valor a generar (precio, descuento, stock)
 * @param options - Opciones específicas para la generación
 * @returns El valor generado y registrado
 */
export const generarYRegistrarValor = async (
  tipo: 'precio' | 'descuento' | 'stock',
  options?: {
    min?: number;
    max?: number;
    redondear?: boolean;
    descripcion?: string;
  }
): Promise<{ valor: number; success: boolean; id?: string; error?: string }> => {
  let valor: number;
  let unidad: string;
  
  switch (tipo) {
    case 'precio':
      valor = generarPrecioAleatorio(
        options?.min, 
        options?.max, 
        options?.redondear !== undefined ? options.redondear : true
      );
      unidad = 'CLP';
      break;
    case 'descuento':
      valor = generarDescuentoAleatorio(options?.min, options?.max);
      unidad = '%';
      break;
    case 'stock':
      valor = generarStockAleatorio(options?.min, options?.max);
      unidad = 'unidades';
      break;
    default:
      throw new Error('Tipo de valor aleatorio no soportado');
  }
  
  const resultado = await registrarValorAleatorio(
    tipo, 
    valor, 
    unidad, 
    options?.descripcion
  );
  
  return {
    valor,
    ...resultado
  };
};
