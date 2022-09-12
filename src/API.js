import axios from "axios";

const Http = (baseURL, token, extraHeaders = {}, contentType = "application/json") => {
  let headers = {
    ...extraHeaders,
    "Content-Type": contentType,
    Accept: "application/json",
    "Transformd-Version": "2020-05-21",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return axios.create({
    baseURL,
    withCredentials: false,
    responseType: "json",
    timeout: 0,
    headers,
  });
};

let client;

const API = {
  init(apiUri, pat) {
    client = Http(apiUri, pat);
  },
  assignments: {
    update: (taskId, id, data) => client.patch(`tasks/${taskId}/assignments/${id}`, data),
  },
  submissions: {
    retrieve: (id) => client.get(`submissions/${id}`),
  },
  downloadFile: {
    retrieve: (submissionId, uploadId) => client.get(`submissions/${submissionId}/files/uploads/${uploadId}`, {responseType: 'blob'}),
  }
};

export default API;
