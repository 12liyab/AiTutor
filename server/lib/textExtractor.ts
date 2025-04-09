import fs from 'fs';
import { createWorker } from 'tesseract.js';
// Use the legacy build for Node.js environments
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

/**
 * Extracts text from an image using Tesseract OCR
 */
export async function extractTextFromImage(imagePath: string): Promise<string> {
  try {
    const worker = await createWorker('eng');
    const result = await worker.recognize(imagePath);
    await worker.terminate();
    return result.data.text;
  } catch (error) {
    console.error('Error extracting text from image:', error);
    throw new Error(`Failed to extract text from image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extracts text from a PDF document using PDF.js
 */
export async function extractTextFromPDF(pdfPath: string): Promise<string> {
  try {
    // Load the PDF file
    const data = new Uint8Array(fs.readFileSync(pdfPath));
    
    // Initialize PDF.js document
    const loadingTask = pdfjs.getDocument({ data });
    const pdf = await loadingTask.promise;
    
    let extractedText = '';
    
    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const textItems = content.items.map((item: any) => 
        'str' in item ? item.str : ''
      );
      extractedText += textItems.join(' ') + '\n';
    }
    
    return extractedText;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extracts text from a file based on its file type
 */
export async function extractTextFromFile(filePath: string, fileType: string): Promise<string> {
  try {
    if (fileType === 'application/pdf' || fileType === 'pdf') {
      return await extractTextFromPDF(filePath);
    } else if (
      fileType === 'image/png' || 
      fileType === 'image/jpeg' || 
      fileType === 'image/jpg' ||
      fileType === 'png' ||
      fileType === 'jpeg' ||
      fileType === 'jpg'
    ) {
      return await extractTextFromImage(filePath);
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }
  } catch (error) {
    console.error('Error extracting text from file:', error);
    throw new Error(`Failed to extract text from file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
