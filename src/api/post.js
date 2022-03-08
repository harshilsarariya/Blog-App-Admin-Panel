import client from "./client";

export const getPosts = async (pageNo, limit) => {
  try {
    const { data } = await client(
      `/post/posts?pageNo=${pageNo}&limit=${limit}`
    );
    return data;
  } catch (error) {
    const { response } = error;
    if (response?.data) {
      return response.data;
    }
    return { error: error.message || error };
  }
};

export const deletePost = async (postId) => {
  try {
    const { data } = await client.delete(`/post/${postId}`);
    return data;
  } catch (error) {
    const { response } = error;
    if (response?.data) {
      return response.data;
    }
    return { error: error.message || error };
  }
};

export const searchPost = async (query) => {
  try {
    const { data } = await client(`/post/search?title=${query}`);
    return data;
  } catch (error) {
    const { response } = error;
    if (response?.data) {
      return response.data;
    }
    return { error: error.message || error };
  }
};

export const uploadImage = async (fromData) => {
  try {
    const { data } = await client.post(`/post/upload-image`, fromData);
    return data;
  } catch (error) {
    const { response } = error;
    if (response?.data) {
      return response.data;
    }
    return { error: error.message || error };
  }
};

export const createPost = async (fromData) => {
  try {
    const { data } = await client.post(`/post/create`, fromData);
    return data;
  } catch (error) {
    const { response } = error;
    if (response?.data) {
      return response.data;
    }
    return { error: error.message || error };
  }
};

export const updatePost = async (postId, fromData) => {
  try {
    const { data } = await client.put(`/post/${postId}`, fromData);
    return data;
  } catch (error) {
    const { response } = error;
    if (response?.data) {
      return response.data;
    }
    return { error: error.message || error };
  }
};

export const getPost = async (slug) => {
  try {
    const { data } = await client(`/post/single/${slug}`);
    return data;
  } catch (error) {
    const { response } = error;
    if (response?.data) {
      return response.data;
    }
    return { error: error.message || error };
  }
};
