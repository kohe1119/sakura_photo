import React, { useState, useEffect } from "react";

const allMembers = [
  { name: "井上梨名", generation: "2期生" },
  { name: "遠藤光莉", generation: "2期生" },
  { name: "大園玲", generation: "2期生" },
  { name: "大沼晶保", generation: "2期生" },
  { name: "幸阪茉里乃", generation: "2期生" },
  { name: "武元唯衣", generation: "2期生" },
  { name: "田村保乃", generation: "2期生" },
  { name: "藤吉夏鈴", generation: "2期生" },
  { name: "増本綺良", generation: "2期生" },
  { name: "松田里奈", generation: "2期生" },
  { name: "森田ひかる", generation: "2期生" },
  { name: "守屋麗奈", generation: "2期生" },
  { name: "山﨑天", generation: "2期生" },
  { name: "石森璃花", generation: "3期生" },
  { name: "遠藤理子", generation: "3期生" },
  { name: "小田倉麗奈", generation: "3期生" },
  { name: "小島凪紗", generation: "3期生" },
  { name: "谷口愛季", generation: "3期生" },
  { name: "中嶋優月", generation: "3期生" },
  { name: "的野美青", generation: "3期生" },
  { name: "向井純葉", generation: "3期生" },
  { name: "村井優", generation: "3期生" },
  { name: "村山美羽", generation: "3期生" },
  { name: "山下瞳月", generation: "3期生" },
  { name: "浅井恋乃未", generation: "4期生" },
  { name: "稲熊ひな", generation: "4期生" },
  { name: "勝又春", generation: "4期生" },
  { name: "佐藤愛桜", generation: "4期生" },
  { name: "中川智尋", generation: "4期生" },
  { name: "松本和子", generation: "4期生" },
  { name: "目黒陽色", generation: "4期生" },
  { name: "山川宇衣", generation: "4期生" },
  { name: "山田桃実", generation: "4期生" },
];

const costumes = ["浴衣", "4thアリーナツアー", "夏フェス", "お披露目"];

const cuts = ["ヨリ", "チュウ", "座り", "ヒキ"];

export default function PhotoManager() {
  // localStorageキー
  const STORAGE_KEY_PHOTOS = "sakurazaka_photos";
  const STORAGE_KEY_OSHI = "sakurazaka_oshi";

  // 初期メンバーにisOshi false付与
  const initMembers = allMembers.map((m) => ({ ...m, isOshi: false }));

  // 状態
  const [members, setMembers] = useState(initMembers);
  const [photos, setPhotos] = useState({});
  const [viewMode, setViewMode] = useState("costume"); // costume, member
  const [selectedCostume, setSelectedCostume] = useState(costumes[0]);
  const [filterGeneration, setFilterGeneration] = useState("");
  const [filterOshi, setFilterOshi] = useState("all");
  const [showOwnedOnly, setShowOwnedOnly] = useState(false);

  // 衣装別管理画面のメンバー選択
  const [selectedMemberForCostume, setSelectedMemberForCostume] = useState(null);

  // カット別所持枚数（選択中メンバー・衣装）
  const [selectedMemberCutCounts, setSelectedMemberCutCounts] = useState({
    ヨリ: 0,
    チュウ: 0,
    座り: 0,
    ヒキ: 0,
  });

  // ローカルストレージから読み込み
  useEffect(() => {
    const savedPhotos = localStorage.getItem(STORAGE_KEY_PHOTOS);
    if (savedPhotos) {
      setPhotos(JSON.parse(savedPhotos));
    }
    const savedOshi = localStorage.getItem(STORAGE_KEY_OSHI);
    if (savedOshi) {
      const oshiData = JSON.parse(savedOshi);
      setMembers((prev) =>
        prev.map((m) => ({ ...m, isOshi: !!oshiData[m.name] }))
      );
    }
  }, []);

  // localStorage保存処理
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PHOTOS, JSON.stringify(photos));
  }, [photos]);

  useEffect(() => {
    const oshiData = {};
    members.forEach((m) => {
      if (m.isOshi) oshiData[m.name] = true;
    });
    localStorage.setItem(STORAGE_KEY_OSHI, JSON.stringify(oshiData));
  }, [members]);

  // 所持数変更
  function changePhotoCount(costume, memberName, cut, delta) {
    setPhotos((prev) => {
      const newPhotos = { ...prev };
      if (!newPhotos[costume]) newPhotos[costume] = {};
      if (!newPhotos[costume][memberName])
        newPhotos[costume][memberName] = { ヨリ: 0, チュウ: 0, 座り: 0, ヒキ: 0 };
      const currentCount = newPhotos[costume][memberName][cut] || 0;
      const newCount = Math.max(0, currentCount + delta);
      newPhotos[costume][memberName][cut] = newCount;

      // 選択中メンバーかつ衣装なら表示側も更新
      if (
        selectedMemberForCostume &&
        selectedMemberForCostume.name === memberName &&
        selectedCostume === costume
      ) {
        setSelectedMemberCutCounts((prevCounts) => ({
          ...prevCounts,
          [cut]: newCount,
        }));
      }

      return newPhotos;
    });
  }

  // 推し切替
  function toggleOshi(memberName) {
    setMembers((prev) =>
      prev.map((m) =>
        m.name === memberName ? { ...m, isOshi: !m.isOshi } : m
      )
    );
  }

  // 所持判定関数
  const hasPhoto = (memberName) => {
    return Object.values(photos).some(
      (costumeSet) =>
        costumeSet[memberName] &&
        Object.values(costumeSet[memberName]).some((c) => c > 0)
    );
  };

  // 衣装別管理でフィルター済みメンバー
  const filteredMembersForCostume = members.filter((m) => {
    if (filterGeneration && m.generation !== filterGeneration) return false;
    if (filterOshi === "oshi" && !m.isOshi) return false;
    if (filterOshi === "notOshi" && m.isOshi) return false;
    if (showOwnedOnly) {
      const counts = photos[selectedCostume]?.[m.name];
      if (!counts || !Object.values(counts).some((c) => c > 0)) return false;
    }
    return true;
  });

  // 選択中メンバーの合計所持枚数（全カット合計）
  const getTotalCountForMember = (memberName) => {
    const counts = photos[selectedCostume]?.[memberName];
    if (!counts) return 0;
    return Object.values(counts).reduce((a, b) => a + b, 0);
  };

  // 選択中メンバーのカットごとの枚数を選択メンバー変更やphotos更新に合わせて設定
  useEffect(() => {
    if (
      selectedMemberForCostume &&
      photos[selectedCostume] &&
      photos[selectedCostume][selectedMemberForCostume.name]
    ) {
      setSelectedMemberCutCounts(photos[selectedCostume][selectedMemberForCostume.name]);
    } else {
      setSelectedMemberCutCounts({ ヨリ: 0, チュウ: 0, 座り: 0, ヒキ: 0 });
    }
  }, [photos, selectedCostume, selectedMemberForCostume]);

  // メンバー一覧画面（簡易表示） or カット詳細画面切り替え用
  // selectedMemberForCostume が null のときは一覧、そうでなければ詳細表示
  return (
    <div className="p-4 max-w-screen-md mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-pink-700 text-center">
        櫻坂46 生写真管理ツール
      </h1>

      <div className="flex justify-center gap-4 mb-6 flex-wrap">
        <button
          onClick={() => {
            setViewMode("costume");
            setSelectedMemberForCostume(null);
          }}
          className={`px-4 py-2 rounded font-semibold ${
            viewMode === "costume"
              ? "bg-pink-600 text-white"
              : "bg-pink-100 text-pink-700"
          }`}
        >
          衣装別管理
        </button>
        <button
          onClick={() => {
            setViewMode("member");
            setSelectedMemberForCostume(null);
          }}
          className={`px-4 py-2 rounded font-semibold ${
            viewMode === "member"
              ? "bg-pink-600 text-white"
              : "bg-pink-100 text-pink-700"
          }`}
        >
          メンバー一覧
        </button>
      </div>

      {/* 共通フィルター */}
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        <select
          className="border rounded px-3 py-2 min-w-[120px]"
          value={filterGeneration}
          onChange={(e) => setFilterGeneration(e.target.value)}
        >
          <option value="">全期生</option>
          <option value="2期生">2期生</option>
          <option value="3期生">3期生</option>
          <option value="4期生">4期生</option>
        </select>

        <select
          className="border rounded px-3 py-2 min-w-[120px]"
          value={filterOshi}
          onChange={(e) => setFilterOshi(e.target.value)}
        >
          <option value="all">全て</option>
          <option value="oshi">推しのみ</option>
          <option value="notOshi">推し以外</option>
        </select>

        <label className="flex items-center gap-2 whitespace-nowrap">
          <input
            type="checkbox"
            checked={showOwnedOnly}
            onChange={(e) => setShowOwnedOnly(e.target.checked)}
            className="w-5 h-5"
          />
          所持しているのみ表示
        </label>
      </div>

      {viewMode === "costume" && (
        <>
          <h2 className="text-xl font-semibold mb-4 text-center">
            衣装:{" "}
            <select
              className="border rounded px-3 py-2"
              value={selectedCostume}
              onChange={(e) => {
                setSelectedCostume(e.target.value);
                setSelectedMemberForCostume(null); // 衣装変更時は詳細閉じる
              }}
            >
              {costumes.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </h2>

          {!selectedMemberForCostume ? (
            // メンバー一覧（横長ボタン）＋所持枚数表示
            <div className="flex flex-wrap gap-3 justify-center">
              {filteredMembersForCostume.map((member) => {
                const totalCount = getTotalCountForMember(member.name);
                return (
                  <button
                    key={member.name}
                    onClick={() => setSelectedMemberForCostume(member)}
                    className={`flex items-center gap-2 border rounded px-4 py-2 cursor-pointer select-none ${
                      member.isOshi ? "ring-4 ring-pink-500" : ""
                    }`}
                    title="タップで詳細・枚数変更"
                  >
                    <span className="font-semibold">{member.name}</span>
                    <span className="text-sm text-gray-600">({member.generation})</span>
                    <span
                      className={`ml-auto font-bold ${
                        totalCount > 0 ? "text-green-600" : "text-gray-400"
                      }`}
                    >
                      所持: {totalCount}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            // 選択メンバー詳細（カット別枚数変更）
            <div className="mt-4 border rounded p-4 bg-pink-50 max-w-md mx-auto">
              <button
                onClick={() => setSelectedMemberForCostume(null)}
                className="mb-4 px-3 py-1 bg-gray-300 rounded"
              >
                ← 戻る
              </button>
              <h3 className="text-xl font-semibold mb-4 text-center">
                {selectedMemberForCostume.name} の {selectedCostume} 所持写真
              </h3>

              <div className="flex flex-col gap-4 text-center">
                {cuts.map((cut) => (
                  <div
                    key={cut}
                    className="flex items-center justify-center gap-4 border rounded p-3 bg-white shadow-sm"
                  >
                    <div className="w-20 font-semibold">{cut}</div>
                    <button
                      onClick={() =>
                        changePhotoCount(
                          selectedCostume,
                          selectedMemberForCostume.name,
                          cut,
                          -1
                        )
                      }
                      disabled={selectedMemberCutCounts[cut] === 0}
                      className="px-4 py-1 text-xl font-bold bg-pink-500 text-white rounded disabled:opacity-50"
                    >
                      −
                    </button>
                    <div className="w-10 text-lg font-bold">
                      {selectedMemberCutCounts[cut]}
                    </div>
                    <button
                      onClick={() =>
                        changePhotoCount(
                          selectedCostume,
                          selectedMemberForCostume.name,
                          cut,
                          1
                        )
                      }
                      className="px-4 py-1 text-xl font-bold bg-pink-500 text-white rounded"
                    >
                      ＋
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {viewMode === "member" && (
        <>
          <h2 className="text-xl font-semibold mb-4 text-center">メンバー一覧</h2>

          <div className="flex justify-center gap-4 mb-4 flex-wrap">
            <select
              className="border rounded px-3 py-2 min-w-[120px]"
              value={filterGeneration}
              onChange={(e) => setFilterGeneration(e.target.value)}
            >
              <option value="">全期生</option>
              <option value="2期生">2期生</option>
              <option value="3期生">3期生</option>
              <option value="4期生">4期生</option>
            </select>
            <select
              className="border rounded px-3 py-2 min-w-[120px]"
              value={filterOshi}
              onChange={(e) => setFilterOshi(e.target.value)}
            >
              <option value="all">全て</option>
              <option value="oshi">推しのみ</option>
              <option value="notOshi">推し以外</option>
            </select>
            <label className="flex items-center gap-2 whitespace-nowrap">
              <input
                type="checkbox"
                checked={showOwnedOnly}
                onChange={(e) => setShowOwnedOnly(e.target.checked)}
                className="w-5 h-5"
              />
              所持しているのみ表示
            </label>
          </div>

          <ul className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {members
              .filter((m) => {
                if (filterGeneration && m.generation !== filterGeneration) return false;
                if (filterOshi === "oshi" && !m.isOshi) return false;
                if (filterOshi === "notOshi" && m.isOshi) return false;
                if (showOwnedOnly && !hasPhoto(m.name)) return false;
                return true;
              })
              .map((member) => (
                <li
                  key={member.name}
                  className={`border rounded p-4 cursor-pointer text-center select-none ${
                    member.isOshi ? "ring-4 ring-pink-500" : ""
                  }`}
                  onClick={() => toggleOshi(member.name)}
                  title="クリックで推し登録・解除"
                >
                  <div className="font-semibold">{member.name}</div>
                  <div className="text-sm text-gray-600 mb-3">{member.generation}</div>

                  <button
                    className={`px-3 py-1 rounded font-semibold ${
                      member.isOshi ? "bg-gray-400 text-white" : "bg-pink-600 text-white"
                    }`}
                  >
                    {member.isOshi ? "推し解除" : "推し登録"}
                  </button>
                </li>
              ))}
          </ul>
        </>
      )}
    </div>
  );
}
