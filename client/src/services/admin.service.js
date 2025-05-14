import { API } from "./api";
const AdminService = {
    async getAllUsers() {
        const response = await API.get("/admin/users");
        return response.data;
    },
    async getUserById(id) {
        const response = await API.get(`/admin/users/${id}`);
        return response.data;
    },
    async updateUser(id, userData) {
        const response = await API.put(`/admin/users/${id}`, userData);
        return response.data;
    },
    async updateUserRole(id, role) {
        const response = await API.put(`/admin/users/${id}/role`, { role });
        return response.data;
    },
    async deleteUser(id) {
        await API.delete(`/admin/users/${id}`);
    },
    async createUser(userData) {
        const response = await API.post(`/admin/users`, userData);
        return response.data;
    },
    async createCourse(courseData) {
        const response = await API.post("/courses", courseData);
        return response.data;
    },
    async updateCourse(id, courseData) {
        const response = await API.put(`/courses/${id}`, courseData);
        return response.data;
    },
    async deleteCourse(id) {
        await API.delete(`/courses/${id}`);
    },
    async getAllCourses() {
        const response = await API.get("/courses/admin/all");
        return response.data;
    },
    async createQuiz(quizData) {
        const response = await API.post("/quizzes", quizData);
        return response.data;
    },
    async updateQuiz(id, quizData) {
        const response = await API.put(`/quizzes/${id}`, quizData);
        return response.data;
    },
    async deleteQuiz(id) {
        await API.delete(`/quizzes/${id}`);
    },
    async getQuizzesByWeek(weekId) {
        const response = await API.get(`/quizzes/by-week/${weekId}`);
        return response.data;
    },
    async getSystemStats() {
        const response = await API.get("/admin/stats");
        return response.data;
    },
    async generateReport(reportType, parameters) {
        const response = await API.post("/admin/reports", { type: reportType, parameters });
        return response.data;
    },
    async getReports() {
        const response = await API.get("/admin/reports");
        return response.data;
    },
    async getReportById(id) {
        const response = await API.get(`/admin/reports/${id}`);
        return response.data;
    },
    async getSettings(settingType) {
        const response = await API.get(`/admin/settings/${settingType}`);
        return response.data;
    },
    async updateSettings(settingType, data) {
        const response = await API.put(`/admin/settings/${settingType}`, data);
        return response.data;
    },
    async createCohort(cohortData) {
        const response = await API.post('/admin/cohorts', cohortData);
        return response.data;
    },
    async getAllCohorts() {
        const response = await API.get('/admin/cohorts');
        return response.data;
    },
    async enrollUserInCohort(cohortId, userId) {
        const response = await API.post(`/admin/cohorts/${cohortId}/enroll`, { userId });
        return response.data;
    },
};
export default AdminService;
