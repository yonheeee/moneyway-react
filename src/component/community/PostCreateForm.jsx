import React, { useEffect, useMemo, useState, useCallback } from "react";
import { FaImage } from "react-icons/fa6";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import useUserStore from "../../api/userStore";
import "../../css/community/PostCreateForm.css";

const MAX_IMAGES = 10;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_MB = 10;

const PostCreateForm = () => {
  const { user } = useUserStore();
  const profileImg = user?.profileImageUrl;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // 예산 입력: 숫자 문자열 + 포커스 상태
  const [totalCost, setTotalCost] = useState("");
  const [isBudgetFocused, setIsBudgetFocused] = useState(false);

  // 썸네일
  const [thumbFile, setThumbFile] = useState(null);
  const [thumbPreview, setThumbPreview] = useState(null);

  // 본문 이미지
  const [photoFiles, setPhotoFiles] = useState([]);       // File[]
  const [photoPreviews, setPhotoPreviews] = useState([]); // objectURL[]

  const navigate = useNavigate();
  const isFormValid = title.trim() !== "" && content.trim() !== "";

  // ---- 안전한 revoke ----
  const revokeURLSafe = useCallback((url) => {
    try { URL.revokeObjectURL(url); } catch (_) {}
  }, []);

  // ---- 언마운트/리셋 시 URL 정리 ----
  useEffect(() => {
    return () => {
      if (thumbPreview) URL.revokeObjectURL(thumbPreview);
      photoPreviews.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [thumbPreview, photoPreviews]);

  // ===== 통화 포맷 유틸 =====
  const nfKR = useMemo(() => new Intl.NumberFormat("ko-KR"), []);
  const onlyDigits = useCallback((s) => (s || "").replace(/\D/g, ""), []);
  const toCurrency = useCallback(
    (n) => (typeof n === "number" && !Number.isNaN(n) ? `₩ ${nfKR.format(n)}원` : ""),
    [nfKR]
  );

  // API에 보낼 숫자 값
  const totalCostValue = useMemo(() => {
    const digits = onlyDigits(totalCost);
    return digits ? parseInt(digits, 10) : null;
  }, [totalCost, onlyDigits]);

  // 예산 입력 핸들러
  const handleBudgetChange = (e) => {
    const digits = onlyDigits(e.target.value);
    setTotalCost(digits);
  };
  const handleBudgetFocus = () => setIsBudgetFocused(true);
  const handleBudgetBlur = () => setIsBudgetFocused(false);

  // 표시용 값 (포커스 중: 숫자, 블러: ₩ …원)
  const budgetDisplayValue = useMemo(() => {
    const digits = onlyDigits(totalCost);
    if (!digits) return "";
    if (isBudgetFocused) return digits;
    return toCurrency(parseInt(digits, 10));
  }, [isBudgetFocused, totalCost, onlyDigits, toCurrency]);

  // 파일 선택(썸네일)
  const handleSelectThumbnail = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!ACCEPTED_TYPES.includes(f.type)) {
      toast.warn("이미지(jpg/png/webp/gif)만 업로드할 수 있어요.");
      return;
    }
    if (f.size > MAX_FILE_MB * 1024 * 1024) {
      toast.warn(`썸네일은 ${MAX_FILE_MB}MB 이하만 가능해요.`);
      return;
    }
    if (thumbPreview) revokeURLSafe(thumbPreview);
    setThumbFile(f);
    setThumbPreview(URL.createObjectURL(f));
  };

  // ✅ 썸네일 삭제
  const handleRemoveThumbnail = useCallback(() => {
    if (thumbPreview) revokeURLSafe(thumbPreview);
    setThumbFile(null);
    setThumbPreview(null);
  }, [thumbPreview, revokeURLSafe]);

  // 파일 선택(본문 이미지)
  const handleSelectPhotos = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const next = [];
    for (const f of files) {
      if (!ACCEPTED_TYPES.includes(f.type)) {
        toast.warn("이미지(jpg/png/webp/gif)만 업로드할 수 있어요.");
        continue;
      }
      if (f.size > MAX_FILE_MB * 1024 * 1024) {
        toast.warn(`각 이미지는 ${MAX_FILE_MB}MB 이하만 가능해요.`);
        continue;
      }
      next.push(f);
    }

    const merged = [...photoFiles, ...next].slice(0, MAX_IMAGES);
    // 기존 URL 정리 후 새로 생성
    photoPreviews.forEach((u) => revokeURLSafe(u));
    const previews = merged.map((f) => URL.createObjectURL(f));

    setPhotoFiles(merged);
    setPhotoPreviews(previews);

    if (photoFiles.length + next.length > MAX_IMAGES) {
      toast.info(`이미지는 최대 ${MAX_IMAGES}장까지 업로드할 수 있어요.`);
    }
  };

  // ✅ 본문 이미지 개별 삭제 (index 기반)
  const handleRemovePhoto = useCallback((idx) => {
    setPhotoFiles((prev) => {
      const copy = [...prev];
      copy.splice(idx, 1);
      return copy;
    });
    setPhotoPreviews((prev) => {
      const copy = [...prev];
      const [removedUrl] = copy.splice(idx, 1);
      if (removedUrl) revokeURLSafe(removedUrl);
      return copy;
    });
  }, [revokeURLSafe]);

  // 제출
  const handleSubmit = async () => {
    try {
      const fd = new FormData();
      const postJson = {
        title,
        content,
        totalCost: totalCostValue, // 숫자 or null
      };
      fd.append("post", new Blob([JSON.stringify(postJson)], { type: "application/json" }));
      if (thumbFile) fd.append("thumbnail", thumbFile);
      photoFiles.forEach((file) => fd.append("photos", file));

      await api.post("/posts", fd);
      toast.success("글이 등록되었습니다!");

      // URL 정리
      if (thumbPreview) revokeURLSafe(thumbPreview);
      photoPreviews.forEach((u) => revokeURLSafe(u));

      // reset
      setTitle("");
      setContent("");
      setTotalCost("");
      setIsBudgetFocused(false);
      setThumbFile(null);
      setThumbPreview(null);
      setPhotoFiles([]);
      setPhotoPreviews([]);

      navigate("/community");
    } catch (err) {
      console.error("글 등록 실패", err);
      const message = err?.response?.data?.message || "글 등록에 실패했습니다.";
      toast.error(message);
    }
  };

  return (
    <div className="post-form-whole-wrapper">
      <div className="post-form-wrapper">
        {/* 헤더 */}
        <div className="post-header-create">
          <div className="post-header-row">
            <input
              className="post-title-input"
              placeholder="제목을 입력하세요."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>
          <div className="divider" />
        </div>

        {/* 본문 */}
        <div className="post-body">
          <img
            src={profileImg || "https://via.placeholder.com/40"}
            alt="프로필"
            className="profile-img"
          />
          <textarea
            className="post-content-input"
            placeholder="나의 여행을 공유해보세요!"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={5000}
          />
        </div>

        <div className="divider" />

        {/* 푸터 */}
        <div className="post-footer">
          {/* 예산 */}
          <div className="budget-group">
            <span className="budget-label">나의 예산</span>
            <input
              className="budget-input"
              placeholder="₩ 0원"
              inputMode="numeric"
              pattern="\d*"
              aria-label="여행 예산"
              value={budgetDisplayValue}
              onChange={handleBudgetChange}
              onFocus={handleBudgetFocus}
              onBlur={handleBudgetBlur}
            />
          </div>

          {/* 이미지 + 공유 */}
          <div className="action-group">
            {/* 썸네일(단일) */}
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              id="thumb-upload"
              onChange={handleSelectThumbnail}
            />
            <label htmlFor="thumb-upload" className="upload-btn" title="썸네일 업로드">
              <FaImage size={22} /> 썸네일
            </label>

            {/* 본문 이미지(다중) */}
            <input
              type="file"
              accept="image/*"
              multiple
              style={{ display: "none" }}
              id="photos-upload"
              onChange={handleSelectPhotos}
            />
            <label htmlFor="photos-upload" className="upload-btn" title="이미지 업로드(최대 10)">
              <FaImage size={22} /> 이미지
            </label>

            <button
              className={`submit-btn ${isFormValid ? "active" : "disabled"}`}
              onClick={handleSubmit}
              disabled={!isFormValid}
            >
              공유하기 ↑
            </button>
          </div>
        </div>

        {/* 썸네일 미리보기 + 삭제 버튼(위 중앙) */}
        {thumbPreview && (
          <>
            <div className="divider" />
            <div className="thumbnail-selector">
              <p className="thumbnail-title">썸네일 미리보기</p>
              <div className="thumbnail-single-wrap">
                <img src={thumbPreview} alt="thumbnail" className="thumbnail-image selected" />
                <button
                  type="button"
                  className="thumb-remove-btn"
                  onClick={handleRemoveThumbnail}
                  aria-label="썸네일 삭제"
                  title="썸네일 삭제"
                >
                  ×
                </button>
              </div>
            </div>
          </>
        )}

        {/* 본문 이미지 미리보기 + 개별 삭제(위 중앙) */}
        {photoPreviews.length > 0 && (
          <>
            <div className="divider" />
            <div className="thumbnail-selector">
              <p className="thumbnail-title">업로드될 이미지 목록</p>
              <div className="thumbnail-image-list">
                {photoPreviews.map((url, idx) => (
                  <div key={idx} className="thumbnail-item">
                    <img src={url} alt={`uploaded-${idx}`} className="thumbnail-image" />
                    <button
                      type="button"
                      className="remove-photo-btn"
                      onClick={() => handleRemovePhoto(idx)}
                      aria-label={`이미지 ${idx + 1} 삭제`}
                      title="이미지 삭제"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PostCreateForm;
