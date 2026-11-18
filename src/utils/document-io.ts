import { LocalDocument } from '../types/document.types.ts';
import { htmlToMarkdown, htmlToPlainText, markdownToHtml, plainTextToHtml } from '../core/text-cleaner.ts';
import { createDocument } from './document-manager.ts';

export type DocumentFormat = 'md' | 'html' | 'txt' | 'json';

const getSlugFilename = (title: string): string =>
  (title || 'untitled-document')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'document';

const triggerDownload = (filename: string, content: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const exportDocumentAs = (doc: LocalDocument, format: DocumentFormat): void => {
  const slug = getSlugFilename(doc.title);

  switch (format) {
    case 'md': {
      const md = htmlToMarkdown(doc.content);
      triggerDownload(`${slug}.md`, md, 'text/markdown;charset=utf-8');
      break;
    }
    case 'html': {
      const htmlDoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${doc.metaTitle || doc.title}</title>
  ${doc.metaDescription ? `<meta name="description" content="${doc.metaDescription.replace(/"/g, '&quot;')}" />` : ''}
</head>
<body>
${doc.content}
</body>
</html>`;
      triggerDownload(`${slug}.html`, htmlDoc, 'text/html;charset=utf-8');
      break;
    }
    case 'txt': {
      const txt = htmlToPlainText(doc.content);
      triggerDownload(`${slug}.txt`, txt, 'text/plain;charset=utf-8');
      break;
    }
    case 'json': {
      triggerDownload(`${slug}.json`, JSON.stringify(doc, null, 2), 'application/json;charset=utf-8');
      break;
    }
  }
};

const stripDangerousHtml = (html: string): string => {
  const parser = new DOMParser();
  const parsed = parser.parseFromString(html, 'text/html');
  parsed.querySelectorAll('script, style, iframe, object, embed').forEach((el) => el.remove());
  parsed.querySelectorAll('*').forEach((el) => {
    Array.from(el.attributes).forEach((attr) => {
      if (attr.name.toLowerCase().startsWith('on')) {
        el.removeAttribute(attr.name);
      }
    });
  });
  return parsed.body.innerHTML.trim() || '<p>Start writing here...</p>';
};

const stripExtension = (filename: string): string =>
  filename.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ').trim() || 'Imported Document';

export const parseImportedFile = (filename: string, rawText: string, format: DocumentFormat): LocalDocument => {
  const fallbackTitle = stripExtension(filename);

  switch (format) {
    case 'json': {
      const parsed = JSON.parse(rawText) as Partial<LocalDocument>;
      if (!parsed.title || typeof parsed.content !== 'string') {
        throw new Error('Invalid JSON document format.');
      }
      const base = createDocument(parsed.title);
      return {
        ...base,
        ...parsed,
        id: crypto.randomUUID(),
        createdAt: parsed.createdAt || Date.now(),
        updatedAt: Date.now(),
        targets: parsed.targets || { primary: '', secondary: ['', '', ''] },
        faqs: Array.isArray(parsed.faqs) ? parsed.faqs : [],
        isTrashed: false,
      };
    }
    case 'md': {
      const headingMatch = rawText.match(/^#\s+(.+)$/m);
      const title = headingMatch ? headingMatch[1].trim() : fallbackTitle;
      const html = markdownToHtml(rawText);
      const doc = createDocument(title);
      return { ...doc, content: html };
    }
    case 'html': {
      const parser = new DOMParser();
      const parsed = parser.parseFromString(rawText, 'text/html');
      const titleTag = parsed.querySelector('title')?.textContent?.trim();
      const h1Tag = parsed.querySelector('h1')?.textContent?.trim();
      const metaDesc = parsed.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() || '';
      const title = h1Tag || titleTag || fallbackTitle;
      const doc = createDocument(title);
      return {
        ...doc,
        content: stripDangerousHtml(rawText),
        metaTitle: titleTag || '',
        metaDescription: metaDesc,
      };
    }
    case 'txt': {
      const doc = createDocument(fallbackTitle);
      const html = `<h1>${fallbackTitle}</h1>${plainTextToHtml(rawText)}`;
      return { ...doc, content: html };
    }
  }
};
