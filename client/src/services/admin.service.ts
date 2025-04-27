
import { API } from "./api";

const AdminService = {

  async getAllUsers(): Promise<any[]> {
    const response = await API.get("/admin/users");
    return response.data;
  },

  async getUserById(id: string): Promise<any> {


    const response = await API.get(`/admin/users/${id}`);
    return response.data;
  },

  async updateUser(id: string, userData: any): Promise<any> {


    const response = await API.put(`/admin/users/${id}`, userData);
    return response.data;
  },

   async updateUserRole(id: string, role: string): Promise<any> {
    const response = await API.put(`/admin/users/${id}/role`, { role });
    return response.data;
  },

  async deleteUser(id: string): Promise<void> {
    await API.delete(`/admin/users/${id}`);
  },

   async createUser(userData: any): Promise<any> {
    const response = await API.post(`/admin/users`, userData);
    return response.data;
  },


  async createCourse(courseData: any): Promise<any> {

    const response = await API.post("/courses", courseData);
    return response.data;
  },

  async updateCourse(id: string, courseData: any): Promise<any> {

    const response = await API.put(`/courses/${id}`, courseData);
    return response.data;
  },

  async deleteCourse(id: string): Promise<void> {

    await API.delete(`/courses/${id}`);
  },

  async getAllCourses(): Promise<any[]> {
    const response = await API.get("/courses/admin/all");
    return response.data;
  },



  async createQuiz(quizData: any): Promise<any> {
    const response = await API.post("/quizzes", quizData);
    return response.data;
  },

  async updateQuiz(id: string, quizData: any): Promise<any> {
    const response = await API.put(`/quizzes/${id}`, quizData);
    return response.data;
  },

  async deleteQuiz(id: string): Promise<void> {
    await API.delete(`/quizzes/${id}`);
  },

   async getQuizzesByWeek(weekId: string): Promise<any[]> {
    const response = await API.get(`/quizzes/by-week/${weekId}`);
    return response.data;
   },


  async getSystemStats(): Promise<any> {

    const response = await API.get("/admin/stats");
    return response.data;
  },

  async generateReport(reportType: string, parameters: any): Promise<any> {

    const response = await API.post("/admin/reports", { type: reportType, parameters });
    return response.data;
  },

  async getReports(): Promise<any[]> {

    const response = await API.get("/admin/reports");
    return response.data;
  },

  async getReportById(id: string): Promise<any> {

    const response = await API.get(`/admin/reports/${id}`);
    return response.data;
  },


  async getSettings(settingType: string): Promise<any> {

    const response = await API.get(`/admin/settings/${settingType}`);
    return response.data;
  },

  async updateSettings(settingType: string, data: any): Promise<any> {

    const response = await API.put(`/admin/settings/${settingType}`, data);
    return response.data;
  },


   async createCohort(cohortData: any): Promise<any> {
    const response = await API.post('/admin/cohorts', cohortData);
    return response.data;
  },

  async getAllCohorts(): Promise<any[]> {
      const response = await API.get('/admin/cohorts');
      return response.data;
  },

  async enrollUserInCohort(cohortId: string, userId: string): Promise<any> {
      const response = await API.post(`/admin/cohorts/${cohortId}/enroll`, { userId });
      return response.data;
  },

};

export default AdminService;