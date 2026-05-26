<script setup>
import { computed } from 'vue'

const props = defineProps({
  show: Boolean,
  fileName: String,
  fileContent: String,
  confirmMode: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'confirm', 'cancel'])

const ext = computed(() => props.fileName?.split('.').pop()?.toLowerCase() || '')
const isImage = computed(() => ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp'].includes(ext.value))
const isPdf = computed(() => ext.value === 'pdf')
const isText = computed(() => ['txt', 'csv', 'json', 'xml', 'html', 'css', 'js', 'vue', 'py', 'php', 'md', 'log'].includes(ext.value))

function close() { emit('close') }
function onConfirm() { emit('confirm') }
function onCancel() { emit('cancel') }

function downloadFile() {
  if (!props.fileContent || !props.fileName) return
  const a = document.createElement('a')
  a.href = props.fileContent
  a.download = props.fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

function decodeTextContent(dataURL) {
  if (!dataURL) return ''
  try {
    const base64 = dataURL.split(',')[1]
    const byteString = atob(base64)
    const bytes = new Uint8Array(byteString.length)
    for (let i = 0; i < byteString.length; i++) bytes[i] = byteString.charCodeAt(i)
    return new TextDecoder('utf-8').decode(bytes)
  } catch { return 'Не удалось прочитать содержимое файла.' }
}
</script>
<template>
  <Teleport to="body">
    <div v-if="show" class="preview-overlay" @click.self="close">
      <div class="preview-modal">
        <div class="preview-header">
          <div class="preview-file-info"><span class="preview-icon">{{ isImage ? '🖼️' : isPdf ? '📄' : isText ? '📝' : '📎' }}</span><span class="preview-filename" :title="fileName">{{ fileName }}</span></div>
          <div class="preview-actions">
            <button class="preview-btn" @click="downloadFile" title="Скачать"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></button>
            <button class="preview-btn preview-close" @click="close" title="Закрыть"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
          </div>
        </div>
        <div class="preview-body">
          <div v-if="isImage && fileContent" class="image-container"><img :src="fileContent" :alt="fileName" class="preview-image" /></div>
          <div v-else-if="isPdf && fileContent" class="pdf-container"><embed :src="fileContent" type="application/pdf" class="pdf-embed" /></div>
          <div v-else-if="isText && fileContent" class="text-container"><pre class="text-content">{{ decodeTextContent(fileContent) }}</pre></div>
          <div v-else class="fallback-container"><div class="fallback-icon"><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#4361ee" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></div><h3>Предпросмотр недоступен</h3><p>Для просмотра этого файла скачайте его на устройство</p><button class="download-btn" @click="downloadFile">Скачать файл</button></div>
        </div>
        <div class="preview-footer" :class="{ 'with-actions': confirmMode }">
          <template v-if="confirmMode">
            <button class="action-btn action-cancel" @click="onCancel">Отменить</button>
            <button class="action-btn action-confirm" @click="onConfirm">Добавить файл</button>
          </template>
          <template v-else>
            <span class="footer-size">{{ fileContent ? Math.round((fileContent.length * 3 / 4) / 1024) + ' KB' : '' }}</span>
            <span class="footer-type">{{ ext.toUpperCase() }}</span>
          </template>
        </div>
      </div>
    </div>
  </Teleport>
</template>
<style scoped>
.preview-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px; backdrop-filter: blur(2px); }
.preview-modal { background: white; border-radius: 16px; width: 100%; max-width: 800px; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3); animation: modalIn 0.2s ease; }
@keyframes modalIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
.preview-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid #f0f0f0; flex-shrink: 0; }
.preview-file-info { display: flex; align-items: center; gap: 8px; min-width: 0; }
.preview-icon { font-size: 20px; flex-shrink: 0; }
.preview-filename { font-size: 14px; font-weight: 600; color: #1a1a2e; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.preview-actions { display: flex; gap: 4px; flex-shrink: 0; }
.preview-btn { width: 36px; height: 36px; border: none; border-radius: 8px; background: #f3f4f6; color: #6b7280; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.preview-btn:hover { background: #e5e7eb; color: #374151; }
.preview-close:hover { background: #fee2e2; color: #dc2626; }
.preview-body { flex: 1; overflow: auto; min-height: 300px; display: flex; align-items: center; justify-content: center; background: #f4f6f9; }
.image-container { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 20px; }
.preview-image { max-width: 100%; max-height: 70vh; object-fit: contain; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
.pdf-container { width: 100%; height: 70vh; }
.pdf-embed { width: 100%; height: 100%; border: none; }
.text-container { width: 100%; height: 100%; overflow: auto; }
.text-content { margin: 0; padding: 20px; font-family: Consolas, 'Courier New', monospace; font-size: 13px; line-height: 1.6; color: #1a1a2e; white-space: pre-wrap; word-wrap: break-word; background: white; min-height: 300px; }
.fallback-container { text-align: center; padding: 40px; }
.fallback-icon { margin-bottom: 16px; }
.fallback-container h3 { font-size: 18px; font-weight: 700; color: #1a1a2e; margin: 0 0 8px; }
.fallback-container p { font-size: 14px; color: #6b7280; margin: 0 0 20px; }
.download-btn { background: #4361ee; color: white; border: none; padding: 12px 32px; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
.download-btn:hover { background: #3651d4; }
.preview-footer { display: flex; justify-content: space-between; align-items: center; padding: 12px 20px; border-top: 1px solid #f0f0f0; font-size: 12px; color: #9ca3af; flex-shrink: 0; }
.preview-footer.with-actions { justify-content: flex-end; gap: 8px; padding: 14px 20px; }
.action-btn { padding: 10px 24px; border-radius: 10px; font-size: 14px; font-weight: 600; border: none; cursor: pointer; transition: all 0.2s; }
.action-cancel { background: #e5e7eb; color: #374151; }
.action-cancel:hover { background: #d1d5db; }
.action-confirm { background: #4361ee; color: white; }
.action-confirm:hover { background: #3651d4; }
@media (max-width: 600px) { .preview-modal { max-width: 100%; max-height: 100vh; border-radius: 0; height: 100vh; } .preview-overlay { padding: 0; } }
</style>