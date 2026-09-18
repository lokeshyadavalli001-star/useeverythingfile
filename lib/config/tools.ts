export type ToolCategory = "pdf" | "image" | "document";

export interface ToolDefinition {
  id: string;
  slug: string;
  name: string;
  category: ToolCategory;
  tagline: string;
  description: string;
  iconName: string;
  popular?: boolean;
  clientSideOnly: boolean;
  acceptedExtensions: string[];
  maxFiles: number;
  outputExtension: string;
  features: string[];
  seoKeywords: string[];
  faqs: Array<{ question: string; answer: string }>;
}

export const TOOLS: ToolDefinition[] = [
  // --- UNIVERSAL FILE COMPRESSOR ---
  {
    id: "compress-file",
    slug: "compress-file",
    name: "Compress File",
    category: "document",
    tagline: "Compress any file directly without converting to ZIP",
    description: "Universal file compressor for Office docs, PDFs, images, code, audio, video, text, and binary files. 100% private in-browser compression.",
    iconName: "Archive",
    popular: true,
    clientSideOnly: true,
    acceptedExtensions: [
      ".txt", ".docx", ".pdf", ".xlsx", ".pptx", ".csv", ".md", ".rtf", ".odt",
      ".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp", ".bmp",
      ".mp4", ".mov", ".avi", ".mkv",
      ".mp3", ".wav", ".flac", ".m4a",
      ".zip", ".rar", ".7z", ".tar.gz",
      ".exe", ".dmg", ".apk", ".app",
      ".html", ".css", ".js", ".py", ".cpp", ".java", ".json", ".xml", ".sql",
      ".ini", ".cfg", ".log", ".bak", ".iso", ".torrent", ".font", ".ttf", ".otf", ".woff", ".woff2", "*"
    ],
    maxFiles: 1,
    outputExtension: "auto",
    features: [
      "No ZIP container: directly compresses into native file format",
      "Supports Office (.docx, .xlsx, .pptx), PDF, Images, Code, Audio & Binary",
      "Level 9 Deflate & smart stream optimization",
      "100% Client-Side: zero files sent to servers"
    ],
    seoKeywords: [
      "compress file", "file compressor online", "compress docx", "compress xlsx",
      "compress any file", "compress without zip", "reduce file size", "direct file compressor"
    ],
    faqs: [
      {
        question: "Does this tool convert my file into a .zip archive?",
        answer: "No! Unlike other online tools, Everything File compresses your file directly in its native format. A .docx remains a .docx, a .pdf remains a .pdf, and a .jpg remains a .jpg."
      },
      {
        question: "Are my files uploaded to your servers?",
        answer: "Never. All compression routines execute 100% locally inside your browser using WebAssembly, Canvas, and client-side stream engines."
      },
      {
        question: "What file types can I compress?",
        answer: "You can compress over 48+ file formats including Word (.docx), Excel (.xlsx), PowerPoint (.pptx), PDFs, Images (JPG, PNG, WebP, SVG), Code (JS, HTML, CSS, JSON, Python), Audio, and general binary files."
      }
    ]
  },
  // --- PDF TOOLS ---
  {
    id: "merge-pdf",
    slug: "merge-pdf",
    name: "Merge PDF",
    category: "pdf",
    tagline: "Combine multiple PDFs into one unified document",
    description: "Easily merge multiple PDF files in your preferred sequence. 100% processed in your browser with zero file uploads.",
    iconName: "FilePlus2",
    popular: true,
    clientSideOnly: true,
    acceptedExtensions: [".pdf"],
    maxFiles: 50,
    outputExtension: "pdf",
    features: ["Drag-and-drop reordering", "Zero server uploads", "Instant preview", "Unlimited file combining"],
    seoKeywords: ["merge pdf", "combine pdf", "join pdf files", "merge pdf client side", "free pdf merger"],
    faqs: [
      {
        question: "Are my files uploaded to any server when merging?",
        answer: "No. Merge PDF runs entirely in your browser. Your files never leave your device."
      },
      {
        question: "Can I reorder pages before merging?",
        answer: "Yes, you can drag and drop or use the touch controls to arrange files in the exact order you want."
      }
    ]
  },
  {
    id: "split-pdf",
    slug: "split-pdf",
    name: "Split PDF",
    category: "pdf",
    tagline: "Extract pages or split your PDF into separate files",
    description: "Separate specific page ranges or extract each page into individual PDF files safely on your local device.",
    iconName: "Split",
    popular: true,
    clientSideOnly: true,
    acceptedExtensions: [".pdf"],
    maxFiles: 1,
    outputExtension: "zip",
    features: ["Custom range extraction (e.g. 1-3, 5, 8-10)", "Extract all pages to ZIP", "Local execution", "Fast processing"],
    seoKeywords: ["split pdf", "separate pdf pages", "extract pages from pdf", "split pdf into single pages"],
    faqs: [
      {
        question: "How do I specify custom page ranges?",
        answer: "Simply enter comma-separated ranges such as '1-3, 5, 8-10'. The tool will package each requested segment for you."
      }
    ]
  },
  {
    id: "compress-pdf",
    slug: "compress-pdf",
    name: "Compress PDF",
    category: "pdf",
    tagline: "Reduce PDF file size while maintaining readability",
    description: "Shrink bloated PDF documents with adjustable compression levels. Private, browser-local compression.",
    iconName: "Minimize2",
    popular: true,
    clientSideOnly: true,
    acceptedExtensions: [".pdf"],
    maxFiles: 1,
    outputExtension: "pdf",
    features: ["3 Compression levels: Extreme, Recommended, Light", "Stream optimization", "Zero server transfer", "Real-time size comparison"],
    seoKeywords: ["compress pdf", "reduce pdf size", "shrink pdf", "pdf compressor free"],
    faqs: [
      {
        question: "How does browser-side PDF compression work?",
        answer: "It reorganizes internal PDF object streams, strips redundant metadata, and flattens non-essential structural caches directly in memory."
      }
    ]
  },
  {
    id: "compress-pdf-to-1mb",
    slug: "compress-pdf-to-1mb",
    name: "Compress PDF to 1 MB",
    category: "pdf",
    tagline: "Targeted compression guaranteeing output under 1 MB",
    description: "Designed specifically for job applications, government portals, and admissions portals requiring files under 1 MB.",
    iconName: "FileCheck",
    popular: false,
    clientSideOnly: true,
    acceptedExtensions: [".pdf"],
    maxFiles: 1,
    outputExtension: "pdf",
    features: ["Automatic iterative size calibration", "Guaranteed under 1024 KB", "Privacy guaranteed", "One-click download"],
    seoKeywords: ["compress pdf to 1mb", "reduce pdf to 1mb", "pdf 1mb compressor for upload"],
    faqs: [
      {
        question: "Why compress to exactly 1 MB?",
        answer: "Many official portals (visa applications, universities, job boards) enforce a strict 1 MB file upload ceiling."
      }
    ]
  },
  {
    id: "compress-pdf-to-500kb",
    slug: "compress-pdf-to-500kb",
    name: "Compress PDF to 500 KB",
    category: "pdf",
    tagline: "Ultra-compact compression target under 500 KB",
    description: "Compress PDFs down to under 500 KB for strict institutional portals and email attachments.",
    iconName: "FileDown",
    popular: false,
    clientSideOnly: true,
    acceptedExtensions: [".pdf"],
    maxFiles: 1,
    outputExtension: "pdf",
    features: ["500 KB target threshold", "Preserves vector fonts", "In-browser processing", "Fast download"],
    seoKeywords: ["compress pdf to 500kb", "reduce pdf to 500kb online free", "pdf under 500kb"],
    faqs: [
      {
        question: "Will text stay sharp under 500 KB?",
        answer: "Yes, standard vector text and glyphs remain crisp because compression focuses on metadata, streams, and image dimensions."
      }
    ]
  },
  {
    id: "pdf-to-jpg",
    slug: "pdf-to-jpg",
    name: "PDF → JPG",
    category: "pdf",
    tagline: "Convert PDF pages into high-resolution JPG images",
    description: "Render every PDF page into crisp JPG pictures. Download individual images or a ZIP archive containing all pages.",
    iconName: "Image",
    popular: true,
    clientSideOnly: true,
    acceptedExtensions: [".pdf"],
    maxFiles: 1,
    outputExtension: "zip",
    features: ["High-DPI rendering", "All pages or selected pages", "Batch ZIP download", "Local canvas rendering"],
    seoKeywords: ["pdf to jpg", "convert pdf to images", "pdf to jpeg", "extract images from pdf"],
    faqs: [
      {
        question: "What resolution are the rendered JPGs?",
        answer: "By default pages are rendered at 2x screen DPI (approx 150-200 DPI) for crisp, readable text and sharp graphics."
      }
    ]
  },
  {
    id: "jpg-to-pdf",
    slug: "jpg-to-pdf",
    name: "JPG → PDF",
    category: "pdf",
    tagline: "Transform JPG photos and documents into a clean PDF",
    description: "Convert photos, scans, and graphic images into a consolidated, professional PDF document.",
    iconName: "FileText",
    popular: true,
    clientSideOnly: true,
    acceptedExtensions: [".jpg", ".jpeg"],
    maxFiles: 50,
    outputExtension: "pdf",
    features: ["Page orientation controls", "Custom margins (none, small, normal)", "Multi-photo combining", "Drag to reorder"],
    seoKeywords: ["jpg to pdf", "convert jpeg to pdf", "pictures to pdf", "photos to pdf document"],
    faqs: [
      {
        question: "Can I combine multiple JPGs into one PDF?",
        answer: "Yes, you can upload dozens of images and arrange them into a single consolidated PDF document."
      }
    ]
  },
  {
    id: "delete-pdf-pages",
    slug: "delete-pdf-pages",
    name: "Delete PDF Pages",
    category: "pdf",
    tagline: "Remove unwanted pages with an interactive visual grid",
    description: "View visual thumbnails of every page in your PDF and click to delete blank or unwanted pages instantly.",
    iconName: "Trash2",
    popular: false,
    clientSideOnly: true,
    acceptedExtensions: [".pdf"],
    maxFiles: 1,
    outputExtension: "pdf",
    features: ["Visual page selector", "Multi-page select", "Instant deletion", "Download cleaned document"],
    seoKeywords: ["delete pdf pages", "remove pages from pdf", "delete pages online free", "pdf page remover"],
    faqs: [
      {
        question: "Can I delete multiple pages at once?",
        answer: "Yes, simply click on the thumbnail of each page you want removed, then click Download."
      }
    ]
  },
  {
    id: "extract-pdf-pages",
    slug: "extract-pdf-pages",
    name: "Extract PDF Pages",
    category: "pdf",
    tagline: "Select and extract only the pages you need",
    description: "Choose specific pages from a large PDF document and generate a new, focused PDF file containing only those pages.",
    iconName: "Layers",
    popular: false,
    clientSideOnly: true,
    acceptedExtensions: [".pdf"],
    maxFiles: 1,
    outputExtension: "pdf",
    features: ["Visual grid selection", "Preserves original quality", "One-click extraction", "100% private"],
    seoKeywords: ["extract pdf pages", "select pages from pdf", "save specific pdf pages"],
    faqs: [
      {
        question: "Does extraction lower the quality of original pages?",
        answer: "No, extraction copies the original page tree and embedded objects losslessly without recompression."
      }
    ]
  },
  {
    id: "reorder-pdf",
    slug: "reorder-pdf",
    name: "Reorder PDF",
    category: "pdf",
    tagline: "Rearrange PDF pages with drag & drop or touch arrows",
    description: "Fix disordered page scans or organize presentations by rearranging page order with intuitive touch and mouse controls.",
    iconName: "ArrowUpDown",
    popular: false,
    clientSideOnly: true,
    acceptedExtensions: [".pdf"],
    maxFiles: 1,
    outputExtension: "pdf",
    features: ["Interactive page drag handle", "Mobile-friendly move buttons", "Visual live feedback", "Fast lossless export"],
    seoKeywords: ["reorder pdf pages", "rearrange pdf pages", "change pdf page order"],
    faqs: [
      {
        question: "Does this work on mobile devices?",
        answer: "Yes, we provide both drag handles and dedicated 'Move Left' / 'Move Right' touch buttons for phones and tablets."
      }
    ]
  },
  {
    id: "rotate-pdf",
    slug: "rotate-pdf",
    name: "Rotate PDF",
    category: "pdf",
    tagline: "Rotate upside-down or sideways pages permanently",
    description: "Rotate individual pages or all pages at once (90°, 180°, 270°) with immediate visual rotation preview.",
    iconName: "RotateCw",
    popular: false,
    clientSideOnly: true,
    acceptedExtensions: [".pdf"],
    maxFiles: 1,
    outputExtension: "pdf",
    features: ["Per-page rotation", "Rotate All Left/Right", "Lossless rotation metadata update", "Instant download"],
    seoKeywords: ["rotate pdf", "turn pdf upside down", "rotate pdf permanently", "fix upside down pdf"],
    faqs: [
      {
        question: "Is rotation permanent?",
        answer: "Yes, the rotation angle is saved directly into the PDF specification so it opens right-side up in any viewer."
      }
    ]
  },
  {
    id: "pdf-to-text",
    slug: "pdf-to-text",
    name: "PDF → Text",
    category: "pdf",
    tagline: "Extract selectable text from PDF documents",
    description: "Extract text from any readable PDF document, view it in a secure plain-text editor, copy with one click, or download as .txt.",
    iconName: "FileCode",
    popular: false,
    clientSideOnly: true,
    acceptedExtensions: [".pdf"],
    maxFiles: 1,
    outputExtension: "txt",
    features: ["Instant text parsing", "XSS-safe text rendering", "Copy to clipboard", "Plain text .txt download"],
    seoKeywords: ["pdf to text", "extract text from pdf", "convert pdf to txt", "pdf text extractor"],
    faqs: [
      {
        question: "Does this work on scanned documents without selectable text?",
        answer: "This tool extracts all selectable vector text embedded in the PDF. Scanned image-only PDFs without OCR layers require OCR."
      }
    ]
  },

  // --- IMAGE TOOLS ---
  {
    id: "compress-image",
    slug: "compress-image",
    name: "Compress Image",
    category: "image",
    tagline: "Compress JPG, PNG, and WebP images with live quality slider",
    description: "Dramatically reduce picture sizes for web and email without noticeable quality loss. Instant local compression.",
    iconName: "Sliders",
    popular: true,
    clientSideOnly: true,
    acceptedExtensions: [".jpg", ".jpeg", ".png", ".webp"],
    maxFiles: 10,
    outputExtension: "jpg",
    features: ["Adjustable quality slider (1-100%)", "Real-time file size comparison", "Zero server uploads", "Batch support"],
    seoKeywords: ["compress image", "reduce image size", "shrink picture", "image optimizer"],
    faqs: [
      {
        question: "What image formats are supported?",
        answer: "We support JPG, JPEG, PNG, and WebP images."
      }
    ]
  },
  {
    id: "resize-image",
    slug: "resize-image",
    name: "Resize Image",
    category: "image",
    tagline: "Change pixel dimensions or scale by percentage",
    description: "Quickly resize images by exact pixel width and height or scale down to 75%, 50%, or 25% with aspect ratio lock.",
    iconName: "Maximize2",
    popular: true,
    clientSideOnly: true,
    acceptedExtensions: [".jpg", ".jpeg", ".png", ".webp"],
    maxFiles: 10,
    outputExtension: "jpg",
    features: ["Aspect ratio lock", "Preset percentages (25%, 50%, 75%)", "Custom width/height inputs", "Bicubic canvas scaling"],
    seoKeywords: ["resize image", "change image dimensions", "scale photo", "picture resizer"],
    faqs: [
      {
        question: "Will resizing distort my photo?",
        answer: "No, the aspect ratio lock is enabled by default so your image maintains its original proportions."
      }
    ]
  },
  {
    id: "jpg-to-png",
    slug: "jpg-to-png",
    name: "JPG → PNG",
    category: "image",
    tagline: "Convert JPG photos into lossless PNG format",
    description: "Convert compressed JPG files into lossless PNG images with clean color depth for graphics and editing.",
    iconName: "FileImage",
    popular: false,
    clientSideOnly: true,
    acceptedExtensions: [".jpg", ".jpeg"],
    maxFiles: 10,
    outputExtension: "png",
    features: ["Lossless PNG encoding", "High fidelity canvas export", "Batch conversion", "Local browser processing"],
    seoKeywords: ["jpg to png", "convert jpg to png", "jpeg to png converter free"],
    faqs: [
      {
        question: "Why convert JPG to PNG?",
        answer: "PNG uses lossless compression, making it ideal when you need to edit images without repeated quality degradation."
      }
    ]
  },
  {
    id: "png-to-jpg",
    slug: "png-to-jpg",
    name: "PNG → JPG",
    category: "image",
    tagline: "Convert transparent PNGs into standard JPG images",
    description: "Convert heavy PNG graphics into lightweight JPG pictures with customizable background fill for transparent areas.",
    iconName: "FileImage",
    popular: false,
    clientSideOnly: true,
    acceptedExtensions: [".png"],
    maxFiles: 10,
    outputExtension: "jpg",
    features: ["Custom white background fill", "Quality adjustment", "Fast local conversion", "Batch export"],
    seoKeywords: ["png to jpg", "convert png to jpg", "transparent png to jpeg"],
    faqs: [
      {
        question: "What happens to transparent backgrounds?",
        answer: "Since JPG does not support transparency, transparent pixels are cleanly blended onto a solid white background."
      }
    ]
  },
  {
    id: "jpg-to-webp",
    slug: "jpg-to-webp",
    name: "JPG → WebP",
    category: "image",
    tagline: "Convert JPG to modern, next-gen WebP format",
    description: "Boost web performance by converting JPG images to Google's high-efficiency WebP format with up to 30% smaller sizes.",
    iconName: "Zap",
    popular: false,
    clientSideOnly: true,
    acceptedExtensions: [".jpg", ".jpeg"],
    maxFiles: 10,
    outputExtension: "webp",
    features: ["Next-gen web format", "Superior compression ratio", "Adjustable quality", "Browser native encoding"],
    seoKeywords: ["jpg to webp", "convert jpg to webp", "next gen image format converter"],
    faqs: [
      {
        question: "Why use WebP over JPG?",
        answer: "WebP generally provides 25-35% smaller file sizes than JPG at equivalent visual quality, improving website speed."
      }
    ]
  },
  {
    id: "webp-to-jpg",
    slug: "webp-to-jpg",
    name: "WebP → JPG",
    category: "image",
    tagline: "Convert WebP images into universally compatible JPGs",
    description: "Convert downloaded WebP pictures into universal JPG format that opens in all legacy image editors and operating systems.",
    iconName: "FileImage",
    popular: false,
    clientSideOnly: true,
    acceptedExtensions: [".webp"],
    maxFiles: 10,
    outputExtension: "jpg",
    features: ["Universal compatibility", "Fast local decoding", "Batch download", "Zero upload"],
    seoKeywords: ["webp to jpg", "convert webp to jpg", "save webp as jpeg"],
    faqs: [
      {
        question: "Can I open the resulting JPG in any software?",
        answer: "Yes, JPG is supported by virtually all photo viewers, printers, and editing applications."
      }
    ]
  },
  {
    id: "image-to-pdf",
    slug: "image-to-pdf",
    name: "Image → PDF",
    category: "image",
    tagline: "Combine PNG, JPG, and WebP pictures into a PDF document",
    description: "Convert photos, screenshots, and graphics into a multi-page PDF document with custom margins and layout.",
    iconName: "FileCheck",
    popular: true,
    clientSideOnly: true,
    acceptedExtensions: [".jpg", ".jpeg", ".png", ".webp"],
    maxFiles: 50,
    outputExtension: "pdf",
    features: ["Mixed image types supported", "Portrait & Landscape modes", "Page margin options", "Drag to rearrange"],
    seoKeywords: ["image to pdf", "convert images to pdf", "combine photos into pdf", "png and jpg to pdf"],
    faqs: [
      {
        question: "Can I mix PNG and JPG images in one PDF?",
        answer: "Yes, you can upload any combination of JPG, PNG, and WebP files into a single unified PDF."
      }
    ]
  },
  {
    id: "crop-image",
    slug: "crop-image",
    name: "Crop Image",
    category: "image",
    tagline: "Crop and frame pictures with aspect ratio presets",
    description: "Precision image cropper with 1:1, 4:3, 16:9, and Freeform aspect ratio presets, live rotation, and zoom controls.",
    iconName: "Crop",
    popular: true,
    clientSideOnly: true,
    acceptedExtensions: [".jpg", ".jpeg", ".png", ".webp"],
    maxFiles: 1,
    outputExtension: "png",
    features: ["Interactive crop handles", "Presets: Free, 1:1 Square, 4:3, 16:9 Widescreen", "Zoom & Pan", "Instant canvas crop"],
    seoKeywords: ["crop image", "image cropper online", "crop picture free", "crop photo aspect ratio"],
    faqs: [
      {
        question: "Does cropping reduce image sharpness?",
        answer: "No, cropping retains the original native pixel resolution of the selected region without downscaling."
      }
    ]
  },

  // --- DOCUMENT CONVERSION TOOLS ---
  {
    id: "pdf-to-word",
    slug: "pdf-to-word",
    name: "PDF → Word",
    category: "document",
    tagline: "Convert PDF documents into editable Word (.docx) files",
    description: "Convert PDF documents into editable Microsoft Word (.docx) documents with clean formatting.",
    iconName: "FileEdit",
    popular: true,
    clientSideOnly: false, // Isolated worker with client-side fallback
    acceptedExtensions: [".pdf"],
    maxFiles: 1,
    outputExtension: "docx",
    features: ["Extracts text, headings, and paragraphs", "Outputs valid DOCX file", "Isolated security worker architecture", "Immediate temporary file deletion"],
    seoKeywords: ["pdf to word", "convert pdf to docx", "editable word document from pdf", "pdf to word converter"],
    faqs: [
      {
        question: "How is my document handled during conversion?",
        answer: "If processed locally or through our isolated conversion worker, files use cryptographically randomized names, are checked against strict security boundaries, and are immediately destroyed."
      },
      {
        question: "Can I edit the generated DOCX in Microsoft Word or Google Docs?",
        answer: "Yes! The output is a standard OpenXML (.docx) file that opens natively in Microsoft Word, Google Docs, and LibreOffice."
      }
    ]
  },
  {
    id: "word-to-pdf",
    slug: "word-to-pdf",
    name: "Word → PDF",
    category: "document",
    tagline: "Convert Word (.docx) documents into standard PDF files",
    description: "Convert your Microsoft Word documents (.docx) into universal, read-only PDF documents with isolated sandbox security.",
    iconName: "FileText",
    popular: true,
    clientSideOnly: false,
    acceptedExtensions: [".docx"],
    maxFiles: 1,
    outputExtension: "pdf",
    features: ["Strict ZIP bomb & path traversal verification", "Preserves document formatting", "Immediate deletion lifecycle", "Universal PDF output"],
    seoKeywords: ["word to pdf", "convert docx to pdf", "doc to pdf free", "microsoft word to pdf"],
    faqs: [
      {
        question: "Which Word formats are supported?",
        answer: "We support Microsoft Word OpenXML (.docx) documents, with strict validation of internal archive structures."
      }
    ]
  }
];

export const POPULAR_TOOLS = TOOLS.filter((t) => t.popular);

export const TOOL_MAP = new Map(TOOLS.map((t) => [t.slug, t]));
