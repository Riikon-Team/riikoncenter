'use client'

import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { convertMarkdownToReactNode } from 'simple-customize-markdown-converter/react'
import { Download } from 'lucide-react'
// @ts-ignore - moduleResolution issue with pnpm

import * as prettier from 'prettier/standalone'
import * as htmlPlugin from 'prettier/plugins/html'

export default function MarkdownConverterPage() {
  const { t } = useTranslation()
  const [input, setInput] = useState('# Hello World\n\nThis is a simple markdown converter tool.')
  const [htmlOutput, setHtmlOutput] = useState<React.ReactNode | null>(null)
  const [viewMode, setViewMode] = useState<'preview' | 'raw'>('preview')

  useEffect(() => {
    try {
      setHtmlOutput(convertMarkdownToReactNode(input))
    } catch (e) {
      console.error(e)
    }
  }, [input])

  const handleDownloadHtml = async () => {
    try {
      const { convertMarkdownToHTML } = await import('simple-customize-markdown-converter');
      const html = convertMarkdownToHTML(input);
      let finalHtml = html;
      try {
        finalHtml = await prettier.format(html, {
          parser: 'html',
          plugins: [htmlPlugin],
          htmlWhitespaceSensitivity: 'ignore'
        });
      } catch (e) {
        console.error('Format failed before download:', e);
      }
      
      const blob = new Blob([finalHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'converted.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Download failed:', e);
    }
  }

  return (
    <div className="w-full h-full p-8 max-w-7xl mx-auto flex flex-col gap-6 text-text-primary">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-display font-bold text-accent-cyan">{t('apps.markdown-converter.title')}</h1>
        <p className="text-text-secondary">
          {t('apps.markdown-converter.subtitle')} <span className="text-accent-teal font-medium">simple-customize-markdown-converter</span>
        </p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
        <div className="flex flex-col gap-2 h-full">
          <label className="text-sm font-medium text-text-muted uppercase tracking-wider">{t('apps.markdown-converter.input_label')}</label>
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 resize-none font-mono text-sm bg-background border border-border focus:border-cyan-500 p-4 h-full outline-none rounded-xl"
            placeholder={t('apps.markdown-converter.input_placeholder')}
          />
        </div>
        
        <div className="flex flex-col gap-2 h-full">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-text-muted uppercase tracking-wider">{t('apps.markdown-converter.output_label')}</label>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleDownloadHtml}
                className="text-xs font-semibold text-accent-cyan hover:text-cyan-400 flex items-center gap-1.5 transition-colors"
                title={t('apps.markdown-converter.download_html', 'Download HTML file')}
              >
                <Download className="w-3.5 h-3.5" />
                {t('apps.markdown-converter.download_btn', 'Download')}
              </button>
              <div className="flex bg-bg-surface border border-border-default rounded-md overflow-hidden">
                <button 
                  onClick={() => setViewMode('preview')}
                  className={`px-3 py-1 text-xs font-semibold ${viewMode === 'preview' ? 'bg-accent-cyan text-white' : 'text-text-muted hover:bg-bg-subtle'}`}
                >
                  {t('apps.markdown-converter.preview_btn')}
                </button>
                <button 
                  onClick={() => setViewMode('raw')}
                  className={`px-3 py-1 text-xs font-semibold ${viewMode === 'raw' ? 'bg-accent-cyan text-white' : 'text-text-muted hover:bg-bg-subtle'}`}
                >
                  {t('apps.markdown-converter.raw_btn')}
                </button>
              </div>
            </div>
          </div>
          <div className="flex-1 bg-bg-surface border border-border-default rounded-md p-6 overflow-y-auto max-w-none h-[calc(100vh-250px)]">
            {viewMode === 'preview' ? (
              <div className="prose prose-invert">
                {htmlOutput}
              </div>
            ) : (
              <pre className="font-mono text-xs text-text-secondary whitespace-pre-wrap break-all">
                <RawHtmlViewer input={input} />
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function RawHtmlViewer({ input }: { input: string }) {
  const [rawHtml, setRawHtml] = useState('')
  
  useEffect(() => {
    let isMounted = true;
    import('simple-customize-markdown-converter').then(({ convertMarkdownToHTML }) => {
      const converted = convertMarkdownToHTML(input)
      
      prettier.format(converted, {
        parser: 'html',
        plugins: [htmlPlugin],
        htmlWhitespaceSensitivity: 'ignore'
      }).then(formatted => {
        if (isMounted) setRawHtml(formatted)
      }).catch(e => {
        console.error('Format failed:', e)
        if (isMounted) setRawHtml(converted)
      })
    })
    
    return () => { isMounted = false; }
  }, [input])

  return <>{rawHtml}</>
}
