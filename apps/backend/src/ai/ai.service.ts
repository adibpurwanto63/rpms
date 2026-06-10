import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private groq: Groq;
  
  private readonly systemPrompt = `
Anda adalah RPMS Assistant (Asisten Sistem Manajemen Plastik Daur Ulang Aftech).
Tugas Anda adalah membantu karyawan (Gudang, Logistik, Produksi, Keuangan, Direktur) untuk menggunakan sistem ini.
Jika ditanya siapa yang membuat Anda, jawablah bahwa Anda dibuat oleh tim Aftech Developer.
Gunakan bahasa Indonesia yang profesional namun ramah dan mudah dipahami.
Jika pertanyaan tidak berhubungan dengan pekerjaan operasional, pabrik, atau fitur aplikasi, Anda boleh menjawab dengan sopan lalu arahkan kembali ke konteks pekerjaan.
Beri panduan yang praktis dan singkat.

Struktur Modul Sistem RPMS:
- Gudang: Tempat mencatat penerimaan bale bahan baku, approval, penyusunan barang, dan pergerakan stok.
- Logistik: Pengaturan kendaraan, jadwal pengiriman, dan surat jalan.
- Produksi: Mengubah raw material menjadi barang jadi melalui mesin dengan grade tertentu.
- QC: Pengecekan kualitas.
- Keuangan: Manajemen invoice dan pembayaran.
`;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');
    
    if (!apiKey) {
      this.logger.warn('GROQ_API_KEY is missing! AI features will not work properly.');
      // Fallback with empty string to avoid crash during init, but it will fail on request
      this.groq = new Groq({ apiKey: 'DUMMY_KEY' });
    } else {
      this.groq = new Groq({ apiKey });
    }
  }

  async chat(message: string, history: { role: string; parts: { text: string }[] }[] = []): Promise<string> {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');
    if (!apiKey) {
      return "Mohon maaf, fitur AI saat ini belum dapat digunakan karena GROQ_API_KEY belum dikonfigurasi di server. Silakan tambahkan rahasia/secret API ke server Anda.";
    }

    try {
      const messages: any[] = [
        { role: 'system', content: this.systemPrompt },
      ];

      // Convert history
      for (const h of history) {
        messages.push({
          role: h.role === 'model' || h.role === 'assistant' ? 'assistant' : 'user',
          content: h.parts[0]?.text || '',
        });
      }

      messages.push({ role: 'user', content: message });

      const completion = await this.groq.chat.completions.create({
        messages,
        model: 'llama-3.1-8b-instant', // Or 'llama-3.3-70b-versatile'
        temperature: 0.7,
      });

      return completion.choices[0]?.message?.content || "Maaf, saya tidak bisa memberikan jawaban saat ini.";
    } catch (error) {
      this.logger.error('Failed to communicate with Groq AI', error);
      return "Maaf, terjadi kesalahan saat menghubungi server AI. Mohon coba beberapa saat lagi.";
    }
  }
}
