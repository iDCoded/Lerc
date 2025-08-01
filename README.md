# Lerc Voice Assistant

A Next.js-based offline-capable voice assistant that runs locally except for OpenAI API calls. Features local speech-to-text using Whisper WASM, OpenAI integration for natural language processing, and local text-to-speech synthesis.

## Features

- 🎤 **Local Speech-to-Text**: Uses Whisper WASM for offline transcription
- 🤖 **OpenAI Integration**: Sends transcribed text to OpenAI Chat Completion API
- 🔊 **Local Text-to-Speech**: Synthesizes responses using Web Speech API
- 📱 **PWA Support**: Installable as a Progressive Web App
- 🔄 **Offline Capability**: Works offline except for OpenAI API calls
- ⚡ **Performance Tracking**: Real-time latency metrics for STT, API, and TTS
- 🎨 **Modern UI**: Beautiful, responsive interface with real-time feedback

## Performance Targets

- **Total Response Time**: < 1.2 seconds on good networks
- **STT Latency**: < 500ms
- **API Latency**: < 300ms
- **TTS Latency**: < 400ms

## Prerequisites

- Node.js 18+
- OpenAI API key
- Modern browser with WebAssembly support

## Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd lerc
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:

   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Download Whisper WASM files**
   The app expects Whisper WASM files in the `public/whisper/` directory:

   - `libmain.wasm`
   - `libmain.js`
   - `ggml-tiny.en.bin`
   - `helpers.js`
   - `libbench.js`
   - `libbench.wasm`
   - `libcommand.js`
   - `libcommand.wasm`
   - `libstream.js`
   - `libstream.wasm`

   You can download these from the [whisper.cpp](https://github.com/ggerganov/whisper.cpp) repository.

5. **Run the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## Usage

1. **Start Recording**: Click the microphone button to begin recording
2. **Speak**: Your speech will be transcribed in real-time
3. **Stop Recording**: Click the stop button to process your message
4. **Listen**: The assistant will respond with synthesized speech
5. **View Metrics**: Check performance metrics in the dashboard

## Architecture

### Core Components

- **`useVoiceAssistant`**: Main hook orchestrating the STT→LLM→TTS pipeline
- **`useMicrophone`**: Handles audio recording and streaming
- **`whisperWorker.ts`**: Web Worker for local speech-to-text
- **`ttsWorker.ts`**: Web Worker for local text-to-speech
- **`/api/chat`**: OpenAI API integration endpoint

### PWA Features

- **Service Worker**: Caches Whisper WASM files and app assets
- **Web App Manifest**: Enables app installation
- **Offline Support**: Works without internet (except OpenAI calls)

### Performance Optimization

- **Web Workers**: STT and TTS run in background threads
- **Streaming Audio**: Real-time audio processing
- **Caching**: Service worker caches critical assets
- **Lazy Loading**: Components load on demand

## Development

### Project Structure

```
lerc/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/            # React components
│   ├── ui/               # UI components
│   ├── VoiceAssistant.tsx # Main voice assistant component
│   └── PWARegistration.tsx # PWA registration
├── hooks/                # Custom React hooks
│   ├── useMicrophone.ts  # Microphone handling
│   └── useVoiceAssistant.ts # Main voice assistant logic
├── workers/              # Web Workers
│   ├── whisperWorker.ts  # Whisper STT worker
│   └── ttsWorker.ts      # TTS worker
├── public/               # Static assets
│   ├── whisper/          # Whisper WASM files
│   ├── sw.js            # Service worker
│   └── manifest.json    # PWA manifest
└── package.json
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## Troubleshooting

### Common Issues

1. **Whisper WASM not loading**

   - Ensure all WASM files are in `public/whisper/`
   - Check browser console for CORS errors

2. **Microphone access denied**

   - Grant microphone permissions in browser
   - Check HTTPS requirement for microphone access

3. **OpenAI API errors**

   - Verify API key in `.env.local`
   - Check API quota and billing

4. **PWA not installing**
   - Ensure HTTPS in production
   - Check manifest.json configuration

### Performance Tips

- Use a modern device with good CPU
- Ensure stable internet connection for API calls
- Close other resource-intensive applications
- Use headphones for better audio quality

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- [whisper.cpp](https://github.com/ggerganov/whisper.cpp) for WASM implementation
- [OpenAI](https://openai.com) for language model API
- [Next.js](https://nextjs.org) for the framework
- [Tailwind CSS](https://tailwindcss.com) for styling
