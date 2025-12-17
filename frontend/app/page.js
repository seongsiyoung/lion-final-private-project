"use client";

import { useState, useEffect } from "react";
import { fetchTmis, createTmi } from "./api/tmiApi";
import TmiForm from "./components/tmiForm";
import TmiList from "./components/tmiList";

export default function HomePage() {
  const [tmiList, setTmiList] = useState([]);

  const loadTmis = async () => {
    const data = await fetchTmis();
    setTmiList(data);
  };

  useEffect(() => {
    loadTmis();
  }, []);

  const handleCreate = async (content) => {
    const newTmi = await createTmi(content);
    if (newTmi) {
      loadTmis();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">오늘의 TMI</h1>

        {/* 등록 폼 */}
        <TmiForm onCreate={handleCreate} />

        {/* TMI 목록 */}
        <TmiList tmiList={tmiList} />
      </div>
    </div>
  );
}
