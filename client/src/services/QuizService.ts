import {API} from "./api";

const QuizService = {

  async getQuizzesByWeek(weekId: string): Promise<any[]> {
    const response = await API.get(`/quizzes/by-week/${weekId}`);
    return response.data;
  },


  async getQuizById(id: string): Promise<any> {
    const response = await API.get(`/quizzes/${id}`);
    return response.data;
  },


  async submitQuizAttempt(quizId: string, data: any): Promise<any> {




     if (!(data instanceof FormData)) {
       const response = await API.post(`/quizzes/${quizId}/submit`, data);
       return response.data;
     } else {

       const response = await API.post(`/quizzes/${quizId}/submit`, data, {
         headers: {
           "Content-Type": "multipart/form-data",
         },
       });
       return response.data;
     }
  },


  async getMySubmissionForQuiz(quizId: string): Promise<any> {
    const response = await API.get(`/quizzes/${quizId}/my-submission`);
    return response.data;
  },



  async getSubmissionsByQuiz(quizId: string): Promise<any[]> {
    const response = await API.get(`/quizzes/${quizId}/submissions`);
    return response.data;
  },


  async gradeQuizSubmission(submissionId: string, gradeData: any): Promise<any> {

    const response = await API.post(`/quizzes/submissions/${submissionId}/grade`, gradeData);

    return response.data;
  },


   async createQuiz(quizData: any): Promise<any> {
     const response = await API.post('/quizzes', quizData);
     return response.data;
   },

   async updateQuiz(quizId: string, quizData: any): Promise<any> {
     const response = await API.put(`/quizzes/${quizId}`, quizData);
     return response.data;
   },

   async deleteQuiz(quizId: string): Promise<any> {
      const response = await API.delete(`/quizzes/${quizId}`);
      return response.data;
   },

};

export default QuizService;