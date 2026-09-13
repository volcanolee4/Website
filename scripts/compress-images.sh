#!/usr/bin/env bash
# 构建时自动压缩 public/images 下的 PNG（有损量化，质量 65-80）。
# 原地覆盖：文件名/格式不变，因此内容 JSON 里的 /images/xxx.png 引用完全不受影响。
# --skip-if-larger 保证压缩后更大的图保留原图，不会越压越大。
set -euo pipefail

IMG_DIR="apps/web/public/images"

png_total() {
  find "$IMG_DIR" -name '*.png' -type f -printf '%s\n' 2>/dev/null | awk '{s+=$1} END {print s+0}'
}

BEFORE=$(png_total)
COUNT=$(find "$IMG_DIR" -name '*.png' -type f | wc -l)
echo "PNG 压缩：共 $COUNT 张，总 $(awk -v b="$BEFORE" 'BEGIN{printf "%.1f", b/1024}')KB"

find "$IMG_DIR" -name '*.png' -type f -print0 | while IFS= read -r -d '' f; do
  orig=$(stat -c%s "$f")
  # 有损量化压缩；成功且更小则原地覆盖，否则保留原图
  pngquant --quality=65-80 --speed=3 --strip --skip-if-larger --force --ext .png "$f" 2>/dev/null || true
  new=$(stat -c%s "$f")
  if [ "$new" -lt "$orig" ]; then
    printf "  %-40s %7dKB -> %7dKB  (省 %d%%)\n" "$(basename "$f")" $((orig / 1024)) $((new / 1024)) $(((orig - new) * 100 / orig))
  fi
done

AFTER=$(png_total)
echo "PNG 总计：$(awk -v b="$BEFORE" 'BEGIN{printf "%.1f", b/1024}')KB -> $(awk -v a="$AFTER" 'BEGIN{printf "%.1f", a/1024}')KB（省 $(awk -v b="$BEFORE" -v a="$AFTER" 'BEGIN{printf "%.0f", (b-a)*100/b}')%）"
