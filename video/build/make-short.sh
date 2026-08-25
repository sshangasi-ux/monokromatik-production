#!/bin/bash
# Cut a vertical Short (scenes 1,2,7 = hook -> stat -> thesis) from an existing
# explainer's assets, render it, and upload it public as a Short.
# usage: make-short.sh <slug> <c1> <c2> <c7> <a1> <a2> <a7>
set -e
cd "/Users/sibushangase/dev/monokromatik-production/video"
slug="$1"; c1="$2"; c2="$3"; c7="$4"; a1="$5"; a2="$6"; a7="$7"
B="https://d8j0ntlcm91z4.cloudfront.net/user_3I6KQZyIfaeJNxXhrtz9FvFIh13/"
curl -sS "${B}${c1}" -o public/hf/clip1.mp4
curl -sS "${B}${c2}" -o public/hf/clip2.mp4
curl -sS "${B}${c7}" -o public/hf/clip7.mp4
curl -sS "${B}${a1}" -o public/hf/vo1.wav
curl -sS "${B}${a2}" -o public/hf/vo2.wav
curl -sS "${B}${a7}" -o public/hf/vo7.wav
python3 - "$slug" <<'PY'
import json, wave, sys
slug=sys.argv[1]
d=json.load(open(f"build/generated/{slug}.scenes.json"))
byid={s['id']:s for s in d['scenes']}
man=[]; ov=[]
for i in [1,2,7]:
    with wave.open(f"public/hf/vo{i}.wav") as w: dur=round(w.getnframes()/float(w.getframerate()),3)
    man.append({"i":i,"clip":f"hf/clip{i}.mp4","audio":f"hf/vo{i}.wav","voDur":dur})
    s=byid[i]; ov.append({"id":i,"kind":s['kind'],"overlay":s['overlay']})
json.dump(man,open("src/hf-manifest.json","w"),indent=2)
json.dump(ov,open("src/hf-scenes.json","w"),ensure_ascii=False,indent=2)
print("short ~", round(sum(m['voDur']+0.35 for m in man),1), "s")
PY
export NODE_OPTIONS="--max-old-space-size=6144"
npx remotion render src/index.ts HiggsfieldExplainer "out/${slug}-short.mp4" --concurrency=2 2>&1 | tail -2
echo "rendered out/${slug}-short.mp4 ($(ls -la out/${slug}-short.mp4 | awk '{print $5}') bytes)"
