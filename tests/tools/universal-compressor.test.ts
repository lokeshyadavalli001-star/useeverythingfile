import { describe, it, expect } from 'vitest';
import { UniversalFileCompressor } from '../../lib/client/universal-compressor';
import JSZip from 'jszip';

describe('UniversalFileCompressor', () => {
  it('directly compresses text files without changing to .zip', async () => {
    const rawText = 'Line 1   \r\n\r\n\r\nLine 2   \r\nLine 3   \r\n';
    const blob = new Blob([rawText], { type: 'text/plain' });
    const file = new File([blob], 'sample.txt', { type: 'text/plain' });

    const result = await UniversalFileCompressor.compressFile(file);

    expect(result.filename).toBe('sample-compressed.txt');
    expect(result.filename.endsWith('.zip')).toBe(false);
    expect(result.compressedSize).toBeLessThan(result.originalSize);
    expect(result.savingsPercentage).toBeGreaterThan(0);

    const compressedText = await result.blob.text();
    expect(compressedText).toContain('Line 1');
    expect(compressedText).toContain('Line 2');
    expect(compressedText.includes('\r\n')).toBe(false);
  });

  it('directly compresses JSON data without changing to .zip', async () => {
    const jsonObject = {
      name: 'Everything File',
      description: 'Universal compression engine',
      nested: {
        numbers: [1, 2, 3, 4, 5],
        status: 'active',
      },
    };
    const formattedJSON = JSON.stringify(jsonObject, null, 4);
    const file = new File([formattedJSON], 'data.json', { type: 'application/json' });

    const result = await UniversalFileCompressor.compressFile(file);

    expect(result.filename).toBe('data-compressed.json');
    expect(result.compressedSize).toBeLessThan(result.originalSize);

    const compressedText = await result.blob.text();
    expect(JSON.parse(compressedText)).toEqual(jsonObject);
  });

  it('directly compresses SVG files without changing to .zip', async () => {
    const svgContent = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg"><!-- comment --><metadata>Sample</metadata><circle cx="50" cy="50" r="40" fill="red" /></svg>';
    const file = new File([svgContent], 'icon.svg', { type: 'image/svg+xml' });

    const result = await UniversalFileCompressor.compressFile(file);

    expect(result.filename).toBe('icon-compressed.svg');
    expect(result.compressedSize).toBeLessThan(result.originalSize);

    const compressedText = await result.blob.text();
    expect(compressedText.includes('<!--')).toBe(false);
    expect(compressedText.includes('<metadata>')).toBe(false);
  });

  it('directly compresses CSS and code files without changing to .zip', async () => {
    const cssCode = '/* Style */ .container { display: flex; margin: 20px 0; }';
    const file = new File([cssCode], 'style.css', { type: 'text/css' });

    const result = await UniversalFileCompressor.compressFile(file);

    expect(result.filename).toBe('style-compressed.css');
    expect(result.compressedSize).toBeLessThan(result.originalSize);

    const compressedText = await result.blob.text();
    expect(compressedText.includes('/* Style */')).toBe(false);
  });

  it('directly compresses Office (.docx) packages using Level 9 Deflate without changing to .zip', async () => {
    const zip = new JSZip();
    zip.file('[Content_Types].xml', '<Types></Types>', { compression: 'STORE' });
    zip.file('word/document.xml', '<w:document>' + 'A'.repeat(5000) + '</w:document>', { compression: 'STORE' });

    const rawDocxBlob = await zip.generateAsync({ type: 'blob' });
    const file = new File([rawDocxBlob], 'report.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

    const result = await UniversalFileCompressor.compressFile(file);

    expect(result.filename).toBe('report-compressed.docx');
    expect(result.filename.endsWith('.zip')).toBe(false);
    expect(result.compressedSize).toBeLessThan(result.originalSize);
    expect(result.savingsPercentage).toBeGreaterThan(40);

    const reloaded = await JSZip.loadAsync(await result.blob.arrayBuffer());
    expect(reloaded.file('word/document.xml')).not.toBeNull();
  });

  it('safely compresses binary padding on executables without changing to .zip', async () => {
    const payloadSize = 1024;
    const paddingSize = 2048;
    const bytes = new Uint8Array(payloadSize + paddingSize);
    for (let i = 0; i < payloadSize; i++) {
      bytes[i] = (i % 255) + 1;
    }

    const file = new File([bytes], 'installer.exe', { type: 'application/octet-stream' });

    const result = await UniversalFileCompressor.compressFile(file);

    expect(result.filename).toBe('installer-compressed.exe');
    expect(result.filename.endsWith('.zip')).toBe(false);
    expect(result.compressedSize).toBeLessThan(result.originalSize);
    expect(result.savingsPercentage).toBeGreaterThan(0);
  });
});