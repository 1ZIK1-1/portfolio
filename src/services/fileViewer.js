// Сервис для просмотра файлов в новой вкладке
// В демо-режиме файлы хранятся как dataURL в localStorage

export function openFilePreview(fileName, fileContent) {
  if (!fileContent) {
    alert(`Файл "${fileName}" не найден.\nВозможно, он был удалён.`)
    return
  }

  const ext = fileName.split('.').pop().toLowerCase()
  const isPdf = ext === 'pdf'
  const isImage = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp'].includes(ext)

  const win = window.open('', '_blank')
  if (!win) {
    alert('Не удалось открыть файл. Разрешите всплывающие окна для этого сайта.')
    return
  }

  if (isPdf) {
    // Для PDF используем встроенный просмотрщик браузера
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${fileName}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Inter', Arial, sans-serif; background: #1a1a2e; }
          .toolbar {
            background: #1a1a2e; color: white; padding: 12px 24px;
            display: flex; align-items: center; justify-content: space-between;
            border-bottom: 1px solid #2a2a4e;
          }
          .toolbar h3 { font-size: 14px; font-weight: 600; }
          .toolbar-actions { display: flex; gap: 8px; align-items: center; }
          .btn-download {
            background: #4361ee; color: white; border: none;
            padding: 8px 20px; border-radius: 8px; cursor: pointer;
            font-size: 13px; font-weight: 600; transition: background 0.2s;
          }
          .btn-download:hover { background: #3651d4; }
          .file-info { font-size: 12px; color: #a0aec0; }
          .viewer-container {
            width: 100vw; height: calc(100vh - 52px);
            display: flex; align-items: center; justify-content: center;
            background: #e5e7eb;
          }
          .viewer-container embed {
            width: 100%; height: 100%;
          }
        </style>
      </head>
      <body>
        <div class="toolbar">
          <h3>📄 ${fileName}</h3>
          <div class="toolbar-actions">
            <span class="file-info">Просмотр PDF</span>
            <button class="btn-download" onclick="document.getElementById('pdfViewer').print()">🖨️ Печать</button>
          </div>
        </div>
        <div class="viewer-container">
          <embed id="pdfViewer" src="${fileContent}" type="application/pdf" />
        </div>
      </body>
      </html>
    `)
  } else if (isImage) {
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${fileName}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Inter', Arial, sans-serif;
            background: #1a1a2e; height: 100vh; display: flex; flex-direction: column;
          }
          .toolbar {
            background: #1a1a2e; color: white; padding: 12px 24px;
            display: flex; align-items: center; justify-content: space-between;
            border-bottom: 1px solid #2a2a4e; flex-shrink: 0;
          }
          .toolbar h3 { font-size: 14px; font-weight: 600; }
          .toolbar-actions { display: flex; gap: 8px; align-items: center; }
          .btn-download {
            background: #4361ee; color: white; border: none;
            padding: 8px 20px; border-radius: 8px; cursor: pointer;
            font-size: 13px; font-weight: 600; transition: background 0.2s;
          }
          .btn-download:hover { background: #3651d4; }
          .file-info { font-size: 12px; color: #a0aec0; }
          .viewer-container {
            flex: 1; display: flex; align-items: center; justify-content: center;
            background: #e5e7eb; padding: 20px; overflow: auto;
          }
          .viewer-container img {
            max-width: 100%; max-height: 100%;
            object-fit: contain; border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          }
        </style>
      </head>
      <body>
        <div class="toolbar">
          <h3>🖼️ ${fileName}</h3>
          <div class="toolbar-actions">
            <span class="file-info">Изображение</span>
            <button class="btn-download" onclick="window.print()">🖨️ Печать</button>
          </div>
        </div>
        <div class="viewer-container">
          <img src="${fileContent}" alt="${fileName}" />
        </div>
      </body>
      </html>
    `)
  } else {
    // Текстовые файлы и остальные — показываем как есть или предлагаем скачать
    const isText = ['txt', 'csv', 'json', 'xml', 'html', 'css', 'js', 'vue', 'py', 'php', 'md', 'log'].includes(ext)

    if (isText) {
      // Декодируем base64 в текст
      let textContent = ''
      try {
        const byteString = atob(fileContent.split(',')[1])
        textContent = new TextDecoder('utf-8').decode(
          Uint8Array.from(byteString, c => c.charCodeAt(0))
        )
      } catch {
        textContent = 'Не удалось прочитать содержимое файла.'
      }

      win.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${fileName}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Inter', Arial, sans-serif;
              background: #1a1a2e; height: 100vh; display: flex; flex-direction: column;
            }
            .toolbar {
              background: #1a1a2e; color: white; padding: 12px 24px;
              display: flex; align-items: center; justify-content: space-between;
              border-bottom: 1px solid #2a2a4e; flex-shrink: 0;
            }
            .toolbar h3 { font-size: 14px; font-weight: 600; }
            .toolbar-actions { display: flex; gap: 8px; align-items: center; }
            .btn-download {
              background: #4361ee; color: white; border: none;
              padding: 8px 20px; border-radius: 8px; cursor: pointer;
              font-size: 13px; font-weight: 600; transition: background 0.2s;
            }
            .btn-download:hover { background: #3651d4; }
            .file-info { font-size: 12px; color: #a0aec0; }
            .viewer-container {
              flex: 1; overflow: auto; background: #1e1e2e;
            }
            pre {
              padding: 24px; margin: 0; font-family: 'Consolas', 'Courier New', monospace;
              font-size: 13px; line-height: 1.6; color: #cdd6f4;
              white-space: pre-wrap; word-wrap: break-word;
            }
          </style>
        </head>
        <body>
          <div class="toolbar">
            <h3>📄 ${fileName}</h3>
            <div class="toolbar-actions">
              <span class="file-info">Текстовый файл</span>
              <button class="btn-download" onclick="window.print()">🖨️ Печать</button>
            </div>
          </div>
          <div class="viewer-container">
            <pre>${escapeHtml(textContent)}</pre>
          </div>
        </body>
        </html>
      `)
    } else {
      // Для бинарных файлов (doc, docx, xls и др.) — предлагаем скачать
      win.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${fileName}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Inter', Arial, sans-serif;
              background: #1a1a2e; height: 100vh; display: flex; flex-direction: column;
              align-items: center; justify-content: center; color: white;
            }
            .message { text-align: center; padding: 40px; }
            .message svg { margin-bottom: 16px; }
            .message h2 { font-size: 20px; margin: 0 0 8px; }
            .message p { color: #a0aec0; margin: 0 0 20px; font-size: 14px; }
            .btn-download {
              background: #4361ee; color: white; border: none;
              padding: 12px 32px; border-radius: 10px; cursor: pointer;
              font-size: 15px; font-weight: 600; transition: background 0.2s;
              display: inline-flex; align-items: center; gap: 8px;
            }
            .btn-download:hover { background: #3651d4; }
          </style>
        </head>
        <body>
          <div class="message">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#4361ee" stroke-width="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            <h2>${fileName}</h2>
            <p>Для просмотра этого файла требуется скачать его на устройство</p>
            <button class="btn-download" onclick="downloadFile()">
              ⬇️ Скачать файл
            </button>
          </div>
          <script>
            function downloadFile() {
              const a = document.createElement('a')
              a.href = '${fileContent}'
              a.download = '${fileName}'
              document.body.appendChild(a)
              a.click()
              document.body.removeChild(a)
            }
          <\/script>
        </body>
        </html>
      `)
    }
  }
  win.document.close()
  win.document.title = fileName
}

function escapeHtml(str) {
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}

// Функция для чтения файла как DataURL (используется студентом при загрузке)
export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Ошибка чтения файла'))
    reader.readAsDataURL(file)
  })
}