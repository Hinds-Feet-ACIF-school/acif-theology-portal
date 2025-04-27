// import API from "./api"

// const AssignmentService = {
//   async getAssignmentsByCourse(courseId: string): Promise<any[]> {
//     const response = await API.get(`/assignments/course/${courseId}`)
//     return response.data
//   },

//   async getAssignmentById(id: string): Promise<any> {
//     const response = await API.get(`/assignments/${id}`)
//     return response.data
//   },

//   async submitAssignment(assignmentId: string, data: any): Promise<any> {
//     const formData = new FormData()

//     formData.append("content", data.content)

//     if (data.files && data.files.length > 0) {
//       for (let i = 0; i < data.files.length; i++) {
//         formData.append("files", data.files[i])
//       }
//     }

//     const response = await API.post(`/assignments/${assignmentId}/submit`, formData, {
//       headers: {
//         "Content-Type": "multipart/form-data",
//       },
//     })

//     return response.data
//   },

//   async getSubmission(assignmentId: string): Promise<any> {
//     const response = await API.get(`/assignments/${assignmentId}/submission`)
//     return response.data
//   },

//   async getSubmissionsByAssignment(assignmentId: string): Promise<any[]> {
//     const response = await API.get(`/assignments/${assignmentId}/submissions`)
//     return response.data
//   },

//   async gradeSubmission(submissionId: string, gradeData: any): Promise<any> {
//     const response = await API.post(`/submissions/${submissionId}/grade`, gradeData)
//     return response.data
//   },
// }

// export default AssignmentService
