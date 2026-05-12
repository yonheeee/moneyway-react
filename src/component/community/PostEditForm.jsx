import React, { useEffect, useMemo, useState, useCallback } from "react";
import { FaImage } from "react-icons/fa6";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import useUserStore from "../../api/userStore";
import "../../css/community/PostCreateForm.css";

const MAX_IMAGES = 10;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_MB = 10;

const PostEditForm = () => {
  const { user } = useUserStore();
  const profileImg = user?.profileImageUrl;
  const { postId } = useParams();
  const navigate = useNavigate();

  // ----- 기본 입력 -----
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // 예산: 숫자 문자열 + 포커스
  const [totalCost, setTotalCost] = useState("");
  const [isBudgetFocused, setIsBudgetFocused] = useState(false);

  // ----- 썸네일 (기존/신규/액션) -----
  const [existingThumbUrl, setExistingThumbUrl] = useState(null);
  const [thumbFile, setThumbFile] = useState(null);
  const [thumbPreview, setThumbPreview] = useState(null);
  // keep | replace | remove
  const [thumbAction, setThumbAction] = useState("keep");

  // ----- 본문 이미지 (기존/삭제/신규) -----
  // 기존: [{id, url}]
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [removedExistingPhotoIds, setRemovedExistingPhotoIds] = useState(new Set());
  // 신규 업로드
  const [photoFiles, setPhotoFiles] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);

  const isFormValid = title.trim() !== "" && content.trim() !== "";

  // ===== 통화 포맷 유틸 =====
  const nfKR = useMemo(() => new Intl.NumberFormat("ko-KR"), []);
  const onlyDigits = useCallback((s) => (s || "").replace(/\D/g, ""), []);
  const toCurrency = useCallback(
    (n) => (typeof n === "number" && !Number.isNaN(n) ? `₩ ${nfKR.format(n)}원` : ""),
    [nfKR]
  );

  const totalCostValue = useMemo(() => {
    const digits = onlyDigits(totalCost);
    return digits ? parseInt(digits, 10) : null;
  }, [totalCost, onlyDigits]);

  // ===== 안전한 revoke =====
  const revokeURLSafe = useCallback((url) => {
    try {
      URL.revokeObjectURL(url);
    } catch {}
  }, []);

  // ===== 초기 데이터 로딩 =====
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/posts/${postId}`);
        const post = data?.post ?? data;

        setTitle(post?.title ?? "");
        setContent(post?.content ?? "");

        const budgetVal = post?.totalCost ?? post?.budget ?? post?.price ?? null;
        setTotalCost(budgetVal ? String(budgetVal) : "");

        const tUrl = post?.thumbnailUrl ?? post?.thumbnail ?? post?.thumbUrl ?? null;
        setExistingThumbUrl(tUrl);
        setThumbAction("keep");

        let imgs = post?.images ?? post?.photos ?? post?.imageUrls ?? [];
        if (Array.isArray(imgs)) {
          const norm = imgs
            .map((it, idx) => {
              if (typeof it === "string") return { id: idx, url: it };
              return {
                id: it?.id ?? it?.imageId ?? idx,
                url: it?.url ?? it?.imageUrl ?? it?.path ?? "",
              };
            })
            .filter((x) => x.url);
          setExistingPhotos(norm);
        } else {
          setExistingPhotos([]);
        }
        setRemovedExistingPhotoIds(new Set());
      } catch (err) {
        console.error("글 불러오기 실패", err);
        toast.error("글 정보를 불러오지 못했습니다.");
        navigate(-1);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  // ===== 언마운트 시 URL 정리 =====
  useEffect(() => {
    return () => {
      if (thumbPreview) URL.revokeObjectURL(thumbPreview);
      photoPreviews.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [thumbPreview, photoPreviews]);

  // ===== 예산 입력 =====
  const handleBudgetChange = (e) => setTotalCost(onlyDigits(e.target.value));
  const handleBudgetFocus = () => setIsBudgetFocused(true);
  const handleBudgetBlur = () => setIsBudgetFocused(false);
  const budgetDisplayValue = useMemo(() => {
    const digits = onlyDigits(totalCost);
    if (!digits) return "";
    return isBudgetFocused ? digits : toCurrency(parseInt(digits, 10));
  }, [isBudgetFocused, totalCost, onlyDigits, toCurrency]);

  // ===== 썸네일 업로드/삭제 =====
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
    setThumbAction("replace");
  };

  const handleRemoveThumbnail = useCallback(() => {
    // 미리보기 URL 반환
    if (thumbPreview) revokeURLSafe(thumbPreview);
    // 파일 인풋도 비워서 전송 방지
    const fi = document.getElementById("thumb-upload");
    if (fi && typeof fi.value !== "undefined") fi.value = "";
    // 상태 초기화 + 삭제 신호 고정
    setThumbFile(null);
    setThumbPreview(null);
    setExistingThumbUrl(null);
    setThumbAction("remove");
    // 사용자 안내
    toast.success("썸네일이 제거되었습니다.");
  }, [thumbPreview, revokeURLSafe]);

  // ===== 본문 이미지 업로드/삭제 =====
  const handleSelectPhotos = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

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

    const avail = MAX_IMAGES - (existingPhotos.length - removedExistingPhotoIds.size);
    const merged = [...photoFiles, ...next].slice(0, Math.max(0, avail));

    photoPreviews.forEach((u) => revokeURLSafe(u));
    const previews = merged.map((f) => URL.createObjectURL(f));

    setPhotoFiles(merged);
    setPhotoPreviews(previews);

    const totalCountAttempt =
      existingPhotos.length - removedExistingPhotoIds.size + photoFiles.length + next.length;
    if (totalCountAttempt > MAX_IMAGES) {
      toast.info(`이미지는 최대 ${MAX_IMAGES}장까지 업로드할 수 있어요.`);
    }
  };

  const handleRemoveExistingPhoto = useCallback((imgId) => {
    setRemovedExistingPhotoIds((prev) => new Set(prev).add(imgId));
  }, []);

  const handleRemovePhoto = useCallback(
    (idx) => {
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
    },
    [revokeURLSafe]
  );

  // ===== 제출 (수정) =====
  // ✅ 멀티파트 전송: post(JSON), thumbnail(선택), photos(선택)
  const handleSubmit = async () => {
    try {
      // 남길 기존 본문 이미지 URL만 추려서 보냄 (백엔드: 이 리스트 외 기존은 삭제)
      const liveExistingUrls = existingPhotos
        .filter((p) => !removedExistingPhotoIds.has(p.id))
        .map((p) => p.url);

      // 삭제면 빈 문자열로 전송하여 서버 isBlank() 조건 확실히 트리거
      const thumbnailUrlForServer =
        thumbAction === "remove"
          ? ""
          : thumbAction === "keep"
          ? (existingThumbUrl || "")
          : (existingThumbUrl || "");

      const postJson = {
        title,
        content,
        totalCost: totalCostValue ?? 0,     // @NotNull + @PositiveOrZero 대응
        thumbnailUrl: thumbnailUrlForServer,
        imageUrls: liveExistingUrls,
      };

      const form = new FormData();
      form.append("post", new Blob([JSON.stringify(postJson)], { type: "application/json" }));

      if (thumbAction === "replace" && thumbFile) {
        form.append("thumbnail", thumbFile);
      }
      photoFiles.forEach((file) => form.append("photos", file));

      // 백엔드: @PostMapping(value="/{postId}", consumes="multipart/form-data")
      await api.post(`/posts/${postId}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("글이 수정되었습니다.");
      // 캐시 무력화(상세 페이지 이미지 갱신 보장)
      navigate(`/posts/${postId}?t=${Date.now()}`);
    } catch (err) {
      console.error("글 수정 실패", err);
      const message = err?.response?.data?.message || "글 수정에 실패했습니다.";
      toast.error(message);
    }
  };

  const liveExistingPhotos = existingPhotos.filter((p) => !removedExistingPhotoIds.has(p.id));
  const totalImagesCount = liveExistingPhotos.length + photoPreviews.length;
  const remainingAddable =
    Math.max(0, MAX_IMAGES - (existingPhotos.length - removedExistingPhotoIds.size) - photoFiles.length);

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
              maxLength={20} // 서버 검증(@Size max=20)에 맞춤
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

          <div className="action-group">
            {/* 썸네일(단일) */}
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              id="thumb-upload"
              onChange={handleSelectThumbnail}
            />
            <label htmlFor="thumb-upload" className="upload-btn" title="썸네일 교체">
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
            <label
              htmlFor="photos-upload"
              className="upload-btn"
              title={`이미지 업로드 (최대 ${remainingAddable}장 추가 가능)`}
            >
              <FaImage size={22} /> 이미지
            </label>

            <button
              className={`submit-btn ${isFormValid ? "active" : "disabled"}`}
              onClick={handleSubmit}
              disabled={!isFormValid}
            >
              수정 저장 ↑
            </button>
          </div>
        </div>

        {/* 썸네일 미리보기 (삭제 버튼: 이미지 정중앙) */}
        {(existingThumbUrl || thumbPreview) && (
          <>
            <div className="divider" />
            <div className="thumbnail-selector">
              <p className="thumbnail-title">썸네일</p>
              <div className="thumbnail-single-wrap">
                <img
                  src={thumbPreview || existingThumbUrl || ""}
                  alt="thumbnail"
                  className="thumbnail-image selected"
                />
                <button
                  type="button"
                  className="thumb-remove-btn"
                  onClick={handleRemoveThumbnail}
                  aria-label="썸네일 제거"
                  title="썸네일 제거"
                >
                  ×
                </button>
              </div>
            </div>
          </>
        )}

        {/* 기존 본문 이미지 (삭제 버튼: 이미지 정중앙) */}
        {liveExistingPhotos.length > 0 && (
          <>
            <div className="divider" />
            <div className="thumbnail-selector">
              <p className="thumbnail-title">기존 이미지</p>
              <div className="thumbnail-image-list">
                {liveExistingPhotos.map((p) => (
                  <div key={p.id} className="thumbnail-item">
                    <img src={p.url} alt={`existing-${p.id}`} className="thumbnail-image" />
                    <button
                      type="button"
                      className="remove-photo-btn"
                      onClick={() => handleRemoveExistingPhoto(p.id)}
                      aria-label={`기존 이미지 ${p.id} 삭제`}
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

        {/* 신규 업로드 이미지 (삭제 버튼: 이미지 정중앙) */}
        {photoPreviews.length > 0 && (
          <>
            <div className="divider" />
            <div className="thumbnail-selector">
              <p className="thumbnail-title">추가될 이미지</p>
              <div className="thumbnail-image-list">
                {photoPreviews.map((url, idx) => (
                  <div key={idx} className="thumbnail-item">
                    <img src={url} alt={`new-${idx}`} className="thumbnail-image" />
                    <button
                      type="button"
                      className="remove-photo-btn"
                      onClick={() => handleRemovePhoto(idx)}
                      aria-label={`신규 이미지 ${idx + 1} 삭제`}
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

        {!!totalImagesCount && (
          <div style={{ marginTop: "0.8rem", textAlign: "right", color: "#777" }}>
            총 이미지 {totalImagesCount}장
          </div>
        )}
      </div>
    </div>
  );
};

export default PostEditForm;
