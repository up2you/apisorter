import argparse
import json
import re
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Optional

import pandas as pd

try:
    from deep_translator import GoogleTranslator
except Exception:  # pragma: no cover
    GoogleTranslator = None  # type: ignore


@dataclass
class CatalogRecord:
    domain_code: str
    category: str
    category_slug: str
    vendor_name: str
    vendor_name_en: str
    api_product: str
    api_product_en: str
    api_focus: str
    api_focus_en: str
    primary_users: str
    primary_users_en: str
    source_file: str


DOMAIN_CODE_KEYS = ["領域編號", "領域", "類別"]
VENDOR_KEYS = ["廠商名稱"]
PRODUCT_KEYS = [
    "API 核心功能/產品",
    "API 核心功能",
    "API 核心功能/側重",
    "核心功能",
]
FOCUS_KEYS = [
    "API 類型/側重",
    "主要優勢",
    "主要優勢與特色",
    "主要強項與API特色",
    "專注 的領域",
    "補充資訊/專長",
    "支援的主要 支付方式 (部分)",
]
PRIMARY_USER_KEYS = [
    "主要應用者/場景",
    "典型應用者",
    "典型使用者/專注領域",
    "典型應用場景",
    "主要服務區域或目標客群",
    "適用場景",
]


def slugify(value: str) -> str:
    value = value.lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    value = re.sub(r"-+", "-", value)
    return value.strip("-")


def build_translator(target_lang: str = "en"):
    if GoogleTranslator is None:
        return None
    try:
        return GoogleTranslator(source="auto", target=target_lang)
    except Exception:
        return None


def normalize_headers(df: pd.DataFrame) -> pd.DataFrame:
    renamed = {col: col.strip() for col in df.columns}
    return df.rename(columns=renamed)


def pick_first(row: pd.Series, keys: Iterable[str]) -> str:
    for key in keys:
        if key in row and pd.notna(row[key]):
            value = str(row[key]).strip()
            if value:
                return value
    return ""


def translate_builder(translator):
    cache: Dict[str, str] = {}

    def _translate(text: str) -> str:
        if not text or translator is None:
            return text
        if text in cache:
            return cache[text]
        try:
            translated = translator.translate(text)
        except Exception:
            translated = text
        cache[text] = translated
        return translated

    return _translate


def import_excel_file(path: Path, translator) -> List[CatalogRecord]:
    category_name = path.stem
    category_slug = slugify(category_name)
    df = pd.read_excel(path)
    df = normalize_headers(df)

    translate = translate_builder(translator)

    records: List[CatalogRecord] = []
    for _, row in df.iterrows():
        vendor_name = pick_first(row, VENDOR_KEYS)
        api_product = pick_first(row, PRODUCT_KEYS)
        api_focus = pick_first(row, FOCUS_KEYS)
        primary_users = pick_first(row, PRIMARY_USER_KEYS)
        domain_code = pick_first(row, DOMAIN_CODE_KEYS)

        if not vendor_name and not api_product:
            continue

        records.append(
            CatalogRecord(
                domain_code=domain_code,
                category=category_name,
                category_slug=category_slug,
                vendor_name=vendor_name,
                vendor_name_en=translate(vendor_name),
                api_product=api_product,
                api_product_en=translate(api_product),
                api_focus=api_focus,
                api_focus_en=translate(api_focus),
                primary_users=primary_users,
                primary_users_en=translate(primary_users),
                source_file=path.name,
            )
        )
    return records


def main(directory: str, output: str, target_lang: str, skip_translate: bool = False):
    base_path = Path(directory)
    if not base_path.exists():
        raise FileNotFoundError(f"Directory '{directory}' not found")

    translator = None if skip_translate else build_translator(target_lang)
    all_records: List[CatalogRecord] = []
    for file in sorted(base_path.glob("*.xlsx")):
        records = import_excel_file(file, translator)
        all_records.extend(records)

    output_path = Path(output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8") as f:
        json.dump([asdict(rec) for rec in all_records], f, ensure_ascii=False, indent=2)

    print(f"Exported {len(all_records)} records to {output_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Import API catalog Excel files and translate to English")
    parser.add_argument("--directory", default="api_classification", help="Directory containing .xlsx files")
    parser.add_argument("--output", default="data/catalog/catalog-translated.json", help="Output JSON path")
    parser.add_argument("--target-lang", default="en", help="Target language code for translation")
    parser.add_argument("--skip-translate", action="store_true", help="Skip automatic translation and keep original text")
    args = parser.parse_args()

    main(args.directory, args.output, args.target_lang, skip_translate=args.skip_translate)
