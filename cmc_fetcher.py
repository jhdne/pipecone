import requests
import time
from typing import List, Dict, Any
from config import CMC_CONFIG, BATCH_SIZE, REQUEST_DELAY

def _fetch_in_batches(ucids: List[int], endpoint_key: str, params_extra: Dict = None) -> Dict[str, Any]:
    """通用批量获取函数"""
    data_map: Dict[str, Any] = {}
    total_batches = (len(ucids) + BATCH_SIZE - 1) // BATCH_SIZE

    for batch_idx in range(total_batches):
        start_idx = batch_idx * BATCH_SIZE
        end_idx = start_idx + BATCH_SIZE
        batch_ucids_str = ",".join(map(str, ucids[start_idx:end_idx]))

        params = {"id": batch_ucids_str}
        if params_extra:
            params.update(params_extra)

        try:
            response = requests.get(
                url=f"{CMC_CONFIG['base_url']}{CMC_CONFIG['endpoints'][endpoint_key]}",
                headers=CMC_CONFIG["headers"],
                params=params,
                timeout=15
            )
            response.raise_for_status()

            try:
                data = response.json()
            except ValueError as e:
                print(f"❌ {endpoint_key} JSON 解析失败 (批次 {batch_idx+1}): {e}")
                continue

            # 安全地检查响应结构
            if not isinstance(data, dict):
                print(f"❌ {endpoint_key} 响应格式错误 (批次 {batch_idx+1}): 期望字典但得到 {type(data)}")
                continue

            status = data.get("status", {})
            if isinstance(status, dict) and status.get("error_code") == 0:
                response_data = data.get("data")
                if response_data:
                    data_map.update(response_data)
                    print(f"✅ {endpoint_key} 拉取：第 {batch_idx+1}/{total_batches} 批成功")
                else:
                    print(f"⚠️ {endpoint_key} 响应无数据 (批次 {batch_idx+1})")
            else:
                error_msg = status.get("error_message", "未知错误") if isinstance(status, dict) else "状态格式错误"
                print(f"❌ {endpoint_key} API 错误 (批次 {batch_idx+1}): {error_msg}")

        except requests.exceptions.RequestException as e:
            print(f"❌ {endpoint_key} 请求失败 (批次 {batch_idx+1}): {e}")

        time.sleep(REQUEST_DELAY)

    print(f"✅ {endpoint_key} 数据拉取完成，共获取 {len(data_map)} 个代币的数据")
    return data_map


def fetch_ucids() -> List[int]:
    """获取所有代币的 UCID 列表 (已修改为只获取前 100 个)"""
    print("ℹ️  正在获取前 100 个代币的 UCID (测试模式)...")
    try:
        # 直接发起一次 API 请求，将 limit 参数设置为 100
        response = requests.get(
            url=f"{CMC_CONFIG['base_url']}{CMC_CONFIG['endpoints']['map']}",
            headers=CMC_CONFIG["headers"],
            params={"limit": 100}, # <-- 关键修改在这里
            timeout=15
        )
        response.raise_for_status()

        try:
            data = response.json()
        except ValueError as e:
            print(f"❌ JSON 解析失败: {e}")
            return []

        # 安全地检查响应结构
        if not isinstance(data, dict):
            print(f"❌ 响应格式错误: 期望字典但得到 {type(data)}")
            return []

        status = data.get("status", {})
        if isinstance(status, dict) and status.get("error_code") == 0 and data.get("data"):
            # 从返回的数据中提取 id 列表
            ucids = []
            if isinstance(data["data"], list):
                for coin in data["data"]:
                    if isinstance(coin, dict) and "id" in coin:
                        ucids.append(coin["id"])
                    else:
                        print(f"⚠️ 跳过无效的代币数据: {coin}")
            else:
                print(f"❌ 数据格式错误，期望列表但得到: {type(data['data'])}")
                return []
            print(f"✅ UCID 拉取完成，共 {len(ucids)} 个代币")
            return ucids
        else:
            error_msg = status.get("error_message", "未知错误") if isinstance(status, dict) else "状态格式错误"
            print(f"❌ 获取 UCID 错误：{error_msg}")
            return []

    except requests.exceptions.RequestException as e:
        print(f"❌ UCID 请求失败：{e}")
        return []

def fetch_coin_details(ucids: List[int]) -> Dict[str, Any]:
    """批量获取代币详情"""
    return _fetch_in_batches(ucids, "info")

def fetch_market_data(ucids: List[int]) -> Dict[str, Any]:
    """批量获取市场数据"""
    return _fetch_in_batches(ucids, "quotes", CMC_CONFIG["quotes_params"])

def extract_social_data(links: Dict[str, Any]) -> Dict[str, Any]:
    """提取社交数据"""
    # 检查 links 是否为字典类型
    if not isinstance(links, dict):
        return {"twitter_followers": None, "telegram_members": None}

    # 安全地提取 Twitter 关注者数量
    twitter_data = links.get("twitter", [])
    twitter_followers = None
    if twitter_data and len(twitter_data) > 0:
        # 检查第一个元素是否是字典类型
        first_item = twitter_data[0]
        if isinstance(first_item, dict):
            twitter_followers = first_item.get("followers")

    # 安全地提取 Telegram 成员数量
    telegram_data = links.get("telegram", [])
    telegram_members = None
    if telegram_data and len(telegram_data) > 0:
        # 检查第一个元素是否是字典类型
        first_item = telegram_data[0]
        if isinstance(first_item, dict):
            telegram_members = first_item.get("members")

    return {
        "twitter_followers": twitter_followers,
        "telegram_members": telegram_members
    }

def extract_urls(urls: Dict[str, Any]) -> Dict[str, Any]:
    """提取 URL 信息"""
    # 检查 urls 是否为字典类型
    if not isinstance(urls, dict):
        return {"website": "", "whitepaper": "", "twitter": ""}

    # 安全地提取各种 URL
    website_data = urls.get("website", [])
    website = website_data[0] if website_data and len(website_data) > 0 else ""

    whitepaper_data = urls.get("whitepaper", [])
    whitepaper = whitepaper_data[0] if whitepaper_data and len(whitepaper_data) > 0 else ""

    twitter_data = urls.get("twitter", [])
    twitter = twitter_data[0] if twitter_data and len(twitter_data) > 0 else ""

    return {
        "website": website,
        "whitepaper": whitepaper,
        "twitter": twitter
    }