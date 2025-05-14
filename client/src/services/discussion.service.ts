import {API} from "./api"

const DiscussionService = {
  async getAllDiscussions(params?: { category?: string; courseId?: string }): Promise<any[]> {
    const response = await API.get("/discussions", { params })
    return response.data
  },

  async getDiscussionById(id: string): Promise<any> {
    const response = await API.get(`/discussions/${id}`)
    return response.data
  },

  async createDiscussion(data: any): Promise<any> {
    const response = await API.post("/discussions", data)
    return response.data
  },

  async updateDiscussion(id: string, data: any): Promise<any> {
    const response = await API.put(`/discussions/${id}`, data)
    return response.data
  },

  async deleteDiscussion(id: string): Promise<void> {
    await API.delete(`/discussions/${id}`)
  },

  async getPosts(discussionId: string): Promise<any[]> {
    const response = await API.get(`/discussions/${discussionId}/posts`)
    return response.data
  },

  async createPost(discussionId: string, data: any): Promise<any> {
    const formData = new FormData()


    formData.append("content", data.content)


    if (data.parentId) {
      formData.append("parentId", data.parentId)
    }


    if (data.files && data.files.length > 0) {
      for (let i = 0; i < data.files.length; i++) {
        formData.append("files", data.files[i])
      }
    }

    const response = await API.post(`/discussions/${discussionId}/posts`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    return response.data
  },

  async likePost(postId: string): Promise<any> {
    const response = await API.post(`/posts/${postId}/like`)
    return response.data
  },

  async unlikePost(postId: string): Promise<any> {
    const response = await API.delete(`/posts/${postId}/like`)
    return response.data
  },

  async reportPost(postId: string, reason: string): Promise<any> {
    const response = await API.post(`/posts/${postId}/report`, { reason })
    return response.data
  },
}

export default DiscussionService