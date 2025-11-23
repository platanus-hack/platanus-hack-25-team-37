import { TelegramMessage, AppointmentData } from './types';

export async function sendTelegramMessage(
  telegramApiUrl: string,
  chatId: string,
  appointmentData: AppointmentData
): Promise<boolean> {
  try {
    const message: TelegramMessage = {
      chatId,
      appointmentData,
    };

    console.log(`Sending message to ${chatId}:`, JSON.stringify(message));

    const response = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const responseText = await response.text();
    console.log(`Telegram API response status: ${response.status}, body:`, responseText);

    // Primero intentar parsear el JSON
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      console.error(`Failed to parse Telegram API response as JSON for ${chatId}:`, e);
      return false;
    }

    // Verificar success en la respuesta
    if (responseData.success === true) {
      console.log(`Successfully sent notification to ${chatId}`);
      return true;
    } else {
      console.error(`Telegram API returned success=false for ${chatId}:`, responseData);
      return false;
    }
  } catch (error) {
    console.error(`Error sending Telegram message to ${chatId}:`, error);
    return false;
  }
}

export function formatAppointmentData(
  fullName: string,
  sessionDate: string,
  centerAddress: string
): AppointmentData {
  const date = new Date(sessionDate);

  // Formatear fecha como DD/MM/YYYY
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  // Formatear hora como HH:MM (24 horas)
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return {
    nombre: fullName || 'Sin nombre',
    fecha: `${day}/${month}/${year}`,
    hora: `${hours}:${minutes}`,
    lugar: centerAddress || 'Centro de Mediación',
  };
}
