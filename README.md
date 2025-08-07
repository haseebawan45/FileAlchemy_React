# ⚡ FileAlchemy

A sleek, modern React frontend for file format conversion supporting dozens of file types with a beautiful interface.

![FileAlchemy Hero](https://via.placeholder.com/800x400/0ea5e9/ffffff?text=FileAlchemy+Transform+Your+Files+Instantly)

## ✨ Features

### 🔄 Comprehensive Format Support
- **Images**: JPEG ↔ PNG, WEBP, BMP, TIFF, GIF, SVG→PNG/JPG, ICO→PNG/JPG, HEIC→JPG/PNG
- **Documents**: PDF→DOCX/TXT/HTML/RTF/JPG, DOCX→PDF/TXT/RTF/HTML/ODT, XLSX→CSV/PDF/ODS/TXT, PPTX→PDF/JPG/ODP, TXT→DOCX/PDF/HTML
- **Video**: MP4↔AVI/MOV/MKV/WMV, GIF→MP4/WEBM, MP4→GIF
- **Audio**: MP3↔WAV/AAC/FLAC/OGG
- **Archives**: ZIP↔RAR/7Z/TAR, TAR→GZ, RAR↔7Z

### 🎨 Modern UI/UX
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Dark/Light Mode**: Toggle between themes with smooth transitions
- **Drag & Drop**: Intuitive file upload with visual feedback
- **Real-time Progress**: Animated progress bars and file-by-file status
- **Beautiful Animations**: Smooth hover effects and transitions

### 🔒 Security & Performance
- **Client-side Only**: No files uploaded to servers - everything processes in your browser
- **Fast Conversions**: Optimized algorithms for quick processing
- **Batch Processing**: Convert multiple files at once
- **Memory Efficient**: Proper cleanup of object URLs and resources

### 🚀 Technical Features
- **React 19** with modern hooks and functional components
- **Tailwind CSS** for responsive, utility-first styling
- **Context API** for state management
- **TypeScript Ready** - easily convertible to TypeScript
- **Accessibility** - ARIA labels and keyboard navigation
- **PWA Ready** - can be extended to Progressive Web App

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd FileAlchemy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` folder.

## 🏗️ Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # Reusable UI components
│   │   ├── Button.jsx   # Button component with variants
│   │   ├── Card.jsx     # Card container component
│   │   └── Notifications.jsx  # Toast notifications
│   ├── layout/          # Layout components
│   │   ├── Header.jsx   # App header with navigation
│   │   └── Footer.jsx   # App footer
│   ├── HomePage.jsx     # Landing page with categories
│   ├── ConversionPage.jsx  # Main conversion interface
│   ├── FileUpload.jsx   # File upload component
│   ├── ConversionProgress.jsx  # Progress tracking
│   └── ConversionResults.jsx   # Results display
├── contexts/            # React Context providers
│   └── AppContext.jsx   # Main app state management
├── hooks/               # Custom React hooks
│   └── useConversion.js # Conversion logic and API calls
├── data/                # Static data and configurations
│   └── conversions.js   # Supported formats and categories
├── utils/               # Utility functions
└── styles/              # CSS and styling
    └── index.css        # Global styles with Tailwind
```

## 🎯 Usage Guide

### 1. Select Conversion Type
Choose from six main categories:
- **Images** - Photo and graphics conversion
- **Documents** - Text and office document processing  
- **Video** - Video format conversion and GIF creation
- **Audio** - Audio format conversion
- **Archives** - Compression and extraction
- **Other** - Additional utilities

### 2. Choose Formats
- Select your source format (what you have)
- Pick your target format (what you want)
- Supported conversions are automatically filtered

### 3. Upload Files  
- **Drag & Drop**: Drop files directly into the upload area
- **Browse**: Click to open file browser
- **Multiple Files**: Upload several files for batch conversion

### 4. Convert & Download
- Click "Convert" to start processing
- Monitor real-time progress for each file
- Download individual files or all at once

## 🔧 Configuration

### Tailwind Configuration
The app uses a custom Tailwind configuration with:
- **Custom Colors**: Primary blue theme with purple accents
- **Extended Animations**: Custom bounce and pulse effects
- **Component Classes**: Pre-built UI component styles
- **Dark Mode**: Full dark theme support

### Adding New Formats
To add support for new file formats:

1. **Update conversion data** in `src/data/conversions.js`:
   ```javascript
   // Add to appropriate category
   images: {
     formats: ['JPEG', 'PNG', 'YOUR_FORMAT']
   }
   
   // Add conversion rules
   supportedConversions: {
     'YOUR_FORMAT': ['JPEG', 'PNG', 'WEBP']
   }
   ```

2. **Update MIME types** in `src/components/FileUpload.jsx`:
   ```javascript
   const mimeTypes = {
     'YOUR_FORMAT': 'image/your-format'
   }
   ```

3. **Implement conversion logic** in your backend API or extend the mock conversion function.

## 🎨 Customization

### Theming
Modify the color scheme in `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: {
        500: '#your-color',  // Change primary color
        // ... other shades
      }
    }
  }
}
```

### Animations
Add custom animations in `src/App.css`:
```css
@keyframes your-animation {
  /* animation keyframes */
}

.your-animation-class {
  animation: your-animation 1s ease-in-out;
}
```

## 📱 Mobile Responsiveness

The app is fully responsive with:
- **Mobile-first design** - Optimized for small screens
- **Touch-friendly interactions** - Large tap targets and gesture support  
- **Responsive grid layouts** - Adapts to all screen sizes
- **Collapsible navigation** - Mobile menu for smaller devices

## ♿ Accessibility

FileAlchemy follows web accessibility best practices:
- **Semantic HTML** - Proper heading hierarchy and landmark elements
- **ARIA labels** - Screen reader support for all interactive elements
- **Keyboard navigation** - Full keyboard accessibility
- **Color contrast** - WCAG AA compliant color schemes
- **Focus indicators** - Clear focus states for all interactive elements

## 🧪 Testing

```bash
# Run linter
npm run lint

# Build and preview production version
npm run build
npm run preview
```

## 🔮 Future Enhancements

- [ ] **Real Backend Integration** - Connect to actual conversion APIs
- [ ] **User Accounts** - Save conversion history and preferences
- [ ] **Advanced Options** - Quality settings, compression levels, metadata handling
- [ ] **Batch Templates** - Save common conversion workflows
- [ ] **Cloud Integration** - Google Drive, Dropbox integration
- [ ] **PWA Features** - Offline support and app installation
- [ ] **WebAssembly** - Client-side conversion for common formats
- [ ] **API Integration** - Connect to services like CloudConvert, Convertio

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💡 Tech Stack

- **Frontend**: React 19, React Router
- **Styling**: Tailwind CSS, Custom CSS animations
- **State Management**: React Context API
- **Build Tool**: Vite
- **Development**: ES6+, Modern JavaScript

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)
- **Email**: support@filealchemy.com

---

<div align="center">
  <strong>⚡ Transform Your Files Instantly with FileAlchemy ⚡</strong>
  <br />
  <em>Built with ❤️ using React and Tailwind CSS</em>
</div>