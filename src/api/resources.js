import { api } from './http'
import { pageableQuery, toQueryString } from './query'

export const usersApi = {
  list: (pageable) => api.get(`/api/v1/users${toQueryString(pageableQuery(pageable))}`),
  getById: (id) => api.get(`/api/v1/users/${id}`),
  create: (body) => api.post('/api/v1/users', body),
  update: (id, body) => api.put(`/api/v1/users/${id}`, body),
  remove: (id) => api.del(`/api/v1/users/${id}`),
  search: (name, pageable) =>
    api.get(
      `/api/v1/users/search${toQueryString({ name, ...pageableQuery(pageable) })}`,
    ),
  byRole: (role, pageable) =>
    api.get(`/api/v1/users/role/${encodeURIComponent(role)}${toQueryString(pageableQuery(pageable))}`),
  byEmail: (email) => api.get(`/api/v1/users/email/${encodeURIComponent(email)}`),
}

export const studentsApi = {
  list: (pageable) => api.get(`/api/v1/students${toQueryString(pageableQuery(pageable))}`),
  getById: (id) => api.get(`/api/v1/students/${id}`),
  create: (body) => api.post('/api/v1/students', body),
  update: (id, body) => api.put(`/api/v1/students/${id}`, body),
  remove: (id) => api.del(`/api/v1/students/${id}`),
  byEmail: (email) => api.get(`/api/v1/students/email/${encodeURIComponent(email)}`),
  byEnrollmentDateRange: ({ startDate, endDate, pageable }) =>
    api.get(
      `/api/v1/students/enrollment-date-range${toQueryString({
        startDate,
        endDate,
        ...pageableQuery(pageable),
      })}`,
    ),
}

export const coursesApi = {
  list: (pageable) => api.get(`/api/v1/courses${toQueryString(pageableQuery(pageable))}`),
  getById: (id) => api.get(`/api/v1/courses/${id}`),
  create: (body) => api.post('/api/v1/courses', body),
  update: (id, body) => api.put(`/api/v1/courses/${id}`, body),
  remove: (id) => api.del(`/api/v1/courses/${id}`),
  upcoming: (pageable) => api.get(`/api/v1/courses/upcoming${toQueryString(pageableQuery(pageable))}`),
  searchByTitle: (title, pageable) =>
    api.get(`/api/v1/courses/search${toQueryString({ title, ...pageableQuery(pageable) })}`),
  byLecturer: (lecturerId, pageable) =>
    api.get(
      `/api/v1/courses/lecturer/${lecturerId}${toQueryString(pageableQuery(pageable))}`,
    ),
  byDateRange: ({ startDate, endDate, pageable }) =>
    api.get(
      `/api/v1/courses/date-range${toQueryString({
        startDate,
        endDate,
        ...pageableQuery(pageable),
      })}`,
    ),
  byCredits: (credits, pageable) =>
    api.get(`/api/v1/courses/credits/${credits}${toQueryString(pageableQuery(pageable))}`),
  byCreditsRange: ({ minCredits, maxCredits, pageable }) =>
    api.get(
      `/api/v1/courses/credits-range${toQueryString({
        minCredits,
        maxCredits,
        ...pageableQuery(pageable),
      })}`,
    ),
  byCode: (courseCode) => api.get(`/api/v1/courses/code/${encodeURIComponent(courseCode)}`),
  byMinCapacity: (capacity, pageable) =>
    api.get(`/api/v1/courses/capacity/${capacity}${toQueryString(pageableQuery(pageable))}`),
}

export const enrollmentsApi = {
  list: (pageable) => api.get(`/api/v1/enrollments${toQueryString(pageableQuery(pageable))}`),
  getById: (id) => api.get(`/api/v1/enrollments/${id}`),
  create: (body) => api.post('/api/v1/enrollments', body),
  update: (id, body) => api.put(`/api/v1/enrollments/${id}`, body),
  drop: (id) => api.put(`/api/v1/enrollments/${id}/drop`),
  byStudent: (studentId, pageable) =>
    api.get(
      `/api/v1/enrollments/student/${studentId}${toQueryString(pageableQuery(pageable))}`,
    ),
  byStatus: (status, pageable) =>
    api.get(
      `/api/v1/enrollments/status/${encodeURIComponent(status)}${toQueryString(pageableQuery(pageable))}`,
    ),
  stats: () => api.get('/api/v1/enrollments/stats'),
  byLecturer: (lecturerId, pageable) =>
    api.get(
      `/api/v1/enrollments/lecturer/${lecturerId}${toQueryString(pageableQuery(pageable))}`,
    ),
  byCourse: (courseId, pageable) =>
    api.get(`/api/v1/enrollments/course/${courseId}${toQueryString(pageableQuery(pageable))}`),
}

export const lecturersApi = {
  list: (pageable) => api.get(`/api/v1/lecturers${toQueryString(pageableQuery(pageable))}`),
  getById: (lecturerId) => api.get(`/api/v1/lecturers/${lecturerId}`),
  create: (body) => api.post('/api/v1/lecturers', body),
  students: (lecturerId, pageable) =>
    api.get(
      `/api/v1/lecturers/${lecturerId}/students${toQueryString(pageableQuery(pageable))}`,
    ),
  stats: (lecturerId) => api.get(`/api/v1/lecturers/${lecturerId}/stats`),
  courses: (lecturerId, pageable) =>
    api.get(
      `/api/v1/lecturers/${lecturerId}/courses${toQueryString(pageableQuery(pageable))}`,
    ),
  courseStudents: ({ lecturerId, courseId, pageable }) =>
    api.get(
      `/api/v1/lecturers/${lecturerId}/courses/${courseId}/students${toQueryString(
        pageableQuery(pageable),
      )}`,
    ),
}

export const adminApi = {
  dashboard: () => api.get('/api/v1/admin/dashboard'),
  activeStudents: (pageable) =>
    api.get(`/api/v1/admin/students/active${toQueryString(pageableQuery(pageable))}`),
  enrollmentTrends: ({ startDate, endDate }) =>
    api.get(
      `/api/v1/admin/reports/enrollment-trends${toQueryString({ startDate, endDate })}`,
    ),
  enrollments: (pageable) =>
    api.get(`/api/v1/admin/enrollments${toQueryString(pageableQuery(pageable))}`),
  recentEnrollments: ({ days = 7, pageable }) =>
    api.get(
      `/api/v1/admin/enrollments/recent${toQueryString({ days, ...pageableQuery(pageable) })}`,
    ),
  popularCourses: (pageable) =>
    api.get(`/api/v1/admin/courses/popular${toQueryString(pageableQuery(pageable))}`),
}

export const healthApi = {
  health: () => api.get('/api/v1/health'),
}
