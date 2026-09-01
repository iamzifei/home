# -*- coding: utf-8 -*-
"""Simplified -> Traditional (Taiwan) for the catalogue copy in data.js.

OpenCC `s2twp` gets the characters right and the vocabulary mostly right, but
its phrase table is tuned for prose and mis-fires on interface words. Every
entry below is a place it was measured to be wrong for THIS copy, with the
reason; the conversion is script conversion plus these corrections, not a
translation.
"""
from opencc import OpenCC

_cc = OpenCC('s2twp')

# Applied AFTER OpenCC, in order. Left = what s2twp produced, right = correct.
FIXES = [
    ('直髮',   '直發'),    # 直发 -> 髮 is hair. "Markdown 直发草稿" is send, not hair.
    ('釋出',   '發佈'),    # 发布 -> 釋出 is releasing software; publishing an article is 發佈.
    ('撥出',   '呼出'),    # 呼出 -> 撥出 is dialling a phone. The panel is summoned.
    ('區域性', '局部'),    # 局部 -> 區域性 is the CS sense of "local". This is a local graph.
    ('型別',   '類型'),    # 类型 -> 型別 is the programming sense. This is a file's kind.
    ('實時',   '即時'),    # Taiwan says 即時, not 實時.
    ('後臺',   '後台'),    # a web admin backend is 後台 in Taiwan; 後臺 is a stage.
    ('自定義', '自訂'),    # Taiwan interface word.
    ('倉庫',   '儲存庫'),  # matches the human-written zh-Hant in i18n.js.
    ('覆盤',   '復盤'),
    ('滑塊',   '滑桿'),    # slider
    ('滑條',   '滑桿'),
    ('外接屏', '外接螢幕'),
    ('第三方屏', '第三方螢幕'),
    ('每塊螢幕', '每塊螢幕'),
    ('回車即粘回', '按 Enter 即貼回'),
    ('直接粘第', '直接貼第'),
    ('批次轉成', '批次轉成'),
    # City and meet-up, to agree with the human zh-Hant already in i18n.js,
    # which uses 雪梨 and 聚會. The pun 「在悉尼和稀泥」 is protected below.
    ('人在悉尼', '人在雪梨'),
    ('悉尼每週四', '雪梨每週四'),
    ('AI 局', 'AI 聚會'),
]

# Strings that must come through untouched. 「在悉尼和稀泥」 is a pun on 悉尼
# (Sydney) and 和稀泥 (to fudge); 雪梨 would destroy it.
KEEP = ['在悉尼和稀泥']


def to_hant(text):
    holes = {}
    for n, k in enumerate(KEEP):
        if k in text:
            tok = '%d' % n
            holes[tok] = k
            text = text.replace(k, tok)
    out = _cc.convert(text)
    for a, b in FIXES:
        out = out.replace(a, b)
    for tok, k in holes.items():
        out = out.replace(tok, k)
    return out
