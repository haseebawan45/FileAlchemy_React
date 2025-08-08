// Conversion data structure for FileAlchemy

export const conversionCategories = {
  images: {
    name: 'Images',
    icon: '🖼️',
    description: 'Convert between image formats',
    color: 'from-blue-500 to-purple-600',
    formats: ['JPEG', 'PNG', 'WEBP', 'BMP', 'TIFF', 'GIF', 'SVG', 'ICO', 'HEIC']
  },
  documents: {
    name: 'Documents', 
    icon: '📄',
    description: 'Convert documents and text files',
    color: 'from-green-500 to-blue-600',
    formats: ['PDF', 'DOCX', 'TXT', 'HTML', 'RTF', 'XLSX', 'CSV', 'PPTX', 'ODT', 'ODS', 'ODP']
  },
  video: {
    name: 'Video',
    icon: '🎥', 
    description: 'Convert video files and formats',
    color: 'from-purple-500 to-pink-600',
    formats: ['MP4', 'AVI', 'MOV', 'MKV', 'WMV', 'WEBM', 'GIF']
  },
  audio: {
    name: 'Audio',
    icon: '🎵',
    description: 'Convert audio files and formats', 
    color: 'from-pink-500 to-red-600',
    formats: ['MP3', 'WAV', 'AAC', 'FLAC', 'OGG']
  },
  archives: {
    name: 'Archives',
    icon: '📦',
    description: 'Extract and compress archives',
    color: 'from-yellow-500 to-orange-600', 
    formats: ['ZIP', 'RAR', '7Z', 'TAR', 'GZ']
  },
  other: {
    name: 'Other',
    icon: '⚡',
    description: 'Additional conversion tools',
    color: 'from-gray-500 to-blue-600',
    formats: ['JSON', 'XML', 'YAML', 'CSV']
  }
};

export const supportedConversions = {
  // Image conversions
  'JPEG': ['PNG', 'WEBP', 'BMP', 'TIFF', 'GIF'],
  'PNG': ['JPEG', 'WEBP', 'BMP', 'TIFF', 'GIF', 'ICO'],
  'WEBP': ['JPEG', 'PNG', 'BMP', 'TIFF'],
  'BMP': ['JPEG', 'PNG', 'WEBP', 'TIFF'],
  'TIFF': ['JPEG', 'PNG', 'WEBP', 'BMP'],
  'GIF': ['JPEG', 'PNG', 'WEBP', 'MP4', 'WEBM'],
  'SVG': ['PNG', 'JPEG'],
  'ICO': ['PNG', 'JPEG'],
  'HEIC': ['JPEG', 'PNG'],

  // Document conversions  
  'PDF': ['DOCX', 'TXT', 'HTML', 'RTF', 'JPEG', 'PNG'],
  'DOCX': ['PDF', 'TXT', 'RTF', 'HTML', 'ODT'],
  'TXT': ['DOCX', 'PDF', 'HTML'],
  'HTML': ['PDF', 'DOCX', 'TXT'],
  'RTF': ['DOCX', 'PDF', 'TXT'],
  'XLSX': ['CSV', 'PDF', 'ODS', 'TXT'],
  'CSV': ['XLSX', 'PDF', 'TXT'],
  'PPTX': ['PDF', 'JPEG', 'ODP'],

  // Video conversions
  'MP4': ['AVI', 'MOV', 'MKV', 'WMV', 'WEBM', 'GIF'],
  'AVI': ['MP4', 'MOV', 'MKV', 'WMV'],
  'MOV': ['MP4', 'AVI', 'MKV', 'WMV'],
  'MKV': ['MP4', 'AVI', 'MOV', 'WMV'],
  'WMV': ['MP4', 'AVI', 'MOV', 'MKV'],
  'WEBM': ['MP4', 'AVI', 'MOV'],

  // Audio conversions
  'MP3': ['WAV', 'AAC', 'FLAC', 'OGG'],
  'WAV': ['MP3', 'AAC', 'FLAC', 'OGG'],
  'AAC': ['MP3', 'WAV', 'FLAC', 'OGG'],
  'FLAC': ['MP3', 'WAV', 'AAC', 'OGG'],
  'OGG': ['MP3', 'WAV', 'AAC', 'FLAC'],

  // Archive conversions
  'ZIP': ['7Z', 'TAR', 'GZ'],
  'RAR': ['ZIP', '7Z', 'TAR', 'GZ'], // RAR can be extracted to other formats
  '7Z': ['ZIP', 'TAR', 'GZ'],
  'TAR': ['ZIP', '7Z', 'GZ'],
  'GZ': ['ZIP', '7Z', 'TAR']
};

export const getConversionsByCategory = (category) => {
  if (!conversionCategories[category]) return [];
  
  const formats = conversionCategories[category].formats;
  const conversions = [];
  
  formats.forEach(format => {
    if (supportedConversions[format]) {
      supportedConversions[format].forEach(target => {
        conversions.push({
          from: format,
          to: target,
          category
        });
      });
    }
  });
  
  return conversions;
};

export const getCategoryByFormat = (format) => {
  for (const [categoryKey, category] of Object.entries(conversionCategories)) {
    if (category.formats.includes(format.toUpperCase())) {
      return categoryKey;
    }
  }
  return 'other';
};

export const getFormatIcon = (format) => {
  const category = getCategoryByFormat(format);
  return conversionCategories[category].icon;
};

export const isMultiPageConversion = (sourceFormat, targetFormat) => {
  // PDF to image conversions result in multiple files (one per page) packaged in ZIP
  return sourceFormat?.toUpperCase() === 'PDF' && 
         ['JPEG', 'PNG'].includes(targetFormat?.toUpperCase());
};

export const getConversionDescription = (sourceFormat, targetFormat) => {
  if (isMultiPageConversion(sourceFormat, targetFormat)) {
    return `Convert PDF pages to ${targetFormat.toUpperCase()} images (packaged in ZIP file)`;
  }
  return `Convert ${sourceFormat?.toUpperCase()} to ${targetFormat?.toUpperCase()}`;
};
