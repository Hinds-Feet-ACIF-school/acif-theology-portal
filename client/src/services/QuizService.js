import { API } from "./api.js";
const QuizService = {
    async getQuizzesByWeek(weekId) {
        const response = await API.get(`/quizzes/by-week/${weekId}`);
        return response.data;
    },
    async getQuizById(id) {
        const response = await API.get(`/quizzes/${id}`);
        return response.data;
    },
    async submitQuizAttempt(quizId, data) {
        if (!(data instanceof FormData)) {
            const response = await API.post(`/quizzes/${quizId}/submit`, data);
            return response.data;
        }
        else {
            const response = await API.post(`/quizzes/${quizId}/submit`, data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        }
    },
    async getMySubmissionForQuiz(quizId) {
        const response = await API.get(`/quizzes/${quizId}/my-submission`);
        return response.data;
    },
    async getSubmissionsByQuiz(quizId) {
        const response = await API.get(`/quizzes/${quizId}/submissions`);
        return response.data;
    },
    async gradeQuizSubmission(submissionId, gradeData) {
        const response = await API.post(`/quizzes/submissions/${submissionId}/grade`, gradeData);
        return response.data;
    },
    async createQuiz(quizData) {
        const response = await API.post('/quizzes', quizData);
        return response.data;
    },
    async updateQuiz(quizId, quizData) {
        const response = await API.put(`/quizzes/${quizId}`, quizData);
        return response.data;
    },
    async deleteQuiz(quizId) {
        const response = await API.delete(`/quizzes/${quizId}`);
        return response.data;
    },
};
export default QuizService;
