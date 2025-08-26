from typing import List, Dict, Any
from config import METADATA_FIELDS
from cmc_fetcher import extract_social_data, extract_urls

def _safe_get_contract_address(detail: Dict[str, Any]) -> str:
    """安全地获取合约地址"""
    platform = detail.get('platform')
    if platform and isinstance(platform, dict):
        return platform.get('token_address', '未知')
    return '未知'

def process_data(ucids: List[int], coin_details: Dict[str, Any], market_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """整合数据，生成待向量化文本和元数据"""
    processed_list: List[Dict[str, Any]] = []

    for ucid in ucids:
        ucid_str = str(ucid)
        detail = coin_details.get(ucid_str, {})
        market = market_data.get(ucid_str, {})
        # 安全地获取 USD 报价数据
        quote = market.get("quote", {})
        usd_quote = quote.get("USD", {}) if isinstance(quote, dict) else {}

        social_data = extract_social_data(detail.get("urls", {}))
        url_data = extract_urls(detail.get("urls", {}))

        # 安全地处理描述字段
        description = detail.get('description', '无简介')
        if description is None:
            description_text = '无简介'
        elif isinstance(description, str):
            description_text = description[:200] if description else '无简介'
        else:
            # 将非字符串类型转换为字符串后截取
            description_text = str(description)[:200]

        # 安全地处理标签字段
        tags = detail.get('tags', [])
        if tags is None:
            tags_text = '无'
        elif isinstance(tags, list):
            tags_text = ', '.join(tags) if tags else '无'
        else:
            tags_text = str(tags)

        token_info = (
            f"代币基础信息：名称：{detail.get('name', '未知')} ({detail.get('symbol', '未知')}), "
            f"分类：{detail.get('category', '未知')}, 标签：{tags_text}. "
            f"简介：{description_text}. "
            f"合约地址：{_safe_get_contract_address(detail)}. "
            f"供应量：流通 {market.get('circulating_supply', '未知')}, 总 {market.get('total_supply', '未知')}. "
            f"市场数据：FDV {usd_quote.get('fully_diluted_valuation', '未知')} 美元. "
            f"官方链接：官网 {url_data['website']}, 白皮书 {url_data['whitepaper']}."
        )

        metadata: Dict[str, Any] = {
            "cmc_id": ucid,
            "logo": detail.get("logo"),
            "name": detail.get("name"),
            "symbol": detail.get("symbol"),
            "contracts": _safe_get_contract_address(detail),
            "circulating_supply": market.get("circulating_supply"),
            "total_supply": market.get("total_supply"),
            "max_supply": market.get("max_supply"),
            "category": detail.get("category"),
            "telegram_members": social_data.get("telegram_members"),
            "twitter_followers": social_data.get("twitter_followers"),
            # 将 URL 字典展开为单独的字段，符合 Pinecone 元数据要求
            "website": url_data.get("website"),
            "whitepaper": url_data.get("whitepaper"),
            "twitter_url": url_data.get("twitter"),
            "tags": tags_text,
            "description": detail.get("description"),
            "fdv": usd_quote.get("fully_diluted_valuation"),
        }
        # 清理元数据，确保符合 Pinecone 要求（字符串、数字、布尔值或字符串列表）
        metadata_cleaned = {}
        for k, v in metadata.items():
            if v is not None and v != '':
                # 确保所有值都是 Pinecone 支持的类型
                if isinstance(v, (str, int, float, bool)):
                    metadata_cleaned[k] = v
                elif isinstance(v, list) and all(isinstance(item, str) for item in v):
                    metadata_cleaned[k] = v
                else:
                    # 将其他类型转换为字符串
                    metadata_cleaned[k] = str(v)

        processed_list.append({
            "id": f"cmc-{ucid}",
            "token_info": token_info,
            "metadata": metadata_cleaned
        })

    print(f"✅ 数据处理完成，共生成 {len(processed_list)} 条待处理数据")
    return processed_list