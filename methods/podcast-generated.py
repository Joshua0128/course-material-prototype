import os
import io
import json
from pathlib import Path
from typing import List, Dict, Any
from openai import OpenAI
from pydub import AudioSegment
from mutagen.mp3 import MP3

# ============== 基本設定 ==============
OUTPUT_DIR = Path("out_tts")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY") or "put the key"
MODEL = "tts-1-hd"              # 或 "tts-1"
AUDIO_FORMAT = "mp3"            # 可改 "wav"、"flac"
# 說話者→voice 對應（可依喜好微調：alloy / echo / fable / onyx / nova / shimmer）
VOICE_MAP = {
    "Amy": "nova",
    "Ben": "alloy",
}
DEFAULT_VOICE = "shimmer"

# ============== 你的多人對話腳本（可改成外部讀檔） ==============
DIALOGUE: List[Dict[str, str]] = [
    {
        "name": "Amy",
        "content": "歡迎收聽《社會觀察日常》，今天我們要聊的是一個你可能沒想過的議題——抽菸也有性別差異！你有沒有注意到，雖然男性吸菸的人多，但近二十年來，女性吸菸率卻微幅上升？"
    },
    {
        "name": "Ben",
        "content": "真的嗎？我以為大家都在減菸啊！男性下降還合理，但女性上升有點出乎意料。"
    },
    {
        "name": "Amy",
        "content": "對啊，根據政府統計，男性吸菸率下降了25.6%，但女性反而上升了0.2%。雖然聽起來不多，但趨勢反轉就代表有些事情正在改變。"
    },
    {
        "name": "Ben",
        "content": "那會不會是壓力或生活型態的差異？我聽說有些職業抽菸比例比較高。"
    },
    {
        "name": "Amy",
        "content": "完全正確！在女性族群中，吸菸比例最高的行業是藝術娛樂、資訊傳播、金融保險、還有餐飲業。這些行業都有一個共通點——節奏快、壓力大、社交需求高。"
    },
    {
        "name": "Ben",
        "content": "哦～那抽菸在這些工作裡，可能就像是社交潤滑劑，或者放鬆一下的方式吧。"
    },
    {
        "name": "Amy",
        "content": "沒錯。更進一步，統計也顯示家庭收入偏低，以及離婚、喪偶、分居的女性族群，吸菸率明顯較高。這不只是健康議題，還和社會結構、壓力支持系統有關。"
    },
    {
        "name": "Ben",
        "content": "懂了，那新一代的減菸政策，就不應該只有健康警語或戒菸門診，還要有壓力管理與社群支持。"
    },
    {
        "name": "Amy",
        "content": "對，把戒菸當作生活改善計畫，並加入性別觀點，政策才更有效也更公平。"
    }
]

# ============== 工具函式 ==============
def hhmmss(seconds: float) -> str:
    total_ms = max(0, int(round(seconds * 1000)))
    hh = total_ms // 3_600_000
    mm = (total_ms % 3_600_000) // 60_000
    ss = (total_ms % 60_000) // 1_000
    return f"{hh:02d}:{mm:02d}:{ss:02d}"

def temp_filename(idx: int, speaker: str) -> Path:
    safe = "".join(c if c.isalnum() or c in "-_." else "_" for c in speaker)
    return OUTPUT_DIR / f"{idx:03d}_{safe}.mp3"

def synth_to_file(client: OpenAI, text: str, voice: str, outfile: Path) -> None:
    """
    以串流方式直接寫檔（官方 SDK with_streaming_response 範例）。
    """
    # 注意：若你的 openai 套件版本不支援 with_streaming_response，
    # 可改用 client.audio.speech.create(...) 後 resp.stream_to_file(...)
    with client.audio.speech.with_streaming_response.create(
        model=MODEL,
        voice=voice,
        input=text,
        response_format=AUDIO_FORMAT,
    ) as resp:
        resp.stream_to_file(str(outfile))

# ============== 主流程 ==============
def main():
    client = OpenAI(api_key=OPENAI_API_KEY)

    # 1) 逐句 TTS、量測長度
    per_files: List[Path] = []
    per_durations: List[float] = []  # 秒
    for i, seg in enumerate(DIALOGUE, start=1):
        speaker = seg["name"]
        text = seg["content"].strip()
        voice = VOICE_MAP.get(speaker, DEFAULT_VOICE)

        out_path = temp_filename(i, speaker)
        synth_to_file(client, text, voice, out_path)

        # 量測單句長度（秒）
        dur_sec = float(MP3(str(out_path)).info.length)
        per_files.append(out_path)
        per_durations.append(dur_sec)

    # 2) 合併音檔（pydub）
    combined = AudioSegment.silent(duration=0)
    for f in per_files:
        combined += AudioSegment.from_file(f, format=AUDIO_FORMAT)
    final_path = OUTPUT_DIR / "podcast_combined.mp3"
    combined.export(final_path, format="mp3")

    # 3) 生成你要的 podcast_script_timestamp.json（每句起始時間）
    timestamps = []
    acc = 0.0
    for seg, dur in zip(DIALOGUE, per_durations):
        timestamps.append({
            "name": seg["name"],
            "content": seg["content"],
            "state_timestamp": hhmmss(acc)
        })
        acc += dur

    json_path = OUTPUT_DIR / "podcast_script_timestamp.json"
    json_path.write_text(json.dumps(timestamps, ensure_ascii=False, indent=2), encoding="utf-8")

    # 4) 額外輸出詳細表（可選）
    detail = []
    acc2 = 0.0
    for i, (seg, dur, f) in enumerate(zip(DIALOGUE, per_durations, per_files), start=1):
        detail.append({
            "index": i,
            "name": seg["name"],
            "voice": VOICE_MAP.get(seg["name"], DEFAULT_VOICE),
            "start_sec": round(acc2, 3),
            "duration_sec": round(dur, 3),
            "file": f.name,
            "text": seg["content"]
        })
        acc2 += dur
    (OUTPUT_DIR / "timestamps_detail.json").write_text(
        json.dumps(detail, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    total_len = float(MP3(str(final_path)).info.length)
    print(f"[OK] 合併檔：{final_path}（長度 {total_len:.2f} 秒）")
    print(f"[OK] 時間軸：{json_path}")
    print(f"[OK] 詳細表：{OUTPUT_DIR / 'timestamps_detail.json'}")

if __name__ == "__main__":
    main()
