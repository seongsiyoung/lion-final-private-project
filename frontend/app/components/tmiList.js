"use client";

export default function TmiList({ tmiList }) {
  return (
    <div>
      {tmiList.length === 0 ? (
        <p className="text-gray-500">등록된 TMI가 없습니다.</p>
      ) : (
        <ul className="space-y-2">
          {tmiList.map((tmi) => (
            <li
              key={tmi.id}
              className="border border-gray-200 rounded p-2 hover:bg-gray-50"
            >
              <p>{tmi.content}</p>
              <p className="text-xs text-gray-400">
                {new Date(tmi.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
