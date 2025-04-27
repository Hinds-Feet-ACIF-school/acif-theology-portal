// import API from "./api"

// const CourseService = {
//   async getAllCourses(): Promise<any[]> {
//     const response = await API.get("/courses")
//     return response.data
//   },

//   async getCourseById(id: string): Promise<any> {
//     const response = await API.get(`/courses/${id}`)
//     return response.data
//   },

//   async enrollInCourse(courseId: string): Promise<any> {
//     const response = await API.post(`/courses/${courseId}/enroll`)
//     return response.data
//   },

//   async getEnrolledCourses(): Promise<any[]> {
//     const response = await API.get("/courses/enrolled")
//     return response.data
//   },

//   async trackProgress(courseId: string, lessonId: string, completed: boolean): Promise<any> {
//     const response = await API.post(`/courses/${courseId}/progress`, {
//       lessonId,
//       completed,
//     })
//     return response.data
//   },

//   async getCourseProgress(courseId: string): Promise<any> {
//     const response = await API.get(`/courses/${courseId}/progress`)
//     return response.data
//   },
// }

// export default CourseService
