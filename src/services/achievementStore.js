// Единое хранилище достижений для связки студента и преподавателя
// В реальном приложении здесь было бы API, но для демо используем reactive

const ACHIEVEMENTS_KEY = 'portfolio_achievements'
const FILE_CONTENTS_KEY = 'portfolio_file_contents'

function loadAchievements() {
  try {
    const data = localStorage.getItem(ACHIEVEMENTS_KEY)
    if (data) return JSON.parse(data)
  } catch (e) {}
  return []
}

function saveAchievements(items) {
  localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(items))
}

// ----- Хранилище содержимого файлов (base64) -----

function loadFileContents() {
  try {
    const data = localStorage.getItem(FILE_CONTENTS_KEY)
    if (data) return JSON.parse(data)
  } catch (e) {}
  return {}
}

function saveFileContents(contents) {
  localStorage.setItem(FILE_CONTENTS_KEY, JSON.stringify(contents))
}

// Сохраняет содержимое файла в хранилище
// key формируется как `${achievementId}_${fileName}`
export function saveFileContent(achievementId, fileName, dataURL) {
  const contents = loadFileContents()
  const key = `${achievementId}_${fileName}`
  contents[key] = dataURL
  saveFileContents(contents)
}

// Возвращает содержимое файла по имени файла и ID достижения
export function getFileContent(achievementId, fileName) {
  const contents = loadFileContents()
  const key = `${achievementId}_${fileName}`
  return contents[key] || null
}

// Удаляет содержимое файлов при удалении достижения
function deleteAchievementFiles(achievementId, fileNames) {
  const contents = loadFileContents()
  let changed = false
  for (const fileName of fileNames) {
    const key = `${achievementId}_${fileName}`
    if (contents[key]) {
      delete contents[key]
      changed = true
    }
  }
  if (changed) {
    saveFileContents(contents)
  }
}

// Глобальное состояние
let achievements = loadAchievements()

// Если store пустой — инициализируем начальными данными
if (achievements.length === 0) {
  achievements = getDefaultAchievements()
  saveAchievements(achievements)
}

function getDefaultAchievements() {
  return [
    // Студенческие достижения (для проверки преподавателем)
    {
      id: 101,
      user_id: 1,
      user_name: 'Иванов Александр Петрович',
      user_group: 'ИЕНТБ-511',
      title: 'Диплом за 1 место в олимпиаде по программированию',
      type: 'science',
      category: 'Научная деятельность',
      source: 'manual',
      status: 'pending',
      date: '2026-04-20',
      description: 'Региональная олимпиада по программированию среди студентов вузов Сахалинской области',
      files: ['diplom_olimpiada.pdf'],
      skills: ['Python', 'Алгоритмы'],
      level: 'региональный',
      reviewer_comment: '',
      reviewed_by: null,
      created_at: '2026-04-20T10:00:00.000Z'
    },
    {
      id: 102,
      user_id: 1,
      user_name: 'Иванов Александр Петрович',
      user_group: 'ИЕНТБ-511',
      title: 'Сертификат участника конференции "Молодёжь и наука"',
      type: 'science',
      category: 'Научная деятельность',
      source: 'manual',
      status: 'pending',
      date: '2026-04-15',
      description: 'Доклад на тему "Применение ИИ в образовательном процессе"',
      files: ['certificate_conf.pdf'],
      skills: ['Искусственный интеллект', 'Публичные выступления'],
      level: 'вузовский',
      reviewer_comment: '',
      reviewed_by: null,
      created_at: '2026-04-15T14:30:00.000Z'
    },
    {
      id: 3,
      user_id: 1,
      user_name: 'Иванов Александр Петрович',
      user_group: 'ИЕНТБ-511',
      title: 'Волонтёрская акция "Чистый берег"',
      type: 'social',
      category: 'Внеучебная деятельность',
      source: 'manual',
      status: 'pending',
      date: '2025-10-05',
      description: 'Участие в экологической акции по очистке побережья',
      files: [],
      skills: ['Волонтёрство', 'Экология'],
      level: 'региональный',
      reviewer_comment: '',
      reviewed_by: null,
      created_at: '2025-10-05T09:00:00.000Z'
    },
    {
      id: 4,
      user_id: 1,
      user_name: 'Иванов Александр Петрович',
      user_group: 'ИЕНТБ-511',
      title: 'Курсовая работа по БД',
      type: 'education',
      category: 'Учебная деятельность',
      source: 'moodle',
      status: 'approved',
      date: '2025-09-30',
      description: 'Проектирование БД для интернет-магазина. Оценка: отлично',
      files: [],
      skills: ['SQL', 'Проектирование БД', 'Нормализация'],
      level: 'вузовский',
      reviewer_comment: 'Отличная работа!',
      reviewed_by: 2,
      created_at: '2025-09-30T12:00:00.000Z'
    },
    {
      id: 5,
      user_id: 1,
      user_name: 'Иванов Александр Петрович',
      user_group: 'ИЕНТБ-511',
      title: 'Олимпиада по программированию',
      type: 'science',
      category: 'Научная деятельность',
      source: 'manual',
      status: 'approved',
      date: '2025-05-15',
      description: 'Призовое место в региональной олимпиаде по программированию',
      files: [],
      skills: ['Алгоритмы', 'Структуры данных', 'C++'],
      level: 'региональный',
      reviewer_comment: 'Подтверждено',
      reviewed_by: 2,
      created_at: '2025-05-15T16:00:00.000Z'
    }
  ]
}

// Функция для получения следующего ID
let nextId = achievements.length > 0 ? Math.max(...achievements.map(a => a.id)) + 1 : 200

export function useAchievementStore() {
  function getAll() {
    return [...achievements]
  }

  function getByUserId(userId) {
    return achievements.filter(a => a.user_id === userId)
  }

  function getPending() {
    return achievements.filter(a => a.status === 'pending')
  }

  function getProcessed() {
    return achievements.filter(a => a.status !== 'pending')
  }

  function getById(id) {
    return achievements.find(a => a.id === id)
  }

  // Студент добавляет достижение
  function addAchievement(achievement, userId, userName, userGroup) {
    const newAchievement = {
      ...achievement,
      id: nextId++,
      user_id: userId,
      user_name: userName,
      user_group: userGroup,
      source: achievement.source || 'manual',
      status: 'pending',
      reviewer_comment: '',
      reviewed_by: null,
      created_at: new Date().toISOString(),
      files: achievement.files || []
    }
    achievements.unshift(newAchievement)
    saveAchievements(achievements)
    return newAchievement
  }

  // Преподаватель одобряет
  function approve(id, comment, reviewerId) {
    const achievement = achievements.find(a => a.id === id)
    if (achievement) {
      achievement.status = 'approved'
      achievement.reviewer_comment = comment || 'Подтверждено.'
      achievement.reviewed_by = reviewerId
      saveAchievements(achievements)
      return true
    }
    return false
  }

  // Преподаватель отклоняет
  function reject(id, comment, reviewerId) {
    const achievement = achievements.find(a => a.id === id)
    if (achievement) {
      achievement.status = 'rejected'
      achievement.reviewer_comment = comment || 'Отклонено. Требуются исправления.'
      achievement.reviewed_by = reviewerId
      saveAchievements(achievements)
      return true
    }
    return false
  }

  // Удаление достижения (студент)
  function deleteAchievement(id, userId) {
    const idx = achievements.findIndex(a => a.id === id && a.user_id === userId)
    if (idx !== -1) {
      const achievement = achievements[idx]
      // Удаляем содержимое прикреплённых файлов
      if (achievement.files && achievement.files.length > 0) {
        deleteAchievementFiles(id, achievement.files)
      }
      achievements.splice(idx, 1)
      saveAchievements(achievements)
      return true
    }
    return false
  }

  // Получение количества ожидающих проверки
  function getPendingCount() {
    return achievements.filter(a => a.status === 'pending').length
  }

  // Для совместимости со старыми мок-данными преподавателя
  function getTeacherAchievements() {
    // Достижения преподавателя не в этом store, они статические
    return null
  }

  return {
    getAll,
    getByUserId,
    getPending,
    getProcessed,
    getById,
    addAchievement,
    approve,
    reject,
    deleteAchievement,
    getPendingCount
  }
}