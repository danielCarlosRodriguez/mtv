# Proceso de Transformación de Archivos JSON

## 📋 Lista de Operaciones

### 1. **Creación de Backup**
### 2. **Lectura del Archivo**
### 3. **Extracción del Año**
### 4. **Transformación de Estructura**
### 5. **Conversión de Formato de Fecha**
### 6. **Normalización de Campos de Visitas**
### 7. **Ordenamiento por Visitas**
### 8. **Preservación de Datos**
### 9. **Escritura del Archivo Transformado**
### 10. **Resumen y Estadísticas**


---

## 📝 Ejemplo de Transformación

### **Formato Original:**
```json
{
  "01/06/1991": [
    {
      "url": "https://120minutes.org/video/010691/happy+mondays+step+on",
      "name": "Happy Mondays | \"Step On\"",
      "youtubeUrl": "https://www.youtube.com/watch?v=mFBQ0PH5rM4",
      "youtubeId": "mFBQ0PH5rM4",
      "Cantidad de visitas": "8144227"
    }
  ],
  "01/23/1991": [
    {
      "url": "https://120minutes.org/video/012391/happy+mondays+kinky+afro",
      "name": "Happy Mondays | Kinky Afro",
      "youtubeUrl": "https://www.youtube.com/watch?v=O8maBsuhHr4",
      "youtubeId": "O8maBsuhHr4",
      "Cantidad de visitas": "8522999"
    }
  ]
}
```

### **Formato Transformado:**
```json
{
  "1991": [
    {
      "url": "https://120minutes.org/video/012391/happy+mondays+kinky+afro",
      "name": "Happy Mondays | Kinky Afro",
      "youtubeUrl": "https://www.youtube.com/watch?v=O8maBsuhHr4",
      "youtubeId": "O8maBsuhHr4",
      "visitas": "8522999",
      "fecha": "23/01/1991"
    },
    {
      "url": "https://120minutes.org/video/010691/happy+mondays+step+on",
      "name": "Happy Mondays | \"Step On\"",
      "youtubeUrl": "https://www.youtube.com/watch?v=mFBQ0PH5rM4",
      "youtubeId": "mFBQ0PH5rM4",
      "visitas": "8144227",
      "fecha": "06/01/1991"
    }
  ]
}
```

---

## 🔄 Cambios Principales

1. **Estructura de claves:** De múltiples fechas → una sola clave de año
2. **Campo fecha:** Agregado a cada video en formato DD/MM/AAAA
3. **Normalización:** `"Cantidad de visitas"` → `"visitas"`
4. **Orden:** Videos ordenados por visitas (mayor a menor)
5. **Formato de fecha:** MM/DD/AAAA → DD/MM/AAAA

---

## ⚠️ Notas Importantes

- El proceso **NO** elimina datos, solo reorganiza y normaliza
- Se crea un backup antes de cada transformación
- Los videos sin visitas (`null`) se ordenan al final
- El ordenamiento es numérico (no alfabético)
- Mantiene todos los campos originales del video
