import { API } from "./api";
const DiscussionService = {
    async getAllDiscussions(params) {
        const response = await API.get("/discussions", { params });
        return response.data;
    },
    async getDiscussionById(id) {
        const response = await API.get(`/discussions/${id}`);
        return response.data;
    },
    async createDiscussion(data) {
        const response = await API.post("/discussions", data);
        return response.data;
    },
    async updateDiscussion(id, data) {
        const response = await API.put(`/discussions/${id}`, data);
        return response.data;
    },
    async deleteDiscussion(id) {
        await API.delete(`/discussions/${id}`);
    },
    async getPosts(discussionId) {
        const response = await API.get(`/discussions/${discussionId}/posts`);
        return response.data;
    },
    async createPost(discussionId, data) {
        const formData = new FormData();
        formData.append("content", data.content);
        if (data.parentId) {
            formData.append("parentId", data.parentId);
        }
        if (data.files && data.files.length > 0) {
            for (let i = 0; i < data.files.length; i++) {
                formData.append("files", data.files[i]);
            }
        }
        const response = await API.post(`/discussions/${discussionId}/posts`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    },
    async likePost(postId) {
        const response = await API.post(`/posts/${postId}/like`);
        return response.data;
    },
    async unlikePost(postId) {
        const response = await API.delete(`/posts/${postId}/like`);
        return response.data;
    },
    async reportPost(postId, reason) {
        const response = await API.post(`/posts/${postId}/report`, { reason });
        return response.data;
    },
};
export default DiscussionService;
