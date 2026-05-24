import { reactive } from 'vue'

const storedUser = JSON.parse(localStorage.getItem('portfolio_user') || 'null')

const state = reactive({
  user: storedUser,
  isAuthenticated: !!storedUser
})

export function useAuth() {
  function login(userData) {
    state.user = userData
    state.isAuthenticated = true
    localStorage.setItem('portfolio_user', JSON.stringify(userData))
  }

  function logout() {
    state.user = null
    state.isAuthenticated = false
    localStorage.removeItem('portfolio_user')
  }

  function updateProfile(data) {
    if (state.user) {
      state.user = { ...state.user, ...data }
      localStorage.setItem('portfolio_user', JSON.stringify(state.user))
    }
  }

  function updateAvatar(dataURL) {
    if (state.user) {
      state.user.avatar = dataURL
      localStorage.setItem('portfolio_user', JSON.stringify(state.user))
    }
  }

  return {
    state,
    login,
    logout,
    updateProfile,
    updateAvatar
  }
}

// Mock data for demo mode - Admin
export const MOCK_USER_ADMIN = {
  id: 3,
  email: 'admin@sakhgu.ru',
  name: 'Соколов Дмитрий Викторович',
  role: 'admin',
  institute: 'Административное управление',
  department: 'Отдел информационных технологий',
  position: 'Системный администратор ЭИОС',
  group: '',
  avatar: null,
  bio: 'Администратор электронной информационной образовательной среды СахГУ',
  phone: '+7 (4242) 77-55-01',
  telegram: '@dv_sokolov',
  token: 'mock_token_admin'
}

// Mock users list for admin panel
export const MOCK_ALL_USERS = [
  { id: 1, email: 'student@sakhgu.ru', name: 'Иванов Александр Петрович', role: 'student', institute: 'ИЕНТБ', group: 'ИЕНТБ-511', status: 'active', achievements_count: 12, created_at: '2025-09-01', last_active: '2026-05-20' },
  { id: 2, email: 'teacher@sakhgu.ru', name: 'Петрова Елена Владимировна', role: 'teacher', institute: 'ИЕНТБ', department: 'Кафедра ИТ', status: 'active', achievements_count: 28, created_at: '2024-01-15', last_active: '2026-05-22' },
  { id: 3, email: 'admin@sakhgu.ru', name: 'Соколов Дмитрий Викторович', role: 'admin', institute: 'Управление', department: 'ОИТ', status: 'active', achievements_count: 0, created_at: '2023-06-01', last_active: '2026-05-22' },
  { id: 4, email: 'sidirov@sakhgu.ru', name: 'Сидоров Дмитрий Алексеевич', role: 'student', institute: 'ИЕНТБ', group: 'ИЕНТБ-421', status: 'active', achievements_count: 5, created_at: '2025-09-01', last_active: '2026-05-18' },
  { id: 5, email: 'kuznetsova@sakhgu.ru', name: 'Кузнецова Анна Сергеевна', role: 'student', institute: 'ИЕНТБ', group: 'ИЕНТБ-421', status: 'active', achievements_count: 8, created_at: '2025-09-01', last_active: '2026-05-21' },
  { id: 6, email: 'mihaylov@sakhgu.ru', name: 'Михайлов Павел Андреевич', role: 'student', institute: 'ИЕНТБ', group: 'ИЕНТБ-421', status: 'disabled', achievements_count: 3, created_at: '2025-09-01', last_active: '2026-04-10' },
  { id: 7, email: 'ivanova@edu.ru', name: 'Иванова Мария Петровна', role: 'teacher', institute: 'ИЕНТБ', department: 'Кафедра математики', status: 'active', achievements_count: 15, created_at: '2024-03-01', last_active: '2026-05-20' }
]

// Mock data for demo mode - Student
export const MOCK_USER_STUDENT = {
  id: 1,
  email: 'student@sakhgu.ru',
  name: 'Иванов Александр Петрович',
  role: 'student',
  institute: 'Институт естественных наук и техносферной безопасности',
  group: 'ИЕНТБ-511',
  department: '',
  position: '',
  avatar: null,
  bio: 'Студент 5 курса, направление "Прикладная информатика"',
  token: 'mock_token_student'
}

// Mock data for demo mode - Teacher
export const MOCK_USER_TEACHER = {
  id: 2,
  email: 'teacher@sakhgu.ru',
  name: 'Петрова Елена Владимировна',
  role: 'teacher',
  institute: 'Институт естественных наук и техносферной безопасности',
  department: 'Кафедра информационных технологий',
  position: 'Доцент, кандидат технических наук',
  group: '',
  avatar: null,
  bio: 'Преподаватель с 15-летним стажем, читаю курсы по базам данных и программированию',
  phone: '+7 (4242) 77-55-33',
  telegram: '@ev_petrova',
  token: 'mock_token_teacher'
}

// Student achievements (for teacher verification)
export const MOCK_STUDENT_ACHIEVEMENTS = [
  {
    id: 101,
    user_id: 3,
    user_name: 'Сидоров Дмитрий Алексеевич',
    user_group: 'ИЕНТБ-421',
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
    reviewer_comment: ''
  },
  {
    id: 102,
    user_id: 4,
    user_name: 'Кузнецова Анна Сергеевна',
    user_group: 'ИЕНТБ-421',
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
    reviewer_comment: ''
  },
  {
    id: 103,
    user_id: 5,
    user_name: 'Михайлов Павел Андреевич',
    user_group: 'ИЕНТБ-421',
    title: 'Грамота за волонтёрскую деятельность',
    type: 'social',
    category: 'Внеучебная деятельность',
    source: 'manual',
    status: 'pending',
    date: '2026-04-10',
    description: 'Экологическая акция "Чистый остров" — очистка побережья',
    files: ['gramota_volonter.pdf'],
    skills: ['Волонтёрство', 'Экология'],
    level: 'региональный',
    reviewer_comment: ''
  },
  {
    id: 104,
    user_id: 3,
    user_name: 'Сидоров Дмитрий Алексеевич',
    user_group: 'ИЕНТБ-421',
    title: 'Курсовая работа по БД',
    type: 'education',
    category: 'Учебная деятельность',
    source: 'moodle',
    status: 'pending',
    date: '2026-03-30',
    description: 'Проектирование реляционной БД для интернет-магазина. Оценка: отлично',
    files: [],
    skills: ['SQL', 'Проектирование БД'],
    level: 'вузовский',
    reviewer_comment: ''
  },
  {
    id: 105,
    user_id: 4,
    user_name: 'Кузнецова Анна Сергеевна',
    user_group: 'ИЕНТБ-421',
    title: 'Участие в хакатоне "Digital Sakhalin"',
    type: 'science',
    category: 'Научная деятельность',
    source: 'manual',
    status: 'approved',
    date: '2026-03-15',
    description: 'Разработка мобильного приложения для туризма. Команда заняла 3 место',
    files: [],
    skills: ['Mobile Dev', 'UX/UI', 'Командная работа'],
    level: 'региональный',
    reviewer_comment: 'Отличная работа! Подтверждаю.'
  },
  {
    id: 106,
    user_id: 5,
    user_name: 'Михайлов Павел Андреевич',
    user_group: 'ИЕНТБ-421',
    title: 'Сертификат Stepik "Python для Data Science"',
    type: 'education',
    category: 'Дополнительное образование',
    source: 'manual',
    status: 'rejected',
    date: '2026-02-28',
    description: 'Сертификат о прохождении онлайн-курса',
    files: [],
    skills: ['Python', 'Data Science'],
    level: 'всероссийский',
    reviewer_comment: 'Сертификат не прикреплён. Пожалуйста, загрузите файл.'
  }
]

// Teacher's own achievements (for attestation)
export const MOCK_TEACHER_ACHIEVEMENTS = [
  {
    id: 201,
    title: 'Отчёт по успеваемости студентов за 2025-2026 уч.год',
    type: 'education',
    category: 'Результативность учебной деятельности',
    source: 'moodle',
    status: 'approved',
    date: '2026-01-15',
    description: 'Распределение оценок по дисциплинам: отлично — 35%, хорошо — 42%, удовлетворительно — 20%, неудовлетворительно — 3%',
    files: [],
    skills: ['Анализ данных', 'Успеваемость'],
    level: 'вузовский'
  },
  {
    id: 202,
    title: 'Результаты ВПР по дисциплине "Базы данных"',
    type: 'education',
    category: 'Результативность учебной деятельности',
    source: 'manual',
    status: 'approved',
    date: '2026-03-01',
    description: 'Сопоставительный анализ результатов ВПР с текущей успеваемостью. Подтверждение объективности оценивания.',
    files: [],
    skills: ['ВПР', 'Мониторинг качества'],
    level: 'вузовский'
  },
  {
    id: 203,
    title: 'Подготовка победителя олимпиады по программированию',
    type: 'science',
    category: 'Развитие способностей обучающихся',
    source: 'manual',
    status: 'approved',
    date: '2026-04-20',
    description: 'Студент Сидоров Д.А. — 1 место в региональной олимпиаде по программированию',
    files: [],
    skills: ['Наставничество', 'Олимпиадное программирование'],
    level: 'региональный'
  },
  {
    id: 204,
    title: 'Выступление на конференции "Цифровые технологии в образовании"',
    type: 'science',
    category: 'Личный вклад',
    source: 'manual',
    status: 'approved',
    date: '2026-02-10',
    description: 'Доклад "Использование Vue.js в электронной образовательной среде". Всероссийская научно-практическая конференция, г. Москва',
    files: ['program_conf.pdf'],
    skills: ['Публичные выступления', 'Vue.js', 'ЭИОС'],
    level: 'всероссийский'
  },
  {
    id: 205,
    title: 'Публикация в журнале "Современные информационные технологии"',
    type: 'science',
    category: 'Личный вклад',
    source: 'manual',
    status: 'approved',
    date: '2025-12-15',
    description: 'Статья "Методика оценки компетенций в цифровой образовательной среде" в соавторстве. ISSN 2411-1473, №4, с. 45-52',
    files: ['article_2025.pdf'],
    skills: ['Научные публикации', 'Методика преподавания'],
    level: 'всероссийский'
  },
  {
    id: 206,
    title: 'Благодарственное письмо от Министерства образования Сахалинской области',
    type: 'social',
    category: 'Общественное признание',
    source: 'manual',
    status: 'approved',
    date: '2025-11-20',
    description: 'За многолетний добросовестный труд и высокие результаты в профессиональной деятельности',
    files: ['blagodarnost.pdf'],
    skills: ['Профессионализм'],
    level: 'региональный'
  },
  {
    id: 207,
    title: 'Повышение квалификации "Современные образовательные технологии"',
    type: 'education',
    category: 'Дополнительное образование',
    source: 'manual',
    status: 'approved',
    date: '2025-10-01',
    description: 'Удостоверение о повышении квалификации, 72 часа, ФГБОУ ВО "СахГУ"',
    files: ['udostoverenie.pdf'],
    skills: ['Педагогика', 'Образовательные технологии'],
    level: 'вузовский'
  },
  {
    id: 208,
    title: 'Участие в методическом объединении кафедры ИТ',
    type: 'social',
    category: 'Профессиональное сообщество',
    source: 'manual',
    status: 'approved',
    date: '2025-09-15',
    description: 'Руководитель секции "Программная инженерия" методического объединения',
    files: [],
    skills: ['Методическая работа', 'Руководство'],
    level: 'вузовский'
  },
  {
    id: 209,
    title: 'Нагрузка ЦДО (Центр дистанционного обучения)',
    type: 'education',
    category: 'Работа в ЦДО',
    source: 'cdo',
    status: 'approved',
    date: '2026-04-01',
    description: 'Разработка и сопровождение 3 электронных курсов в Moodle. Общее количество часов — 144',
    files: [],
    skills: ['Moodle', 'Дистанционное обучение'],
    level: 'вузовский'
  },
  {
    id: 210,
    title: 'Курс "Python для Data Science"',
    type: 'education',
    category: 'Дополнительное образование',
    source: 'manual',
    status: 'pending',
    date: '2026-05-01',
    description: 'Сертификат о прохождении курса на платформе Stepik',
    files: [],
    skills: ['Python', 'Data Science'],
    level: 'всероссийский'
  }
]

export const MOCK_ACHIEVEMENTS = [
  {
    id: 1,
    title: 'Участие в конференции "Молодёжь и наука"',
    type: 'science',
    category: 'Научная деятельность',
    source: 'manual',
    status: 'approved',
    date: '2025-12-15',
    description: 'Доклад на тему "Применение нейросетей в образовании"',
    files: [],
    skills: ['Публичные выступления', 'Научные исследования', 'Нейросети'],
    level: 'вузовский'
  },
  {
    id: 2,
    title: 'Курс "Python для Data Science"',
    type: 'education',
    category: 'Дополнительное образование',
    source: 'manual',
    status: 'approved',
    date: '2025-11-20',
    description: 'Сертификат о прохождении курса на платформе Stepik',
    files: [],
    skills: ['Python', 'Data Science', 'Анализ данных'],
    level: 'всероссийский'
  },
  {
    id: 3,
    title: 'Волонтёрская акция "Чистый берег"',
    type: 'social',
    category: 'Внеучебная деятельность',
    source: 'manual',
    status: 'pending',
    date: '2025-10-05',
    description: 'Участие в экологической акции по очистке побережья',
    files: [],
    skills: ['Волонтёрство', 'Экология'],
    level: 'региональный'
  },
  {
    id: 4,
    title: 'Курсовая работа по БД',
    type: 'education',
    category: 'Учебная деятельность',
    source: 'moodle',
    status: 'approved',
    date: '2025-09-30',
    description: 'Проектирование БД для интернет-магазина. Оценка: отлично',
    files: [],
    skills: ['SQL', 'Проектирование БД', 'Нормализация'],
    level: 'вузовский'
  },
  {
    id: 5,
    title: 'Олимпиада по программированию',
    type: 'science',
    category: 'Научная деятельность',
    source: 'manual',
    status: 'approved',
    date: '2025-05-15',
    description: 'Призовое место в региональной олимпиаде по программированию',
    files: [],
    skills: ['Алгоритмы', 'Структуры данных', 'C++'],
    level: 'региональный'
  }
]

export const MOCK_PORTFOLIOS = [
  {
    id: 1,
    title: 'Моё портфолио для трудоустройства',
    template: 'cv',
    description: 'Портфолио для потенциальных работодателей',
    access_level: 'public',
    created_at: '2025-12-20',
    items: [
      { id: 1, achievement_id: 1, section: 'Образование', display_order: 0 },
      { id: 2, achievement_id: 5, section: 'Достижения', display_order: 0 },
      { id: 3, achievement_id: 2, section: 'Курсы', display_order: 0 }
    ]
  }
]

export const MOCK_TEACHER_PORTFOLIOS = [
  {
    id: 10,
    title: 'Портфолио для аттестации на высшую категорию',
    template: 'academic',
    description: 'Достижения за 2021-2026 гг. для подачи на высшую квалификационную категорию',
    access_level: 'private',
    created_at: '2026-04-01',
    items: [
      { id: 1, achievement_id: 201, section: 'Результативность учебной деятельности', display_order: 0 },
      { id: 2, achievement_id: 202, section: 'Результативность учебной деятельности', display_order: 1 },
      { id: 3, achievement_id: 203, section: 'Развитие способностей обучающихся', display_order: 0 },
      { id: 4, achievement_id: 204, section: 'Личный вклад', display_order: 0 },
      { id: 5, achievement_id: 205, section: 'Личный вклад', display_order: 1 },
      { id: 6, achievement_id: 206, section: 'Личный вклад', display_order: 2 }
    ]
  },
  {
    id: 11,
    title: 'Портфолио для публичного представления',
    template: 'cv',
    description: 'Основные достижения для коллег и руководства',
    access_level: 'link',
    created_at: '2026-03-15',
    items: [
      { id: 7, achievement_id: 204, section: 'Конференции', display_order: 0 },
      { id: 8, achievement_id: 205, section: 'Публикации', display_order: 0 },
      { id: 9, achievement_id: 207, section: 'Образование', display_order: 0 }
    ]
  }
]