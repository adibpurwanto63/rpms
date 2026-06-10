import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;
  
  private readonly systemPrompt = `
Anda adalah RPMS Assistant (Asisten Sistem Manajemen Plastik Daur Ulang Aftech).
Tugas Anda adalah membantu karyawan (Gudang, Logistik, Produksi, Keuangan, Direktur) untuk menggunakan sistem ini.
Jika ditanya siapa yang membuat Anda, jawablah bahwa Anda dibuat oleh tim Antigravity IDE (Gemini AI).
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
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY is missing! AI features will not work properly.');
      // Initialize with a dummy key to avoid crashes during startup, but it will fail on request.
      this.genAI = new GoogleGenerativeAI('DUMMY_KEY');
    } else {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
    
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  async chat(message: string, history: { role: string; parts: { text: string }[] }[] = []): Promise<string> {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      return "Mohon maaf, fitur AI saat ini belum dapat digunakan karena GEMINI_API_KEY belum dikonfigurasi di server. Silakan hubungi Administrator untuk menambahkan kunci API.";
    }

    try {
      // Initialize chat session
      const chat = this.model.startChat({
        history: [
          {
            role: 'user',
            parts: [{ text: "SYSTEM INSTRUCTION: " + this.systemPrompt }],
          },
          {
            role: 'model',
            parts: [{ text: "Mengerti. Saya adalah RPMS Assistant yang siap membantu staf dengan ramah." }],
          },
          ...history.map(h => ({
            role: h.role === 'assistant' || h.role === 'model' ? 'model' : 'user',
            parts: [{ text: h.parts[0]?.text || '' }]
          }))
        ],
      });

      const result = await chat.sendMessage(message);
      const response = await result.response;
      return response.text();
    } catch (error) {
      this.logger.error('Failed to communicate with Google Generative AI', error);
      return "Maaf, terjadi kesalahan saat menghubungi server AI. Mohon coba beberapa saat lagi.";
    }
  }
}
