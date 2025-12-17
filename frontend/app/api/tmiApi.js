import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

export async function fetchTmis() {
  try {
    const res = await axios.get(`${API_BASE_URL}/tmis`);
    return res.data;
  } catch (err) {
    console.error("TMI 목록 조회 실패", err);
    return [];
  }
}

export async function createTmi(content) {
  try {
    const res = await axios.post(`${API_BASE_URL}/tmi`, { content });
    return res.data;
  } catch (err) {
    console.error("TMI 등록 실패", err);
    return null;
  }
}
