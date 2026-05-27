<script setup>
import { computed } from 'vue'
import { getFileContent } from '@/services/achievementStore'

const props = defineProps({
  fileName: String,
  fileData: String,    // dataURL байты файла
  achievementId: [Number, String], // для поиска в хранилище
  removable: Boolean,
  clickable: { type: Boolean, default: true }
})

const emit = defineEmits(['remove', 'open'])

const ext = computed(() => props.fileName?.split('.').pop()?.toLowerCase() || '')

const isImage = computed(() => ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp'].includes(ext.value))
const isPdf = computed(() => ext.value === 'pdf')
const isText = computed(() => ['txt', 'csv', 'json', 'xml', 'html', 'css', 'js', 'vue', 'py', 'php', 'md', 'log'].includes(ext.value))
const isOffice = computed(() => ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext.value))

const resolvedContent = computed(() => {
  if (props.fileData) return props.fileData
  if (props.achievementId && props.fileName) {
    try {
      return getFileContent(props.achievementId, props.fileName)
    } catch { return null }
  }
  return null
})

const thumbnailUrl = computed(() => {
  // Сначала ищем сохранённую миниатюру (например, для PDF)
  if (props.achievementId && props.fileName) {
    try {
      const thumb = getFileContent(props.achievementId, props.fileName + '_thumb')
      if (thumb) return thumb
    } catch {}
  }
  // Для изображений используем сам файл
  if (resolvedContent.value && isImage.value) return resolvedContent.value
  return null
})

const fileSize = computed(() => {
  if (!props.fileData) return ''
  const bytes = (props.fileData.length * 3) / 4
  if (bytes < 1024) return Math.round(bytes) + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
})

const fileIcon = computed(() => {
  if (isPdf.value) return '📄'
  if (isImage.value) return '🖼️'
  if (isText.value) return '📝'
  if (isOffice.value) return '📋'
  return '📎'
})

function handleClick() {
  if (!props.clickable) return
  // Пытаемся получить содержимое и открыть
  let content = props.fileData
  if (!content && props.achievementId) {
    content = getFileContent(props.achievementId, props.fileName)
  }
  emit('open', { fileName: props.fileName, content })
}

function handleRemove() {
  emit('remove', props.fileName)
}

const cardStyle = computed(() => ({
  cursor: props.clickable ? 'pointer' : 'default'
}))
</script>

<template>
  <div class="file-card" :style="cardStyle" :class="{ removable }" @click="handleClick">
    <!-- Thumbnail / Icon area -->
    <div class="file-thumb-area">
      <div class="file-thumb">
        <img v-if="thumbnailUrl" :src="thumbnailUrl" :alt="fileName" class="thumb-img" />
        <div v-else class="file-icon">{{ fileIcon }}</div>
      </div>
      <div v-if="isPdf" class="format-badge pdf">PDF</div>
      <div v-else-if="isOffice" class="format-badge" :class="{ doc: ext.value.startsWith('doc'), xls: ext.value.startsWith('xls'), ppt: ext.value.startsWith('ppt') }">{{ ext.toUpperCase() }}</div>
      <div v-else-if="isText" class="format-badge text">TXT</div>
    </div>

    <!-- File info -->
    <div class="file-info">
      <div class="file-name" :title="fileName">{{ fileName }}</div>
      <div class="file-meta">
        <span class="file-type">{{ ext.toUpperCase() }}</span>
        <span v-if="fileSize" class="file-size">{{ fileSize }}</span>
      </div>
    </div>

    <!-- Remove button -->
    <button v-if="removable" class="file-remove-btn" @click.stop="handleRemove" title="Удалить файл">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  </div>
</template>

<style scoped>
.file-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: #f9fafb;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  transition: all 0.2s;
  position: relative;
  min-width: 0;
}

.file-card:hover {
  border-color: #4361ee;
  background: #f0f4ff;
  box-shadow: 0 2px 8px rgba(67, 97, 238, 0.12);
}

.file-card.removable:hover {
  padding-right: 36px;
}

.file-thumb-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}

.file-thumb {
  width: 42px;
  height: 42px;
  border-radius: 8px;
  overflow: hidden;
  background: #eef0ff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-icon {
  font-size: 20px;
}

.format-badge {
  font-size: 8px;
  font-weight: 700;
  color: white;
  padding: 1px 5px;
  border-radius: 3px;
  letter-spacing: 0.3px;
  line-height: 1.2;
}
.format-badge.pdf { background: rgba(239, 68, 68, 0.85); }
.format-badge.doc { background: rgba(37, 99, 235, 0.85); }
.format-badge.xls { background: rgba(22, 163, 74, 0.85); }
.format-badge.ppt { background: rgba(234, 88, 12, 0.85); }
.format-badge.text { background: rgba(107, 114, 128, 0.85); }

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a2e;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-meta {
  display: flex;
  gap: 6px;
  font-size: 11px;
  color: #9ca3af;
  margin-top: 1px;
}

.file-type {
  font-weight: 600;
  color: #6b7280;
}

.file-remove-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: none;
  background: #fee2e2;
  color: #dc2626;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.file-card.removable:hover .file-remove-btn {
  opacity: 1;
}

.file-remove-btn:hover {
  background: #fecaca;
}
</style>